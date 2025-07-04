package com.possilives.main;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableScheduling;

import jakarta.annotation.PostConstruct;

@EnableAspectJAutoProxy
@SpringBootApplication
@EnableScheduling
public class MainApplication {

	@PostConstruct
	public void init() {
		// Set the default timezone for the entire application
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kuala_Lumpur"));
	}

	public static void main(String[] args) {
		SpringApplication.run(MainApplication.class, args);
	}

}
