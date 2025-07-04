package com.possilives.main.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.possilives.main.Audit.Auditable;
import com.possilives.main.DTO.GenerationCreateDTO;
import com.possilives.main.Model.Generations;
import com.possilives.main.Model.Image;
import com.possilives.main.Model.Users;
import com.possilives.main.Repository.GenerationsRepository;
import com.possilives.main.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GenerationsService {
  private final GenerationsRepository generationsRepository;
  private final UserRepository userRepository;
  @Auditable
  public Generations createGeneration(GenerationCreateDTO genDTO) {
    Users user = userRepository.findById(genDTO.getUserId())
        .orElseThrow(() -> new RuntimeException("User not found"));

    Generations generation = new Generations();
    generation.setGeneratedBy(user);
    generation.setDescription(genDTO.getDescription());
    generation.setTitle(genDTO.getTitle());
    generation.setNote(genDTO.getNote());

    // Create Image class only if imageLink is provided
    if (genDTO.getImageLink() != null && !genDTO.getImageLink().trim().isEmpty()) {
      Image image = new Image();
      image.setLink(genDTO.getImageLink()); // Set the actual image URL
      image.setCreatedAt(new Date()); // Set creation date
      image.setImageGeneration(generation);
      
      // Use mutable list
      List<Image> images = new ArrayList<>();
      images.add(image);
      generation.setImages(images);
    }

    return generationsRepository.save(generation);
  }

  @Auditable
  public List<Generations> getUserGenerations(String keycloakId) {
    Users user = userRepository.findByKeycloakId(keycloakId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    return user.getGenerations();
  }

  //Creadits
  public Boolean createGeneration(String userId) {
    Users user = userRepository.findByKeycloakId(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));
    Boolean balance = 0 < user.getGen_credits();

    if (balance) {
      user.setGen_credits(user.getGen_credits() - 1);
      userRepository.save(user);
    }
    return balance;
  }

  public Object getUserCredits(String userId) {
    Users user = userRepository.findByKeycloakId(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    return Map.of(
        "credits_left", user.getGen_credits(),
        "max_credits", user.getMax_credits());
  }

  public Generations getGenerationById(String generationId) {
    return generationsRepository.findById(generationId)
        .orElseThrow(() -> new RuntimeException("Generation not found"));
  }

  @Auditable
  public void deleteGeneration(String generationId) {
    generationsRepository.deleteById(generationId);
  }
}
