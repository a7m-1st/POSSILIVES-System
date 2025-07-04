package com.possilives.main.Model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String user_id;

    @Column(nullable = false, unique = true)
    private String keycloakId; // stores the Keycloak UUID

    @Column(nullable = false, unique = true)
    private String email;

    // @Column(nullable = false)
    // private String password;

    private String username;
    private Integer age;
    private String current_career;
    private String future_career;
    private String relationship_status;
    private String social_circle;

    @Column(name = "is_banned", nullable = false)
    private Boolean is_banned = false;
    @Column(name = "login_times", nullable = false)
    private Integer login_times = 1;
    private Integer verification_code;
    private LocalDate verification_createdAt;

    @Column(name = "is_verified", nullable = false)
    private Boolean is_verified = false;
    private LocalDate createdAt;

    @Column(name = "gen_credits", nullable = false)
    private Integer gen_credits = 10;
    @Column(name = "max_credits", nullable = false)
    private Integer max_credits = 10;

    // Add more fields as needed
    @OneToMany(mappedBy = "personalityUser", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<Personality> personalities;

    @OneToMany(mappedBy = "habitUser", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<User_Habits> user_habits;

    @OneToMany(mappedBy = "generatedBy", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<Generations> generations;

    @OneToMany(mappedBy = "sender", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<Notifications> sentNotificationsList;

    @OneToMany(mappedBy = "reciever", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<Notifications> recievedNotificationList;
    
    @JsonIgnore
    @OneToMany(mappedBy = "auditBy", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<AuditLog> auditLogs;
}