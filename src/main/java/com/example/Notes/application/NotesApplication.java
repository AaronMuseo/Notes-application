package com.example.Notes.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.example.Notes")
@EnableJpaRepositories(basePackages = "com.example.Notes.repository")
public class NotesApplication {

	public static void main(String[] args) {
		SpringApplication.run(NotesApplication.class, args);
	}

}
