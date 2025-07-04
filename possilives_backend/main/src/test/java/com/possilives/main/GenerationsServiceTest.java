package com.possilives.main;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.possilives.main.DTO.GenerationCreateDTO;
import com.possilives.main.Model.Generations;
import com.possilives.main.Model.Users;
import com.possilives.main.Repository.GenerationsRepository;
import com.possilives.main.Repository.UserRepository;
import com.possilives.main.Service.GenerationsService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class GenerationsServiceTest {

    @Mock
    private GenerationsRepository generationsRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GenerationsService generationsService;

    private Users testUser;
    private Generations testGeneration;
    private GenerationCreateDTO testDTO;

    @BeforeEach
    void setUp() {
        testUser = new Users();
        testUser.setUser_id("user123");
        testUser.setGen_credits(5);
        testUser.setMax_credits(10);

        testGeneration = new Generations();
        testGeneration.setGen_id("gen123");
        testGeneration.setGeneratedBy(testUser);
        testGeneration.setTitle("Test Title");
        testGeneration.setDescription("Test Description");
        
        testDTO = new GenerationCreateDTO();
        testDTO.setUserId("user123");
        testDTO.setTitle("Test Title");
        testDTO.setDescription("Test Description");
        testDTO.setNote("Test Note");
    }

    @Test
    void createGeneration_Success() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(generationsRepository.save(any(Generations.class))).thenReturn(testGeneration);

        Generations result = generationsService.createGeneration(testDTO);

        assertNotNull(result);
        assertEquals(testGeneration.getGen_id(), result.getGen_id());
        // assertEquals(1, result.getImages().size());
        verify(generationsRepository).save(any(Generations.class));
    }

    @Test
    void createGeneration_UserNotFound() {
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            generationsService.createGeneration(testDTO);
        });
    }

    @Test
    void getUserGenerations_Success() {
        List<Generations> generationsList = new ArrayList<>();
        generationsList.add(testGeneration);
        testUser.setGenerations(generationsList);

        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));

        List<Generations> result = generationsService.getUserGenerations("user123");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testGeneration, result.get(0));
    }

    @Test
    void createGeneration_WithCredits_Success() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));

        Boolean result = generationsService.createGeneration("user123");

        assertTrue(result);
        assertEquals(4, testUser.getGen_credits());
        verify(userRepository).save(testUser);
    }

    @Test
    void createGeneration_NoCredits_Failure() {
        testUser.setGen_credits(0);
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));

        Boolean result = generationsService.createGeneration("user123");

        assertFalse(result);
        assertEquals(0, testUser.getGen_credits());
        verify(userRepository, never()).save(any(Users.class));
    }

    @Test
    void getUserCredits_Success() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));

        Object result = generationsService.getUserCredits("user123");
        
        assertTrue(result instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, Integer> credits = (Map<String, Integer>) result;
        assertEquals(5, credits.get("credits_left"));
        assertEquals(10, credits.get("max_credits"));
    }

    @Test
    void getGenerationById_Success() {
        when(generationsRepository.findById("gen123")).thenReturn(Optional.of(testGeneration));

        Generations result = generationsService.getGenerationById("gen123");

        assertNotNull(result);
        assertEquals(testGeneration, result);
    }

    @Test
    void getGenerationById_NotFound() {
        when(generationsRepository.findById("gen123")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            generationsService.getGenerationById("gen123");
        });
    }

    @Test
    void deleteGeneration_Success() {
        doNothing().when(generationsRepository).deleteById("gen123");

        generationsService.deleteGeneration("gen123");

        verify(generationsRepository).deleteById("gen123");
    }
}