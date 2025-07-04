package com.possilives.main.Controller;

import com.possilives.main.DTO.PersonalityUpdateDTO;
import com.possilives.main.DTO.ProfileUpdateDTO;
import com.possilives.main.DTO.UserDTO;
import com.possilives.main.Model.Personality;
import com.possilives.main.Model.Users;
import com.possilives.main.Service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin("*")
public class UserController {
    private final UserService userService;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/initUser")
    public ResponseEntity<String> initUser(@AuthenticationPrincipal Jwt jwt) {
        Users user = new Users();
        user.setKeycloakId(jwt.getSubject());
        user.setEmail(jwt.getClaimAsString("email"));
        
        //Other Data
        user.setUsername(jwt.getClaimAsString("preferred_username"));
        user.setIs_verified(jwt.getClaimAsBoolean("email_verified"));

        // Verification code
        // user.setVerification_code(generateVerificationCode());
        return ResponseEntity.ok(userService.initUser(user));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/createuser")
    public ResponseEntity<Users> createUser(@Valid @RequestBody UserDTO userDTO) {
        Optional<Users> user = userService.getUserById(userDTO.getUserId());
        user.get().setEmail(userDTO.getEmail());
        // user.get().setPassword(userDTO.getPassword());

        // Verification code
        // user.setVerification_code(generateVerificationCode());
        return ResponseEntity.ok(userService.createUser(user.get()));
    }

    // /verify?userId=<userIdValue>&verificationCode=<verificationCodeValue>
    @PostMapping("/verify")
    public ResponseEntity<String> verifyUser(@RequestParam String userId, @RequestParam Integer verificationCode) {
        boolean isVerified = userService.verifyUser(userId, verificationCode);
        if (isVerified) {
            return ResponseEntity.ok("User verified successfully");
        }
        return ResponseEntity.badRequest().body("Invalid verification code");
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/getUser")
    public ResponseEntity<Users> getUser(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return userService.getUserbyKeycoakId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Users>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<Users> updateProfile(
            @PathVariable String userId,
            @RequestBody ProfileUpdateDTO profileDTO) {
        Users user = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(profileDTO.getUsername());
        user.setAge(profileDTO.getAge());
        user.setCurrent_career(profileDTO.getCurrent_career());
        user.setFuture_career(profileDTO.getFuture_career());
        user.setRelationship_status(profileDTO.getRelationship_status());
        user.setSocial_circle(profileDTO.getSocial_circle());

        return ResponseEntity.ok(userService.updateUser(user));
    }


    @PutMapping("/{userId}/personality")
    public ResponseEntity<Users> updatePersonality(
            @PathVariable String userId,
            @RequestBody PersonalityUpdateDTO personalityDTO) {
        Users user = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Personality personality = new Personality();
        personality.setPersonalityUser(user);
        personality.setOpenness(personalityDTO.getOpenness());
        personality.setConscientiousness(personalityDTO.getConscientiousness());
        personality.setExtraversion(personalityDTO.getExtraversion());
        personality.setAgreeableness(personalityDTO.getAgreeableness());
        personality.setNeuroticism(personalityDTO.getNeuroticism());
        personality.setCreatedAt(LocalDate.now());

        user.getPersonalities().add(personality);
        return ResponseEntity.ok(userService.updateUser(user));
    }

    //Delete Account
    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }
}
