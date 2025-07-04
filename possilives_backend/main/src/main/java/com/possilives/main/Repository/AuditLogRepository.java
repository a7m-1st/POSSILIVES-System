package com.possilives.main.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.possilives.main.Model.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, String> {  @Query(value = "SELECT DATE_TRUNC('day', a.created_at) as date, a.action, a.target, " +
               "COUNT(*) as count, AVG(a.habit_impact) as avg_influence " +
               "FROM auditlog a " +
               "WHERE a.audit_by_user_id = :userId " +
               "AND a.created_at BETWEEN :startTime AND :endTime " +
               "GROUP BY DATE_TRUNC('day', a.created_at), a.action, a.target", 
       nativeQuery = true)
  List<Object[]> getAuditLogAggregation(String userId, LocalDateTime startTime, LocalDateTime endTime);
  @Query(value = "SELECT CAST(a.created_at AS timestamp), a.action, " +
               "CASE WHEN a.target = 'USERHABIT' THEN h.title ELSE 'Unknown' END as habit_title, " +
               "a.habit_impact " +
               "FROM auditlog a " +
               "LEFT JOIN user_habits uh ON a.signature LIKE '%' || uh.user_habits_id || '%' " +
               "LEFT JOIN habit h ON uh.habit_habit_id = h.habit_id " +
               "WHERE a.audit_by_user_id = :userId " +
               "AND a.created_at >= :startTime " +
               "AND a.target IN ('USERHABIT', 'INFLUENCE') " +
               "ORDER BY a.created_at DESC", 
       nativeQuery = true)
  List<Object[]> getHabitChangesForUser(String userId, LocalDateTime startTime);
}
