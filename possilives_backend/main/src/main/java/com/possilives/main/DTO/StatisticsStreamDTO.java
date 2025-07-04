package com.possilives.main.DTO;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatisticsStreamDTO {
  @NotNull
  LocalDateTime date;
  
  @NotNull
  Integer futuresGenerated;

  @NotNull
  Integer habitsCreated;
  @NotNull
  Integer habitsInfluenceChanged;
}