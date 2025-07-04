package com.possilives.main.DTO;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatisticsDTO {
  @NotNull
  Double averageInfluence;

  @NotNull
  List<StatisticsStreamDTO> stats;
}
