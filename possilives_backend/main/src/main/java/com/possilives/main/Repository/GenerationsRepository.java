package com.possilives.main.Repository;

import java.util.Date;

import org.springframework.data.jpa.repository.JpaRepository;

import com.possilives.main.Model.Generations;
import com.possilives.main.Model.Users;

public interface GenerationsRepository extends JpaRepository<Generations, String> {
    Generations findByTitle(String title);
    Generations findByDescription(String description);
    Generations findByNote(String note);
    Generations findByCreatedAt(Date createdAt);
    Generations findByModifiedAt(Date modifiedAt);
    Generations findByGeneratedBy(Users generatedBy);
}
