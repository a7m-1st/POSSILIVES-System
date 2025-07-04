package com.possilives.main.Model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Entity
@Table(name = "habit")
@NoArgsConstructor
@AllArgsConstructor
public class Habit {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String habit_id;

    private String title;
    private String description;

    // Add more fields as needed
    @OneToMany(mappedBy = "linkedHabit", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<Big_Five> traits;

    @JsonIgnore
    @OneToMany(mappedBy = "habit", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<User_Habits> user_habits;

    public String getHabit_id() {
        return habit_id;
    }

    public void setHabit_id(String habit_id) {
        this.habit_id = habit_id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Big_Five> getTraits() {
        return traits;
    }

    public void setTraits(List<Big_Five> traits) {
        this.traits = traits;
    }

    public List<User_Habits> getUser_habits() {
        return user_habits;
    }

    public void setUser_habits(List<User_Habits> user_habits) {
        this.user_habits = user_habits;
    }

    @Override
    public String toString() {
        return "Habit{" +
                "habit_id='" + habit_id + '\'' +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", traits=" + traits +
                ", user_habits=" + user_habits.stream().map(u_h -> u_h.getUser_habits_id()).collect(Collectors.toList()) +
                '}';
    }
}