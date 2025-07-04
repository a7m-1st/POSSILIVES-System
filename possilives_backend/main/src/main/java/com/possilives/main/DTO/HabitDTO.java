package com.possilives.main.DTO;


import java.time.LocalDate;
import java.util.List;

import com.possilives.main.Model.Big_Five;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HabitDTO {
    @NotNull
    private String title;
    
    @NotNull
    private String description;

    @NotNull
    private List<Big_Five> traits;
}