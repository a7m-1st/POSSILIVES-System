package com.possilives.main;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.possilives.main.Model.Notifications;
import com.possilives.main.Model.Users;
import com.possilives.main.Repository.UserRepository;
import com.possilives.main.Service.NotificationsService;
import com.possilives.main.Service.UserService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class UserServiceAndNotificationTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationsService notificationsService;

    @InjectMocks
    private UserService userService;

    private Users testUser;
    private Notifications testNotification;

    @BeforeEach
    void setUp() {
        testUser = new Users();
        testUser.setUser_id("user123");
        testUser.setEmail("test@example.com");
        testUser.setVerification_code(1234);
        testUser.setVerification_createdAt(LocalDate.now());
        testUser.setIs_verified(false);

        testNotification = new Notifications();
        testNotification.setNotif_id("notif123");
        testNotification.setTitle("POSSILIVES CODE Ready to change your life?");
        List<Notifications> notifications = new ArrayList<>();
        notifications.add(testNotification);
        testUser.setRecievedNotificationList(notifications);
    }

    @Test
    void createUser_NewUser_Success() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userRepository.save(any(Users.class))).thenReturn(testUser);
        doNothing().when(notificationsService).sendEmailAndSaveNotification(
            anyString(), anyString(), anyString(), anyString(), anyString());

        Users result = userService.createUser(testUser);

        assertNotNull(result);
        assertEquals(testUser.getUser_id(), result.getUser_id());
        assertEquals(LocalDate.now(), result.getCreatedAt());
        assertNotNull(result.getVerification_code());
        verify(notificationsService).sendEmailAndSaveNotification(
            anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void createUser_ExistingUser_Success() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(Users.class))).thenReturn(testUser);
        doNothing().when(notificationsService).sendEmailAndSaveNotification(
            anyString(), anyString(), anyString(), anyString(), anyString());

        Users result = userService.createUser(testUser);

        assertNotNull(result);
        assertEquals(testUser.getUser_id(), result.getUser_id());
        assertNotNull(result.getVerification_code());
        verify(notificationsService).sendEmailAndSaveNotification(
            anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void getUserById_Success() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));

        Optional<Users> result = userService.getUserById("user123");

        assertTrue(result.isPresent());
        assertEquals(testUser, result.get());
    }

    @Test
    void getUserById_NotFound() {
        when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

        Optional<Users> result = userService.getUserById("nonexistent");

        assertFalse(result.isPresent());
    }

    @Test
    void getAllUsers_Success() {
        List<Users> usersList = List.of(testUser);
        when(userRepository.findAll()).thenReturn(usersList);

        List<Users> result = userService.getAllUsers();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testUser, result.get(0));
    }

    @Test
    void verifyUser_Success() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(Users.class))).thenReturn(testUser);
        doNothing().when(notificationsService).updateNotifcationReadStatus(anyString(), anyString());

        boolean result = userService.verifyUser("user123", 1234);

        assertTrue(result);
        assertTrue(testUser.getIs_verified());
        verify(notificationsService).updateNotifcationReadStatus("user123", "notif123");
    }

    @Test
    void verifyUser_WrongCode() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));

        boolean result = userService.verifyUser("user123", 5678);

        assertFalse(result);
        assertFalse(testUser.getIs_verified());
        verify(notificationsService, never()).updateNotifcationReadStatus(anyString(), anyString());
    }

    @Test
    void verifyUser_UserNotFound() {
        when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

        boolean result = userService.verifyUser("nonexistent", 1234);

        assertFalse(result);
        verify(notificationsService, never()).updateNotifcationReadStatus(anyString(), anyString());
    }

    @Test
    void updateUser_Success() {
        when(userRepository.save(any(Users.class))).thenReturn(testUser);

        Users result = userService.updateUser(testUser);

        assertNotNull(result);
        assertEquals(testUser, result);
    }

    @Test
    void deleteUser_Success() {
        doNothing().when(userRepository).deleteById("user123");

        userService.deleteUser("user123");

        verify(userRepository).deleteById("user123");
    }

    @Test
    void generateVerificationCode_RangeCheck() {
        // Test multiple times to ensure the code is within range
        for (int i = 0; i < 100; i++) {
            Integer code = userService.generateVerificationCode();
            assertTrue(code >= 1000 && code <= 9999);
        }
    }
}