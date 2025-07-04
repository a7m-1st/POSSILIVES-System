package com.possilives.main.Service;

import java.sql.Date;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.possilives.main.Audit.Auditable;
import com.possilives.main.Model.Notifications;
import com.possilives.main.Model.NotificationType;
import com.possilives.main.Model.Users;
import com.possilives.main.Repository.NotificationsRepository;
import com.possilives.main.Repository.UserRepository;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationsService {
  private final NotificationsRepository notificationsRepository;
  private final UserRepository userRepository;
  private final JavaMailSender mailSender;
  
  // This method is now handled by HabitAnalysisService
  // @Scheduled(cron = "0 0 8,20 * * *") // Runs every 12 hours at 8 AM and 8 PM
  // protected void processRecommendations() {
  //   // This functionality has been moved to HabitAnalysisService
  //   // for more intelligent habit-based recommendations
  // }

  // Send notifications
  protected void sendEmail(String receiverEmail, String title, String description, String link) {
    try {
      MimeMessage mimeMessage = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

      helper.setTo(receiverEmail);
      helper.setSubject(title);

      // Build email content
      StringBuilder content = new StringBuilder(description);
      if (link != null && !link.trim().isEmpty()) {
        content.append("\n\n").append(link);
      }

      helper.setText(content.toString());

      mailSender.send(mimeMessage);
    } catch (Exception e) {
      throw new RuntimeException("Failed to send email", e);
    }
  }

  @Auditable
  public void sendEmailAndSaveNotification(String recieveToId, String sendById, String title, String description,String link) {
    // Users fromUserId = userRepository.findById(sendById)
    //     .orElseThrow(() -> new RuntimeException("User not found"));
    Users toUserId = userRepository.findById(recieveToId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    // Send Email
    sendEmail(toUserId.getEmail(), title, description, link);    // Save Notification
    // 2. Save the notification in the database
    Notifications notification = new Notifications();
    notification.setTitle(title);
    notification.setDescription(description);
    notification.setSentEmail(true);
    notification.setSeen(false);
    // Use Malaysia timezone for consistent time
    notification.setCreatedAt(ZonedDateTime.now(ZoneId.of("Asia/Kuala_Lumpur")).toLocalDateTime());
    notification.setReciever(toUserId); // Assuming email as user ID for simplicity
    // notification.setSender(fromUserId);

    System.out.println("Sending email to "+ toUserId.getEmail());

    notificationsRepository.save(notification);
  }

  // Update Notification Read Status
  @Auditable
  public void updateNotifcationReadStatus(String userId, String notifId) {
    Users reciever = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    List<Notifications> notifications = notificationsRepository.findByReciever(reciever);
    Notifications notification = notifications.stream()
        .filter(notif -> notif.getNotif_id().equals(notifId))
        .findFirst()
        .orElseThrow(() -> new RuntimeException("Notification not found"));

    if(notification == null || notification.getSeen()) {
      return;
    }
    notification.setSeen(true);
    notificationsRepository.save(notification);
  }

  // Get Notification by Id
  public Notifications getNotificationById(String userId, String notifId) {
    Users reciever = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    List<Notifications> notifications = notificationsRepository.findByReciever(reciever);
    Notifications notification = notifications.stream()
        .filter(notif -> notif.getNotif_id().equals(notifId))
        .findFirst()
        .orElseThrow(() -> new RuntimeException("Notification not found"));

    //Mark as read
    updateNotifcationReadStatus(userId, notifId);
    return notification;
  }
  // Get All Notifications
  public List<Notifications> getAllNotifications(String userId) {
    Users reciever = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    return notificationsRepository.findByReciever(reciever);
  }
  
  // Get Recommendation Notifications only
  public List<Notifications> getRecommendationNotifications(String userId) {
    Users reciever = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    return notificationsRepository.findByRecieverAndType(reciever, NotificationType.RECOMMENDATION);
  }
}
