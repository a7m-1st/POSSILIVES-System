package com.possilives.main.DTO;

import lombok.Data;

@Data
public class ProfileUpdateDTO {
    private String username;
    private Integer age;
    private String current_career;
    private String future_career;
    private String relationship_status;
    private String social_circle;
}