package com.possilives.main.Model;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
@Table(name = "notifications")
@NoArgsConstructor
@AllArgsConstructor
public class Notifications {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String notif_id;

  @Column(length = 500)
  String title;
  @Column(columnDefinition = "TEXT")
  String description;
  Boolean sentEmail;

  @Column(name = "seen", nullable = false)
  Boolean seen = false;

  @Column(name = "type", nullable = false)
  @Enumerated(EnumType.ORDINAL)
  NotificationType type = NotificationType.SYSTEM;

  @Column(length = 1000)
  String link;  Boolean deleted;
  
  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS", timezone = "Asia/Kuala_Lumpur")
  LocalDateTime updatedAt;
  
  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS", timezone = "Asia/Kuala_Lumpur")
  LocalDateTime createdAt;

  @JsonIgnore
  @ManyToOne
  Users sender;

  @JsonIgnore
  @ManyToOne
  Users reciever;
}
