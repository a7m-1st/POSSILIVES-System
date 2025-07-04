package com.possilives.main.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class HabitValidationService {
    
    @Value("${gemini.validation.url:http://localhost:8000}")
    private String geminiValidationUrl;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ValidationResult validateHabit(String title, String description, List<String> existingHabitTitles) {
        try {
            // Prepare validation request
            Map<String, Object> request = new HashMap<>();
            request.put("title", title);
            request.put("description", description);
            request.put("existing_habits", existingHabitTitles);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            // Call Gemini validation API
            ResponseEntity<String> response = restTemplate.postForEntity(
                geminiValidationUrl + "/validate-habit", 
                entity, 
                String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                
                boolean isValid = responseJson.get("is_valid").asBoolean();
                String reason = responseJson.has("reason") ? responseJson.get("reason").asText() : null;
                String suggestion = responseJson.has("suggestion") ? responseJson.get("suggestion").asText() : null;
                
                return new ValidationResult(isValid, reason, suggestion);
            } else {
                log.error("Gemini validation service returned error: {}", response.getStatusCode());
                return new ValidationResult(false, "Validation service unavailable", null);
            }
            
        } catch (Exception e) {
            log.error("Error validating habit with Gemini: ", e);
            // Fallback to basic validation if Gemini service is down
            return fallbackValidation(title, description, existingHabitTitles);
        }
    }
    
    private ValidationResult fallbackValidation(String title, String description, List<String> existingHabitTitles) {
        // Basic validation as fallback
        if (title == null || title.trim().isEmpty()) {
            return new ValidationResult(false, "Habit title cannot be empty", null);
        }
        
        if (title.trim().length() < 3) {
            return new ValidationResult(false, "Habit title must be at least 3 characters long", null);
        }
        
        if (title.trim().length() > 100) {
            return new ValidationResult(false, "Habit title must be less than 100 characters", null);
        }
        
        // Check for duplicates (case-insensitive)
        boolean isDuplicate = existingHabitTitles.stream()
            .anyMatch(existing -> existing.trim().equalsIgnoreCase(title.trim()));
        
        if (isDuplicate) {
            return new ValidationResult(false, "A habit with this title already exists", 
                "Try modifying the title to make it more specific");
        }
        
        // Basic NSFW check (simple keyword filtering)
        String[] nsfwKeywords = {"sex", "porn", "nude", "explicit", "adult", "xxx"};
        String lowerTitle = title.toLowerCase();
        String lowerDesc = description != null ? description.toLowerCase() : "";
        
        for (String keyword : nsfwKeywords) {
            if (lowerTitle.contains(keyword) || lowerDesc.contains(keyword)) {
                return new ValidationResult(false, "Habit content is not appropriate", 
                    "Please create a habit focused on positive personal development");
            }
        }
        
        return new ValidationResult(true, null, null);
    }
    
    public static class ValidationResult {
        private final boolean valid;
        private final String reason;
        private final String suggestion;
        
        public ValidationResult(boolean valid, String reason, String suggestion) {
            this.valid = valid;
            this.reason = reason;
            this.suggestion = suggestion;
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public String getReason() {
            return reason;
        }
        
        public String getSuggestion() {
            return suggestion;
        }
    }
}
