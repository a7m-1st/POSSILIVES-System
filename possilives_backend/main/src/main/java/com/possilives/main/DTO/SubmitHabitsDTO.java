package com.possilives.main.DTO;

import lombok.Data;
import java.util.List;

@Data
public class SubmitHabitsDTO {
    private String userId;
    private List<String> habits;  // List of habit IDs
}