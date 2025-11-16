package com.GameVerse.GameVerse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.GameVerse.GameVerse.repository.UserRepository;

@SpringBootApplication
public class GameVerseApplication {

	@Autowired
	UserRepository repo;
	public static void main(String[] args) {
		
		SpringApplication.run(GameVerseApplication.class, args);
	}
 
}
