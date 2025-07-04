package com.possilives.main.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.possilives.main.Model.Notifications;
import com.possilives.main.Model.NotificationType;
import com.possilives.main.Model.Personality;
import com.possilives.main.Model.User_Habits;
import com.possilives.main.Model.Users;
import com.possilives.main.Repository.AuditLogRepository;
import com.possilives.main.Repository.NotificationsRepository;
import com.possilives.main.Repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class HabitAnalysisService {
    
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationsRepository notificationsRepository;
    private final NotificationsService notificationsService;
    @Value("${habit.analysis.api.url:http://localhost:5001}")
    private String habitAnalysisApiUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();

    // Run every 12 hours at 8 AM and 8 PM
    @Scheduled(cron = "0 0 8,20 * * *")
    public void analyzeHabitsAndGenerateRecommendations() {
        log.info("Starting habit analysis for all users...");
        
        try {
            List<Users> allUsers = userRepository.findAll();
            
            for (Users user : allUsers) {
                try {
                    analyzeUserHabits(user);
                } catch (Exception e) {
                    log.error("Error analyzing habits for user {}: {}", user.getUser_id(), e.getMessage());
                }
            }
            
            log.info("Completed habit analysis for {} users", allUsers.size());
        } catch (Exception e) {
            log.error("Error in habit analysis process: {}", e.getMessage());
        }
    }
    
    private void analyzeUserHabits(Users user) {
        log.info("Analyzing habits for user: {}", user.getUser_id());
        
        // Skip if user has no habits
        if (user.getUser_habits() == null || user.getUser_habits().isEmpty()) {
            log.debug("User {} has no habits to analyze", user.getUser_id());
            return;
        }
        
        log.info("User {} has {} habits", user.getUser_id(), user.getUser_habits().size());
        
        // Get recent habit changes (last 7 days)
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        List<Object[]> habitChanges = auditLogRepository.getHabitChangesForUser(user.getUser_id(), oneWeekAgo);
        
        log.info("Found {} recent habit changes for user {}", habitChanges.size(), user.getUser_id());
        
        // Generate recommendations even if no recent changes (for users with existing habits)
        // This allows for periodic insights even without recent activity
        String analysisData = prepareHabitAnalysisData(user, habitChanges);
        
        // Generate recommendations using Gemini AI
        log.info("Calling AI service for recommendations for user: {}", user.getUser_id());
        String recommendations = generateAIRecommendations(analysisData);
        
        if (recommendations != null && !recommendations.trim().isEmpty()) {
            try {
                // Create and save notification
                createHabitRecommendationNotification(user, recommendations);
                log.info("Successfully generated and sent habit recommendations for user: {}", user.getUser_id());
            } catch (Exception e) {
                log.error("Failed to send notification for user {}: {}", user.getUser_id(), e.getMessage(), e);
            }
        } else {
            log.warn("No recommendations generated for user: {} - AI service returned empty/null response", user.getUser_id());
        }
    }
    
    private String prepareHabitAnalysisData(Users user, List<Object[]> habitChanges) {
        StringBuilder data = new StringBuilder();
        
        // Add user personality information
        if (user.getPersonalities() != null && !user.getPersonalities().isEmpty()) {
            Personality latestPersonality = user.getPersonalities().stream()
                .max((p1, p2) -> p1.getCreatedAt().compareTo(p2.getCreatedAt()))
                .orElse(null);
                
            if (latestPersonality != null) {
                data.append("User Personality Profile:\n");
                data.append("- Openness: ").append(latestPersonality.getOpenness()).append("/100\n");
                data.append("- Conscientiousness: ").append(latestPersonality.getConscientiousness()).append("/100\n");
                data.append("- Extraversion: ").append(latestPersonality.getExtraversion()).append("/100\n");
                data.append("- Agreeableness: ").append(latestPersonality.getAgreeableness()).append("/100\n");
                data.append("- Neuroticism: ").append(latestPersonality.getNeuroticism()).append("/100\n\n");
            }
        }
        
        // Add current habits
        data.append("Current Habits:\n");
        for (User_Habits userHabit : user.getUser_habits()) {
            data.append("- ").append(userHabit.getHabit().getTitle())
                .append(" (Impact Rating: ").append(userHabit.getImpact_rating()).append("/10")
                .append(", Average Impact: ").append(userHabit.getAverage_impact() != null ? userHabit.getAverage_impact() : "N/A")
                .append(")\n");
        }        data.append("\n");
        
        // Add recent habit changes
        data.append("Recent Habit Changes (Last 7 days):\n");
        for (Object[] change : habitChanges) {
            LocalDateTime changeDate = convertToLocalDateTime(change[0]);
            String action = (String) change[1];
            String habitTitle = change[2] != null ? (String) change[2] : "Unknown Habit";
            Integer newImpact = change[3] != null ? (Integer) change[3] : null;
            
            data.append("- ").append(changeDate.toLocalDate()).append(": ");
            
            switch (action) {
                case "C":
                    data.append("Created new habit: ").append(habitTitle);
                    break;
                case "U":
                    data.append("Updated impact rating for ").append(habitTitle)
                        .append(" to ").append(newImpact != null ? newImpact : "unknown");
                    break;
                case "D":
                    data.append("Deleted habit: ").append(habitTitle);
                    break;
                default:
                    data.append("Modified habit: ").append(habitTitle);
            }
            data.append("\n");
        }
        
        return data.toString();
    }
      private String generateAIRecommendations(String analysisData) {
        try {
            log.info("Generating AI recommendations using service at: {}", habitAnalysisApiUrl);
            String prompt = buildAnalysisPrompt(analysisData);
            
            // Prepare request body for Python AI service
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("prompt", prompt);
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
              // Make API call to Python service
            String url = habitAnalysisApiUrl + "/analyze-habits";
            log.info("Making request to AI service: {}", url);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, 
                HttpMethod.POST, 
                entity, 
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            log.info("AI service response status: {}", response.getStatusCode());
            
            if (response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Boolean success = (Boolean) responseBody.get("success");
                
                log.info("AI service success status: {}", success);
                
                if (Boolean.TRUE.equals(success)) {
                    String recommendations = (String) responseBody.get("recommendations");
                    log.info("AI service returned recommendations of length: {}", 
                        recommendations != null ? recommendations.length() : 0);
                    return recommendations;
                } else {
                    log.error("AI service returned error: {}", responseBody.get("error"));
                }
            } else {
                log.error("AI service returned null response body");
            }
            
        } catch (Exception e) {
            log.error("Error calling AI analysis service: {}", e.getMessage(), e);
        }
        
        return null;
    }
    
    private String buildAnalysisPrompt(String analysisData) {
        return """
            You are a personal development coach and habit specialist. Analyze the following user data and provide personalized habit recommendations.
            
            User Data:
            %s
            
            Based on this information, please provide:
            
            1. **Habit Pattern Analysis**: What patterns do you notice in their recent habit changes?
            2. **Personalized Recommendations**: Suggest 2-3 specific, actionable habit improvements based on their personality and current habits.
            3. **Implementation Tips**: Provide practical advice on how to implement these recommendations.
            4. **Motivation**: Include encouraging words tailored to their personality profile.
            
            Keep your response concise (under 300 words) and focus on actionable insights that will help them improve their daily routines and overall well-being.
              Format your response in a friendly, encouraging tone as if you're their personal coach.
            """.formatted(analysisData);
    }
      private void createHabitRecommendationNotification(Users user, String recommendations) {
        String title = "🎯 Personalized Habit Insights";
        
        try {
            log.info("Creating notification for user: {} with title: {}", user.getUser_id(), title);
            
            // Send email and save notification using NotificationsService
            notificationsService.sendEmailAndSaveNotification(
                user.getUser_id(), 
                null, // No sender for system-generated notifications
                title,
                recommendations,
                null // No specific link for habit recommendations
            );
            
            log.info("Successfully called NotificationsService for user: {}", user.getUser_id());
            
            // Update the notification type to RECOMMENDATION
            // Find the most recent notification for this user and update its type
            List<Notifications> userNotifications = notificationsRepository.findByReciever(user);
            log.info("Found {} existing notifications for user: {}", userNotifications.size(), user.getUser_id());
            
            if (!userNotifications.isEmpty()) {
                Notifications latestNotification = userNotifications.stream()
                    .max((n1, n2) -> n1.getCreatedAt().compareTo(n2.getCreatedAt()))
                    .orElse(null);
                
                if (latestNotification != null && latestNotification.getTitle().equals(title)) {
                    latestNotification.setType(NotificationType.RECOMMENDATION);
                    notificationsRepository.save(latestNotification);
                    log.info("Updated notification type to RECOMMENDATION for user: {}", user.getUser_id());
                } else {
                    log.warn("Could not find matching notification to update type for user: {}", user.getUser_id());
                }
            } else {
                log.warn("No notifications found for user after creating: {}", user.getUser_id());
            }
            
            log.info("Successfully created habit recommendation notification and sent email for user: {}", user.getUser_id());
        } catch (Exception e) {
            log.error("Error creating notification for user {}: {}", user.getUser_id(), e.getMessage(), e);
            throw e; // Re-throw to be caught by the calling method
        }
    }
    
    // Manual trigger for testing (can be called via API endpoint)
    public void triggerHabitAnalysisForUser(String userId) {
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        analyzeUserHabits(user);
    }
    
    // Test method to debug notification issues
    public Map<String, Object> testHabitAnalysisForUser(String userId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            result.put("userId", userId);
            result.put("userEmail", user.getEmail());
            result.put("hasHabits", user.getUser_habits() != null && !user.getUser_habits().isEmpty());
            result.put("habitCount", user.getUser_habits() != null ? user.getUser_habits().size() : 0);
            
            if (user.getUser_habits() != null && !user.getUser_habits().isEmpty()) {
                LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
                List<Object[]> habitChanges = auditLogRepository.getHabitChangesForUser(user.getUser_id(), oneWeekAgo);
                result.put("recentChanges", habitChanges.size());
                
                String analysisData = prepareHabitAnalysisData(user, habitChanges);
                result.put("analysisDataLength", analysisData.length());
                result.put("analysisData", analysisData.substring(0, Math.min(200, analysisData.length())) + "...");
                
                // Test AI service call
                String recommendations = generateAIRecommendations(analysisData);
                result.put("aiServiceWorking", recommendations != null && !recommendations.trim().isEmpty());
                result.put("recommendationsLength", recommendations != null ? recommendations.length() : 0);
                
                if (recommendations != null && !recommendations.trim().isEmpty()) {
                    // Test notification creation
                    try {
                        createHabitRecommendationNotification(user, recommendations);
                        result.put("notificationSent", true);
                    } catch (Exception e) {
                        result.put("notificationSent", false);
                        result.put("notificationError", e.getMessage());
                    }
                } else {
                    result.put("notificationSent", false);
                    result.put("reason", "No recommendations from AI service");
                }
            } else {
                result.put("notificationSent", false);
                result.put("reason", "User has no habits");
            }
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    // Get habit statistics for a user
    public Map<String, Object> getHabitStatistics(String userId) {
        Map<String, Object> stats = new HashMap<>();
        
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        // Basic habit statistics
        List<User_Habits> habits = user.getUser_habits();
        stats.put("totalHabits", habits.size());
        
        if (!habits.isEmpty()) {
            double avgImpact = habits.stream()
                .mapToInt(User_Habits::getImpact_rating)
                .average()
                .orElse(0.0);
            stats.put("averageImpactRating", Math.round(avgImpact * 100.0) / 100.0);
            
            // Count habits by impact level
            long highImpact = habits.stream().filter(h -> h.getImpact_rating() >= 8).count();
            long mediumImpact = habits.stream().filter(h -> h.getImpact_rating() >= 5 && h.getImpact_rating() < 8).count();
            long lowImpact = habits.stream().filter(h -> h.getImpact_rating() < 5).count();
            
            stats.put("highImpactHabits", highImpact);
            stats.put("mediumImpactHabits", mediumImpact);
            stats.put("lowImpactHabits", lowImpact);        }
        
        // Recent activity (last 7 days)
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        List<Object[]> recentChanges = auditLogRepository.getHabitChangesForUser(userId, oneWeekAgo);
        stats.put("recentChanges", recentChanges.size());
        
        return stats;
    }
    
    // Helper method to convert database timestamp objects to LocalDateTime
    private LocalDateTime convertToLocalDateTime(Object date) {
        if (date instanceof java.sql.Timestamp ts) {
            return ts.toLocalDateTime();
        } else if (date instanceof LocalDateTime dt) {
            return dt;
        } else {
            throw new IllegalStateException("Unexpected type for date: " + date.getClass());
        }
    }
}
