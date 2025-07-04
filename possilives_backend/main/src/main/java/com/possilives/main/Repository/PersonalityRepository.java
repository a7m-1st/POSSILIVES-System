package com.possilives.main.Repository;

import com.possilives.main.Model.Personality;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonalityRepository extends JpaRepository<Personality, String> {
}
