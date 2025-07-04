package com.possilives.main.Controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.possilives.main.DTO.BigFiveCreateDTO;
import com.possilives.main.DTO.HabitDTO;
import com.possilives.main.DTO.SubmitHabitsDTO;
import com.possilives.main.DTO.UpdateHabitImpactDTO;
import com.possilives.main.DTO.UserHabitCreateDTO;
import com.possilives.main.Model.Big_Five;
import com.possilives.main.Model.Habit;
import com.possilives.main.Model.User_Habits;
import com.possilives.main.Service.UserHabitService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
@CrossOrigin("*")
public class HabitController {
  private final UserHabitService habitService;

  // @PostMapping("/{habitId}/traits")
  // public ResponseEntity<Big_Five> createBigFiveTraits(
  // @PathVariable String habitId,
  // @RequestBody BigFiveCreateDTO bigFiveDTO) {
  // return ResponseEntity.ok(habitService.createBigFiveTraits(habitId,
  // bigFiveDTO));
  // }
  @GetMapping
  public ResponseEntity<List<Habit>> getAllHabits() {
    return ResponseEntity.ok(habitService.getAllHabits());
  }

  @GetMapping("/recommended/{userId}")
  public ResponseEntity<List<Habit>> getRecommendedHabits(@PathVariable String userId) {
    return ResponseEntity.ok(habitService.getRecommendedHabits(userId));
  }

  @PostMapping
  public ResponseEntity<Habit> createHabit(@Valid @RequestBody HabitDTO habitDTO) {
    Habit habit = new Habit();
    habit.setTitle(habitDTO.getTitle());
    habit.setDescription(habitDTO.getDescription());

    // Map each traits
    List<Big_Five> parsedTraits = habitDTO.getTraits().stream()
        .map(traitDTO -> {
          Big_Five trait = new Big_Five();
          trait.setTrait(traitDTO.getTrait());
          trait.setLinkedHabit(habit);
          return trait;
        })
        .collect(Collectors.toList());

    System.out.println("Parsed Traits was " + parsedTraits);

    habit.setTraits(parsedTraits);
    return ResponseEntity.ok(habitService.createHabit(habit));
  };

  @PostMapping("/submitHabits")
  public ResponseEntity<List<User_Habits>> submitUserHabits(@RequestBody SubmitHabitsDTO submitHabitsDTO) {
    return ResponseEntity.ok(habitService.createUserHabits(
        submitHabitsDTO.getUserId(),
        submitHabitsDTO.getHabits()));
  }

  @GetMapping("/userHabits/{userId}")
  public ResponseEntity<List<User_Habits>> getUserHabits(@PathVariable String userId) {
    return ResponseEntity.ok(habitService.getUserHabits(userId));
  }

  @DeleteMapping("deleteHabit/{habitId}")
  public ResponseEntity<Void> deleteHabit(
      @PathVariable String habitId,
      @RequestParam String userId) {
    habitService.deleteHabit(habitId, userId);
    return ResponseEntity.noContent().build(); // 204
  }

  @PostMapping("updateImpact")
  public ResponseEntity<String> updateHabitImpact(@RequestBody UpdateHabitImpactDTO updateHabitImpact) {
    return ResponseEntity.ok(habitService.updateHabitImpact(updateHabitImpact.getUser_habits_id(),updateHabitImpact.getImpact_rating(), updateHabitImpact.getAverage_impact()));
  }

}
