package com.possilives.main.Repository;

import com.possilives.main.Model.Habit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HabitRepository extends JpaRepository<Habit, String> {
}
