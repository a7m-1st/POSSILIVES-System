package com.possilives.main;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.possilives.main.Model.Big_Five;
import com.possilives.main.Model.Habit;
import com.possilives.main.Model.Personality;
import com.possilives.main.Model.User_Habits;
import com.possilives.main.Model.Users;
import com.possilives.main.Repository.HabitRepository;
import com.possilives.main.Repository.UserHabitRepository;
import com.possilives.main.Repository.UserRepository;
import com.possilives.main.Service.UserHabitService;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class UserHabitServiceTest {

    @Mock
    private HabitRepository habitRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserHabitRepository userHabitRepository;

    @InjectMocks
    private UserHabitService userHabitService;

    private Users testUser;
    private Habit testHabit1;
    private Habit testHabit2;
    private Personality testPersonality;
    private User_Habits testUserHabit;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = new Users();
        testUser.setUser_id("user123");

        // Setup test personality with high traits
        testPersonality = new Personality();
        testPersonality.setOpenness(80.0);
        testPersonality.setConscientiousness(85.0);
        testPersonality.setExtraversion(70.0);
        testPersonality.setAgreeableness(90.0);
        testPersonality.setNeuroticism(60.0);
        testPersonality.setCreatedAt(LocalDate.now());

        List<Personality> personalities = new ArrayList<>();
        personalities.add(testPersonality);
        testUser.setPersonalities(personalities);

        // Setup test habits
        testHabit1 = new Habit();
        testHabit1.setHabit_id("habit1");
        testHabit1.setTitle("Test Habit 1");
        
        testHabit2 = new Habit();
        testHabit2.setHabit_id("habit2");
        testHabit2.setTitle("Test Habit 2");

        // Setup Big Five traits
        List<Big_Five> traits1 = new ArrayList<>();
        Big_Five trait1 = new Big_Five();
        trait1.setTrait("OPENNESS");
        traits1.add(trait1);
        testHabit1.setTraits(traits1);

        List<Big_Five> traits2 = new ArrayList<>();
        Big_Five trait2 = new Big_Five();
        trait2.setTrait("CONSCIENTIOUSNESS");
        traits2.add(trait2);
        testHabit2.setTraits(traits2);

        // Setup test user habit
        testUserHabit = new User_Habits();
        testUserHabit.setUser_habits_id("userHabit1");
        testUserHabit.setHabitUser(testUser);
        testUserHabit.setHabit(testHabit1);
        testUserHabit.setCreatedAt(LocalDate.now());
    }

    @Test
    void getRecommendedHabits_Success() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(habitRepository.findAll()).thenReturn(Arrays.asList(testHabit1, testHabit2));

        List<Habit> result = userHabitService.getRecommendedHabits("user123");

        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(userRepository).findById("user123");
        verify(habitRepository).findAll();
    }

    @Test
    void getRecommendedHabits_UserNotFound() {
        when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            userHabitService.getRecommendedHabits("nonexistent");
        });
    }

    @Test
    void createHabit_Success() {
        when(habitRepository.save(any(Habit.class))).thenReturn(testHabit1);

        Habit result = userHabitService.createHabit(testHabit1);

        assertNotNull(result);
        assertEquals(testHabit1.getHabit_id(), result.getHabit_id());
        verify(habitRepository).save(testHabit1);
    }

    @Test
    void getAllHabits_Success() {
        when(habitRepository.findAll()).thenReturn(Arrays.asList(testHabit1, testHabit2));

        List<Habit> result = userHabitService.getAllHabits();

        assertNotNull(result);
        assertEquals(2, result.size());
        verify(habitRepository).findAll();
    }

    @Test
    void createUserHabits_Success() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(habitRepository.findById("habit1")).thenReturn(Optional.of(testHabit1));
        when(userHabitRepository.saveAll(anyList())).thenReturn(Arrays.asList(testUserHabit));

        List<User_Habits> result = userHabitService.createUserHabits("user123", Arrays.asList("habit1"));

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(testUserHabit, result.get(0));
        verify(userHabitRepository).saveAll(anyList());
    }

    @Test
    void createUserHabits_UserNotFound() {
        when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            userHabitService.createUserHabits("nonexistent", Arrays.asList("habit1"));
        });
    }

    @Test
    void getUserHabits_Success() {
        List<User_Habits> userHabits = Arrays.asList(testUserHabit);
        testUser.setUser_habits(userHabits);
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));

        List<User_Habits> result = userHabitService.getUserHabits("user123");

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(testUserHabit, result.get(0));
    }

    @Test
    void deleteHabit_Success() {
        List<User_Habits> userHabits = Arrays.asList(testUserHabit);
        testUser.setUser_habits(userHabits);
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        doNothing().when(userHabitRepository).delete(any(User_Habits.class));

        String result = userHabitService.deleteHabit("habit1", "user123");

        assertEquals("Habit deleted", result);
        verify(userHabitRepository).delete(any(User_Habits.class));
    }

    @Test
    void updateHabitImpact_Success() {
        when(userHabitRepository.findById("userHabit1")).thenReturn(Optional.of(testUserHabit));
        when(userHabitRepository.save(any(User_Habits.class))).thenReturn(testUserHabit);

        String result = userHabitService.updateHabitImpact("userHabit1", 5, 4.5);

        assertEquals("Impact updated", result);
        assertEquals(5, testUserHabit.getImpact_rating());
        assertEquals(4.5, testUserHabit.getAverage_impact());
        verify(userHabitRepository).save(testUserHabit);
    }

    @Test
    void updateHabitImpact_NotFound() {
        when(userHabitRepository.findById("nonexistent")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            userHabitService.updateHabitImpact("nonexistent", 5, 4.5);
        });
    }
}
