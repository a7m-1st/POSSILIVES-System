package com.possilives.main.Service;

import com.possilives.main.Model.Users;
import com.possilives.main.Repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final NotificationsService notificationsService;

    public Integer generateVerificationCode() {
        return (int) (Math.random() * 9000) + 1000;
    }

    public Users createUser(Users users) {
        Users savedUser = null;

        Integer code = generateVerificationCode();
        Optional<Users> present = userRepository.findByEmail(users.getEmail());

        if(present.isPresent()){
            present.get().setVerification_code(code);
            present.get().setVerification_createdAt(LocalDate.now());
            userRepository.save(present.get());
            //Send email
            notificationsService.sendEmailAndSaveNotification(present.get().getUser_id(), "shopmy.official@gmail.com", "POSSILIVES CODE Ready to change your life?", "Welcome to possilives, use this code to verify your account: "+code, "http://localhost:8080/verify?userId="+present.get().getUser_id()+"&verificationCode="+code);
        } else {
            users.setCreatedAt(LocalDate.now());
            users.setVerification_code(code);
            users.setVerification_createdAt(LocalDate.now());
            savedUser = userRepository.save(users);
            notificationsService.sendEmailAndSaveNotification(savedUser.getUser_id(), "shopmy.official@gmail.com", "POSSILIVES CODE Ready to change your life?", "Welcome to possilives, use this code to verify your account: "+code, "http://localhost:8080/verify?userId="+savedUser.getUser_id()+"&verificationCode="+code);
        }

        return savedUser==null?present.get():savedUser;
    }

    public String initUser(Users user) {
        Optional<Users> present = userRepository.findByKeycloakId(user.getKeycloakId());
        String userId = null;

        if(present.isPresent()) {
            userId = present.get().getUser_id();
        } else {
            userId = userRepository.save(user).getUser_id();
        }

        return userId;
    }

    public Optional<Users> getUserById(String id) {
        return userRepository.findById(id);
    }

    public Optional<Users> getUserbyKeycoakId(String id) {
        return userRepository.findByKeycloakId(id);
    }

    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    //Given JWT Authentication get UserId
    public Optional<Users> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return Optional.of(null);

        // Assuming username is stored as principal
        String keycloakId = auth.getName(); // or extract from UserDetails

        // Fetch from DB
        return getUserbyKeycoakId(keycloakId);
    }

    public boolean verifyUser(String userId, Integer verificationCode) {
        //Set notification as read too
        Optional<Users> user = userRepository.findById(userId);
        if (user.isPresent() && verificationCode.equals(user.get().getVerification_code())) {
            Users verifiedUser = user.get();
            verifiedUser.setIs_verified(true);
            userRepository.save(verifiedUser);

            //Update Notification
            String notificationId = user.get().getRecievedNotificationList()
                .stream()
                .filter(item -> item.getTitle().equals("POSSILIVES CODE Ready to change your life?"))
                .reduce((first, second) -> second)
                .get()
                .getNotif_id();

            notificationsService.updateNotifcationReadStatus(userId, notificationId);
            return true;
        }
        return false;
    }

    public Users updateUser(Users user) {
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
}
