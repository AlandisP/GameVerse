package com.GameVerse.GameVerse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.UserRepository;

@RestController
@RequestMapping("/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class UserProfileController {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository repository;

    // Gets the current Users Profile
    @GetMapping
    public ResponseEntity<?> getCurrUserProfile(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = repository.findById(userId).orElseThrow();
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable String username) {
        User user = repository.findByUsername(username);
        if(user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<?> editUserBio(@RequestBody ProfileUpdateRequest req, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = repository.findById(userId).orElseThrow();
        
        if (req.bio != null) {
            user.setBio(req.bio);
        }
        repository.save(user);
        return ResponseEntity.ok(user);
    }


    @PutMapping("/password")
    public ResponseEntity<?> editUserPassword(@RequestBody PasswordChangeRequest req, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = repository.findById(userId).orElseThrow();
        req.oldPassword = user.getPassword();

        if(req.newPassword == null) {
            if(passwordEncoder.encode(req.newPassword).equals(passwordEncoder.encode(req.oldPassword))) {
                return ResponseEntity.badRequest().body("New password cannot be the same as the old password");
            }
            return ResponseEntity.badRequest().body("No password entered");
        }

        user.setPassword(passwordEncoder.encode(req.newPassword));
        repository.save(user);

        return ResponseEntity.ok("Password has been changed");
    }

    @PutMapping("/username")
    public ResponseEntity<?> editUsername(@RequestBody UsernameChangeReq req, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = repository.findById(userId).orElseThrow();
        req.oldUsername = user.getUsername();
        if(req.newUsername.equals(repository.findByUsername(req.newUsername).getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        user.setUsername(req.newUsername);
        repository.save(user);
        return ResponseEntity.ok(user);
    }

    static class ProfileUpdateRequest {
        public String bio;
    }
    
    static class PasswordChangeRequest {
        public String oldPassword;
        public String newPassword;
    }

    static class UsernameChangeReq {
        public String newUsername;
        public String oldUsername;
    }
}
