package com.possilives.main.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.possilives.main.Model.Notifications;
import com.possilives.main.Model.NotificationType;
import com.possilives.main.Model.Users;

public interface NotificationsRepository extends JpaRepository<Notifications, String> {
  public List<Notifications> findByReciever(Users reciever);
  public List<Notifications> findByRecieverAndType(Users reciever, NotificationType type);
}
