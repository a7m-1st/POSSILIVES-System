package com.possilives.main.Model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "personality")
@NoArgsConstructor
@AllArgsConstructor
public class Personality {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String personality_id;

    @Column(nullable = false)
    private Double Openness;
    @Column(nullable = false)
    private Double Conscientiousness;
    @Column(nullable = false)
    private Double Extraversion;
    @Column(nullable = false)
    private Double Agreeableness;
    @Column(nullable = false)
    private Double Neuroticism;

    @Column(name = "video_generated", nullable = false)
    private Boolean video_generated = false;
    private LocalDate createdAt;

    // Add more fields as needed
    @ManyToOne
    @JsonIgnore
    private Users personalityUser;

    public String getPersonality_id() {
        return personality_id;
    }

    public void setPersonality_id(String personality_id) {
        this.personality_id = personality_id;
    }

    public Double getOpenness() {
        return Openness;
    }

    public void setOpenness(Double openness) {
        Openness = openness;
    }

    public Double getConscientiousness() {
        return Conscientiousness;
    }

    public void setConscientiousness(Double conscientiousness) {
        Conscientiousness = conscientiousness;
    }

    public Double getExtraversion() {
        return Extraversion;
    }

    public void setExtraversion(Double extraversion) {
        Extraversion = extraversion;
    }

    public Double getAgreeableness() {
        return Agreeableness;
    }

    public void setAgreeableness(Double agreeableness) {
        Agreeableness = agreeableness;
    }

    public Double getNeuroticism() {
        return Neuroticism;
    }

    public void setNeuroticism(Double neuroticism) {
        Neuroticism = neuroticism;
    }

    public Boolean getVideo_generated() {
        return video_generated;
    }

    public void setVideo_generated(Boolean video_generated) {
        this.video_generated = video_generated;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public Users getPersonalityUser() {
        return personalityUser;
    }

    public void setPersonalityUser(Users personalityUser) {
        this.personalityUser = personalityUser;
    }

    @Override
    public String toString() {
        return "Personality{" +
                "personality_id='" + personality_id + '\'' +
                ", Openness=" + Openness +
                ", Conscientiousness=" + Conscientiousness +
                ", Extraversion=" + Extraversion +
                ", Agreeableness=" + Agreeableness +
                ", Neuroticism=" + Neuroticism +
                ", video_generated=" + video_generated +
                ", createdAt=" + createdAt +
                ", user=" + personalityUser.getUser_id() +
                '}';
    }
}