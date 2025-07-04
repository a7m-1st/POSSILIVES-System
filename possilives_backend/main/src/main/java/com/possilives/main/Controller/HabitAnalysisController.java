package com.possilives.main.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.possilives.main.Model.Users;
import com.possilives.main.Repository.UserRepository;
import com.possilives.main.Service.HabitAnalysisService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/habit-analysis")
@RequiredArgsConstructor
@CrossOrigin("*")
public class HabitAnalysisController {
    
    private final HabitAnalysisService habitAnalysisService;
    private final UserRepository userRepository;
    
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/trigger")
    public ResponseEntity<String> triggerHabitAnalysis(@AuthenticationPrincipal Jwt jwt) {
        try {
            String keycloakId = jwt.getSubject();
            Users user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            habitAnalysisService.triggerHabitAnalysisForUser(user.getUser_id());
            
            return ResponseEntity.ok("Habit analysis triggered successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error triggering habit analysis: " + e.getMessage());
        }
    }
    
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getHabitStatistics(@AuthenticationPrincipal Jwt jwt) {
        try {
            String keycloakId = jwt.getSubject();
            Users user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Map<String, Object> statistics = habitAnalysisService.getHabitStatistics(user.getUser_id());
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
