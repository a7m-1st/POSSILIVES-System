package com.possilives.main.Controller;

import com.possilives.main.DTO.AuditLogRequestDTO;
import com.possilives.main.DTO.StatisticsDTO;
import com.possilives.main.Model.enums.ACTION_TYPES;
import com.possilives.main.Model.enums.TARGET_TYPES;
import com.possilives.main.Service.AuditLogService;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuditLogController {
    private final AuditLogService auditLogService;
    
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/statistics")
    public ResponseEntity<List<StatisticsDTO>> getStatistics(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody AuditLogRequestDTO requestDTO) {
        
        // Get keycloakId from JWT
        String keycloakId = jwt.getSubject();
        
        // Call service with parameters from request
        List<StatisticsDTO> statistics = auditLogService.getAuditAggregation(
            keycloakId,
            requestDTO.getAction(),
            requestDTO.getTarget(),
            requestDTO.getStartTime(),
            requestDTO.getEndTime()
        );
        
        return ResponseEntity.ok(statistics);
    }
    
    // Alternative API that uses path variables instead of request body
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/statistics/{action}/{target}")
    public ResponseEntity<List<StatisticsDTO>> getStatisticsGet(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable(required = false) ACTION_TYPES action,
            @PathVariable(required = false) TARGET_TYPES target,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        // Get keycloakId from JWT
        String keycloakId = jwt.getSubject();
        
        // Call service
        // Add one day to end time to include the entire day
        LocalDateTime adjustedEndTime = endTime.plusDays(1);
        
        List<StatisticsDTO> statistics = auditLogService.getAuditAggregation(
            keycloakId, 
            action, 
            target, 
            startTime, 
            adjustedEndTime
        );
        
        return ResponseEntity.ok(statistics);
    }
}