package com.GameVerse.GameVerse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.services.NotificationService;
import com.GameVerse.GameVerse.services.RelationshipServices;

@RestController
@RequestMapping("/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class UserProfileController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository repository;

    @Autowired
    private RelationshipServices relationshipServices;

    @Autowired
    private NotificationService notificationService;

    private static final String type = "Profile";

    // Gets the current Users Profile
    @GetMapping
    public ResponseEntity<?> getCurrUserProfile(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = repository.findById(userId).orElseThrow();
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable String username) {
        User user = repository.findByUsernameIgnoreCase(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<?> editUserBio(@RequestBody ProfileUpdateRequest req, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = repository.findById(userId).orElseThrow();

        if (req.bio != null && !req.bio.trim().isEmpty()) {
            user.setBio(req.bio);
            repository.save(user);
        }

        return ResponseEntity.ok(user);
    }

    @PutMapping("/password")
    public ResponseEntity<?> editUserPassword(@RequestBody PasswordChangeRequest req, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = repository.findById(userId).orElseThrow();

        if (req.oldPassword == null || req.newPassword == null) {
            return ResponseEntity.badRequest().body("Both old and new passwords are required");
        }

        if (!passwordEncoder.matches(req.oldPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body("Old password is incorrect");
        }

        if (req.oldPassword.equals(req.newPassword)) {
            return ResponseEntity.badRequest().body("New password cannot be the same as the old password");
        }

        user.setPassword(passwordEncoder.encode(req.newPassword));
        repository.save(user);

        return ResponseEntity.ok("Password has been changed");
    }

    @PutMapping("/username")
    public ResponseEntity<?> editUsername(@RequestBody UsernameChangeReq req, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = repository.findById(userId).orElseThrow();

        if (req.newUsername == null || req.newUsername.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username cannot be empty");
        }

        User existingUser = repository.findByUsernameIgnoreCase(req.newUsername);
        if (existingUser != null && !existingUser.getId().equals(userId)) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        user.setUsername(req.newUsername);
        repository.save(user);

        return ResponseEntity.ok(user);
    }

    // ---------- FOLLOW / UNFOLLOW / STATUS ----------

    @PostMapping("/{username}/follow")
    public ResponseEntity<?> followUser(@PathVariable String username, Authentication auth) {
        String followerId = (String) auth.getPrincipal();
        User target = repository.findByUsernameIgnoreCase(username);

        if (target == null) {
            return ResponseEntity.notFound().build();
        }

        if (target.getId().equals(followerId)) {
            return ResponseEntity.badRequest().body("You cannot follow yourself");
        }
        String message = repository.findById(followerId).orElse(null).getUsername() + " has followed you!";
        notificationService.createNotification(type, message, target.getId());
        relationshipServices.followUser(followerId, target.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{username}/unfollow")
    public ResponseEntity<?> unfollowUser(@PathVariable String username, Authentication auth) {
        String followerId = (String) auth.getPrincipal();
        User target = repository.findByUsernameIgnoreCase(username);

        if (target == null) {
            return ResponseEntity.notFound().build();
        }

        if (target.getId().equals(followerId)) {
            return ResponseEntity.badRequest().body("You cannot unfollow yourself");
        }

        relationshipServices.unfollowUser(followerId, target.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{username}/isFollowing")
    public ResponseEntity<?> isFollowing(@PathVariable String username, Authentication auth) {
        String followerId = (String) auth.getPrincipal();
        User target = repository.findByUsernameIgnoreCase(username);

        if (target == null) {
            return ResponseEntity.notFound().build();
        }

        boolean isFollowing = relationshipServices.isFollowing(followerId, target.getId());
        return ResponseEntity.ok(isFollowing);
    }

    // ---------- REQUEST CLASSES ----------

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
