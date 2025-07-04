package com.possilives.main.DTO;

import lombok.Data;

@Data
public class UpdateHabitImpactDTO {
    String user_habits_id;
    Integer impact_rating;
    Double average_impact;
}
