package com.possilives.main.Exception;

public class HabitValidationException extends RuntimeException {
    private final String suggestion;
    
    public HabitValidationException(String message) {
        super(message);
        this.suggestion = null;
    }
    
    public HabitValidationException(String message, String suggestion) {
        super(message);
        this.suggestion = suggestion;
    }
    
    public String getSuggestion() {
        return suggestion;
    }
}
