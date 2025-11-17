package com.GameVerse.GameVerse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.GameVerse.GameVerse.model.Role;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.security.JwtService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody RegisterRequest request) {
        // Check if username exists
        if (userRepository.existsByUsername(request.username)) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        
        // Create user
        User user = new User();
        user.setUsername(request.username);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setRole(Role.USER);
        
        User savedUser = userRepository.save(user);
        
        // Generate token
        String token = jwtService.generateToken(savedUser.getId(), savedUser.getRole());
        
        return ResponseEntity.ok(new AuthResponse(token, savedUser.getUsername(), savedUser.getRole()));
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.username);
        
        if (user == null) {
            return ResponseEntity.badRequest().body("Invalid username or password");
        }
        
        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid username or password");
        }
        
    
        String token = jwtService.generateToken(user.getId(), user.getRole());
        
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole()));
    }
    
    // Inner classes
    static class LoginRequest {
        public String username;
        public String password;
    }
    
    static class RegisterRequest {
        public String username;
        public String password;
    }
    
    static class AuthResponse {
        public String token;
        public String username;
        public Role role;
        
        public AuthResponse(String token, String username, Role role) {
            this.token = token;
            this.username = username;
            this.role = role;
        }
    }
}