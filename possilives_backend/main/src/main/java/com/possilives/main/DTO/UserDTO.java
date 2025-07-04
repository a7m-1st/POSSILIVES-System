package com.possilives.main.DTO;


import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserDTO {
    @NotNull
    private String userId;

    @NotNull
    @Email
    private String email;
    
    @NotNull
    private String password;
}