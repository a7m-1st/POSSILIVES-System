package com.possilives.main.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.possilives.main.DTO.StatisticsDTO;
import com.possilives.main.DTO.StatisticsStreamDTO;
import com.possilives.main.Model.enums.ACTION_TYPES;
import com.possilives.main.Model.enums.TARGET_TYPES;
import com.possilives.main.Repository.AuditLogRepository;
import com.possilives.main.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditLogService {
  private final AuditLogRepository auditLogRepository;
  private final UserRepository userRepository;
  
  public List<StatisticsDTO> getAuditAggregation(String keycloakId, ACTION_TYPES action, TARGET_TYPES target, LocalDateTime startTime, LocalDateTime endTime) {
    String userId = userRepository.findByKeycloakId(keycloakId).get().getUser_id();
    // Get raw aggregation data from repository
    List<Object[]> aggregatedData = auditLogRepository.getAuditLogAggregation(userId, startTime, endTime);
    
    // Group data by date
    Map<LocalDateTime, StatisticsStreamDTO> statsByDate = new HashMap<>();
    double totalInfluence = 0.0;
    int totalInfluenceCount = 0;
      // Process aggregation results
    for (Object[] row : aggregatedData) {
        LocalDateTime date = convertToLocalDateTime(row[0]);
        ACTION_TYPES rowAction = ACTION_TYPES.valueOf(row[1].toString());
        TARGET_TYPES rowTarget = TARGET_TYPES.valueOf(row[2].toString());
        Long count = (Long) row[3];
        Double influenceValue = row.length > 4 ? convertToDouble(row[4]) : null;
        
        // Create statistics entry for this date if it doesn't exist
        StatisticsStreamDTO dateStats = statsByDate.computeIfAbsent(date, k -> {
            StatisticsStreamDTO stats = new StatisticsStreamDTO();
            stats.setDate(date);
            stats.setFuturesGenerated(0);
            stats.setHabitsCreated(0);
            stats.setHabitsInfluenceChanged(0);
            return stats;
        });
          // Update counters based on action and target type
        if (rowAction == ACTION_TYPES.C && rowTarget == TARGET_TYPES.GENERATION) {
            dateStats.setFuturesGenerated(dateStats.getFuturesGenerated() + count.intValue());
        } else if (rowAction == ACTION_TYPES.C && rowTarget == TARGET_TYPES.USERHABIT) {
            dateStats.setHabitsCreated(dateStats.getHabitsCreated() + count.intValue());
        } else if (rowAction == ACTION_TYPES.U && (rowTarget == TARGET_TYPES.INFLUENCE || rowTarget == TARGET_TYPES.USERHABIT)) {
            // Handle both INFLUENCE and USERHABIT targets for updates (since influence updates might be logged as USERHABIT)
            dateStats.setHabitsInfluenceChanged(dateStats.getHabitsInfluenceChanged() + count.intValue());
            
            // Track influence values for average calculation
            if (influenceValue != null) {
                totalInfluence += influenceValue * count;
                totalInfluenceCount += count;
            }
        }
    }
    
    // Calculate average influence
    double averageInfluence = totalInfluenceCount > 0 ? totalInfluence / totalInfluenceCount : 0.0;
    
    // Create and return final StatisticsDTO
    StatisticsDTO result = new StatisticsDTO();
    result.setAverageInfluence(averageInfluence);
    result.setStats(new ArrayList<>(statsByDate.values()));
    
    return List.of(result);
  }

  protected LocalDateTime convertToLocalDateTime(Object date) {
    if (date instanceof Timestamp ts) {
        date = ts.toLocalDateTime();
    } else if (date instanceof LocalDateTime dt) {
        date = dt;
    } else {
      throw new IllegalStateException("Unexpected type for date: " + date.getClass());
    }
    
    return (LocalDateTime) date;
  }

  protected Double convertToDouble(Object value) {
    if (value == null) {
        return null;
    } else if (value instanceof Double d) {
        return d;
    } else if (value instanceof java.math.BigDecimal bd) {
        return bd.doubleValue();
    } else if (value instanceof Number n) {
        return n.doubleValue();
    } else {
        throw new IllegalStateException("Unexpected type for numeric value: " + value.getClass());
    }
  }
}
