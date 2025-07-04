package com.possilives.main.Model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "user_habits")
@NoArgsConstructor
@AllArgsConstructor
public class User_Habits {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String user_habits_id;

    @Column(name = "impact_rating", nullable = false)
    private Integer impact_rating = 5;
    private Double average_impact;

    @Column(name = "default_rating", nullable = false)
    private Integer default_rating = 5;
    private LocalDate createdAt;

    // Add more fields as needed
    @ManyToOne
    @JsonIgnore
    private Users habitUser;

//    @JsonIgnore
    @ManyToOne
    private Habit habit;


    public String getUser_habits_id() {
        return user_habits_id;
    }

    public void setUser_habits_id(String user_habits_id) {
        this.user_habits_id = user_habits_id;
    }

    public Integer getImpact_rating() {
        return impact_rating;
    }

    public void setImpact_rating(Integer impact_rating) {
        this.impact_rating = impact_rating;
    }

    public Double getAverage_impact() {
        return average_impact;
    }

    public void setAverage_impact(Double average_impact) {
        this.average_impact = average_impact;
    }

    public Integer getDefault_rating() {
        return default_rating;
    }

    public void setDefault_rating(Integer default_rating) {
        this.default_rating = default_rating;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public Users getHabitUser() {
        return habitUser;
    }

    public void setHabitUser(Users habitUser) {
        this.habitUser = habitUser;
    }

    public Habit getHabit() {
        return habit;
    }

    public void setHabit(Habit habit) {
        this.habit = habit;
    }

    @Override
    public String toString() {
        return "User_Habits{" +
                "user_habits_id='" + user_habits_id + '\'' +
                ", impact_rating=" + impact_rating +
                ", average_impact=" + average_impact +
                ", default_rating=" + default_rating +
                ", createdAt=" + createdAt +
                ", habitUser=" + habitUser.getUser_id() +
                ", habit=" + habit +
                '}';
    }
}