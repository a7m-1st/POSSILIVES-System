package com.possilives.main.Model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.possilives.main.Model.enums.ACTION_TYPES;
import com.possilives.main.Model.enums.TARGET_TYPES;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "auditlog")
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String auditlog_id;

  @Enumerated(EnumType.STRING)
  private TARGET_TYPES target;
  
  //Method Signature
  private String signature;

  @Enumerated(EnumType.STRING)
  private ACTION_TYPES action;
  private LocalDateTime createdAt;
  
  @Column(name = "habit_impact")
  private Integer habit_impact;

  @ManyToOne
  private Users auditBy;

  // Explicit getter and setter for habit_impact to ensure proper JPA mapping
  public Integer getHabit_impact() {
    return habit_impact;
  }

  public void setHabit_impact(Integer habit_impact) {
    this.habit_impact = habit_impact;
  }

  @Override
  public String toString() {
    return "AuditLog [auditlog_id=" + auditlog_id + ", target=" + target + ", signature=" + signature + ", action="
        + action + ", createdAt=" + createdAt + ", habit_impact=" + habit_impact + ", auditBy=" + auditBy.getUser_id() + "]";
  }
}