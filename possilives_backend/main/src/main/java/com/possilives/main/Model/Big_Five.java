package com.possilives.main.Model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Entity
@Table(name = "big_five")
@NoArgsConstructor
@AllArgsConstructor
public class Big_Five {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String big_five_id;

    private String trait;

    @JsonIgnore
    @ManyToOne
    private Habit linkedHabit;

    public String getBig_five_id() {
        return big_five_id;
    }

    public void setBig_five_id(String big_five_id) {
        this.big_five_id = big_five_id;
    }

    public String getTrait() {
        return trait;
    }

    public void setTrait(String trait) {
        this.trait = trait;
    }

    public Habit getLinkedHabit() {
        return linkedHabit;
    }

    public void setLinkedHabit(Habit linkedHabit) {
        this.linkedHabit = linkedHabit;
    }

    @Override
    public String toString() {
        return "Big_Five{" +
                "big_five_id='" + big_five_id + '\'' +
                ", trait='" + trait + '\'' +
                ", linkedHabit=" + linkedHabit.getHabit_id() +
                '}';
    }
}