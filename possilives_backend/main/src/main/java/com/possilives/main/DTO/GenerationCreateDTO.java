package com.possilives.main.DTO;

import lombok.Data;

@Data
public class GenerationCreateDTO {
    private String userId;
    private String description;
    private String title;
    private String imageLink;
    private String note;
}