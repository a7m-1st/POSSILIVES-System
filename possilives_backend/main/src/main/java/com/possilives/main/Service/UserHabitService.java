package com.possilives.main.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.possilives.main.Audit.Auditable;
import com.possilives.main.DTO.UserHabitCreateDTO;
import com.possilives.main.Model.Big_Five;
import com.possilives.main.Model.Habit;
import com.possilives.main.Model.Personality;
import com.possilives.main.Model.User_Habits;
import com.possilives.main.Model.Users;
import com.possilives.main.Repository.HabitRepository;
import com.possilives.main.Repository.UserHabitRepository;
import com.possilives.main.Exception.HabitValidationException;
import com.possilives.main.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserHabitService {
  private final HabitRepository habitRepository;
  private final UserRepository userRepository;
  private final UserHabitRepository userHabitRepository;
  private final HabitValidationService habitValidationService;

  @Auditable
  public List<Habit> getRecommendedHabits(String userId) {
    // Get user and latest personality
    Users user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    Personality latestPersonality = user.getPersonalities().stream()
        .max(Comparator.comparing(Personality::getCreatedAt))
        .orElseThrow(() -> new RuntimeException("No personality found"));

    // Get user's dominant traits (>75)
    List<String> dominantTraits = new ArrayList<>();
    if (latestPersonality.getOpenness() > 75)
      dominantTraits.add("OPENNESS");
    if (latestPersonality.getConscientiousness() > 75)
      dominantTraits.add("CONSCIENTIOUSNESS");
    if (latestPersonality.getExtraversion() > 75)
      dominantTraits.add("EXTRAVERSION");
    if (latestPersonality.getAgreeableness() > 75)
      dominantTraits.add("AGREEABLENESS");
    if (latestPersonality.getNeuroticism() > 75)
      dominantTraits.add("NEUROTICISM");

    System.out.println("Dominant traits: " + dominantTraits);

    // Get all habits and filter by matching traits
    List<Habit> allHabits = habitRepository.findAll();

    return allHabits.stream()
        .filter(habit -> {
          List<Big_Five> habitTraits = habit.getTraits();
          return habitTraits.stream()
              .anyMatch(trait -> dominantTraits.stream()
                  .anyMatch(userTrait -> trait.getTrait().equals(userTrait)));
        })
        .sorted((h1, h2) -> {
          // Sort by number of matching traits
          long matches1 = countMatches(h1.getTraits(), dominantTraits);
          long matches2 = countMatches(h2.getTraits(), dominantTraits);
          return Long.compare(matches2, matches1);
        })
        .collect(Collectors.toList());
  }

  private long countMatches(List<Big_Five> habitTraits, List<String> userTraits) {
    return habitTraits.stream()
        .filter(trait -> userTraits.contains(trait.getTrait()))
        .count();
  }
  public Habit createHabit(Habit habit) {
    // Validate habit before creation
    List<String> existingTitles = habitRepository.findAll().stream()
        .map(Habit::getTitle)
        .collect(Collectors.toList());
    
    HabitValidationService.ValidationResult validation = habitValidationService.validateHabit(
        habit.getTitle(), 
        habit.getDescription(), 
        existingTitles
    );
      if (!validation.isValid()) {
      throw new HabitValidationException("Habit validation failed: " + validation.getReason(), 
          validation.getSuggestion());
    }
    
    return habitRepository.save(habit);
  }

  public List<Habit> getAllHabits()   {
    return habitRepository.findAll();
  }
  @Auditable
  public List<User_Habits> createUserHabits(String userId, List<String> habits) {
    // Validate that habits exist and user doesn't already have them
    Users user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));
    
    List<String> userExistingHabitIds = user.getUser_habits().stream()
        .map(uh -> uh.getHabit().getHabit_id())
        .collect(Collectors.toList());

    List<User_Habits> userHabits = new ArrayList<>();

    for (String habitId : habits) {      // Check if user already has this habit
      if (userExistingHabitIds.contains(habitId)) {
        throw new HabitValidationException("User already has this habit", 
            "Please choose a different habit or modify an existing one");
      }
      
      User_Habits userHabit = new User_Habits();
      Habit habit = habitRepository.findById(habitId)
          .orElseThrow(() -> new RuntimeException("Habit not found"));
      userHabit.setHabitUser(user);
      userHabit.setHabit(habit);
      userHabit.setCreatedAt(LocalDate.now());
      
      userHabits.add(userHabit);
    }

    return userHabitRepository.saveAll(userHabits);
  }

  public List<User_Habits> getUserHabits(String userId) {
    return userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"))
        .getUser_habits();
  }

  @Auditable
  public String deleteHabit(String habitId, String userId) {
    Users user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    User_Habits userHabit = user.getUser_habits().stream()
        .filter(h -> h.getHabit().getHabit_id().equals(habitId))
        .findFirst()
        .orElseThrow(() -> new RuntimeException("Habit not found"));

    userHabitRepository.delete(userHabit);

    return "Habit deleted";
  }

  @Auditable
  public String updateHabitImpact(String user_habits_id, Integer impact, Double average_impact) {
    User_Habits userHabit = userHabitRepository.findById(user_habits_id)
        .orElseThrow(() -> new RuntimeException("User habit not found"));

    userHabit.setImpact_rating(impact);
    userHabit.setAverage_impact(average_impact);

    userHabitRepository.save(userHabit);
    return "Impact updated";
  }
}
