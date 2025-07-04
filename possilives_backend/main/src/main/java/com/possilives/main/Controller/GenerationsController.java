package com.possilives.main.Controller;


import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.possilives.main.DTO.GenerationCreateDTO;
import com.possilives.main.Model.Generations;
import com.possilives.main.Service.GenerationsService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/gens")
@RequiredArgsConstructor
@CrossOrigin("*")
public class GenerationsController {
  private final GenerationsService generationsService;

  @PreAuthorize("isAuthenticated()")
  @PostMapping("/create")
  public ResponseEntity<Generations> createGeneration(@Valid @RequestBody GenerationCreateDTO genDTO) {
    return ResponseEntity.ok(generationsService.createGeneration(genDTO));
  }

  @PreAuthorize("isAuthenticated()")
  @PostMapping()
  public ResponseEntity<List<Generations>> getUserGenerations(@AuthenticationPrincipal Jwt jwt) {
    String keycloakId = jwt.getSubject();
    return ResponseEntity.ok(generationsService.getUserGenerations(keycloakId));
  }

  @PreAuthorize("isAuthenticated()")
  @PostMapping("/balance")
  public ResponseEntity<Boolean> createGeneration(@AuthenticationPrincipal Jwt jwt) {
    String userId = jwt.getSubject();
    return ResponseEntity.ok(generationsService.createGeneration(userId));
  }

  @PreAuthorize("isAuthenticated()")
  @PostMapping("/credits")
  public ResponseEntity<Object> getUserCredits(@AuthenticationPrincipal Jwt jwt) {
    String userId = jwt.getSubject();
    return ResponseEntity.ok(generationsService.getUserCredits(userId));
  }
}
