package com.possilives.main.DTO;

import com.possilives.main.Model.enums.ACTION_TYPES;
import com.possilives.main.Model.enums.TARGET_TYPES;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditLogRequestDTO {
    private ACTION_TYPES action;
    private TARGET_TYPES target;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}