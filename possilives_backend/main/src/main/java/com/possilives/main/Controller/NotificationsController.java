package com.possilives.main.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.possilives.main.Model.Notifications;
import com.possilives.main.Service.NotificationsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin("*")
public class NotificationsController {
  private final NotificationsService notificationsService;
  @GetMapping("/{userId}")
  public ResponseEntity<List<Notifications>> getNotifications(@PathVariable String userId) {
    return ResponseEntity.ok(notificationsService.getAllNotifications(userId));
  }

  @GetMapping("/read/{userId}/{notifId}")
  public ResponseEntity<Notifications> getNotificationById(@PathVariable String userId, @PathVariable String notifId) {
    return ResponseEntity.ok(notificationsService.getNotificationById(userId, notifId));
  }

  @GetMapping("/recommendations/{userId}")
  public ResponseEntity<List<Notifications>> getRecommendationNotifications(@PathVariable String userId) {
    return ResponseEntity.ok(notificationsService.getRecommendationNotifications(userId));
  }
}
