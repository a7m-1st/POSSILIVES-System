package com.possilives.main.DTO;

import lombok.Data;

@Data
public class UserHabitCreateDTO {
    private String userId;
    private String habitId;
    private Boolean isCompleted;
}