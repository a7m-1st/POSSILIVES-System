package com.possilives.main.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.possilives.main.Model.User_Habits;

public interface UserHabitRepository extends JpaRepository<User_Habits, String> {
}
