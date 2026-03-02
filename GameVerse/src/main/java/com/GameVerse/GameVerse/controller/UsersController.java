package com.GameVerse.GameVerse.controller;


import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.services.RelationshipServices;


@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UsersController {

    @Autowired
    private RelationshipServices relationshipService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository repository;


    @GetMapping
    public List<User> getAllUsers() {
        return repository.findAll();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return repository.save(user);
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable String id) {
        return repository.findById(id).orElse(null);
    }
    
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        repository.deleteById(id);
    }


    @GetMapping("/matches")
    public List<User> getUsernameMatches(@RequestParam String text) {

        return repository.findByUsernameContainingIgnoreCase(text);

    }

    @PostMapping("/follow/{username}")
    public ResponseEntity<?> followUser(@PathVariable String username, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User currUser = repository.findById(userId).orElseThrow();
        User following = repository.findByUsernameIgnoreCase(username);
        if(following == null) {
            return ResponseEntity.notFound().build();
        }
        if(relationshipService.isFollowing(currUser.getId(), following.getId())) {
            return ResponseEntity.badRequest().body("User is already following this person");
        }
        relationshipService.followUser(currUser.getId(), following.getId());
        return ResponseEntity.ok("Successfully followed the user");
    }

    @DeleteMapping("/unfollow/{username}")
    public ResponseEntity<?> unfollowUser(@PathVariable String username, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User currUser = repository.findById(userId).orElseThrow();
        User following = repository.findByUsernameIgnoreCase(username);
        if(following == null) {
            return ResponseEntity.notFound().build();
        }
        if(!relationshipService.isFollowing(currUser.getId(), following.getId())) {
            return ResponseEntity.badRequest().body("The relationship between the users dont exist");
        }
        relationshipService.unfollowUser(currUser.getId(), following.getId());
        return ResponseEntity.ok("Successfully unfollowed the user");
    }

    @GetMapping("/usernames")
    public ResponseEntity<?> getUsers(@RequestParam List<String> userIds) {
        List<String> usernames = userIds.stream()
            .map(userId -> repository.findById(userId).map(User::getUsername).orElse(null))
            .toList();
        return ResponseEntity.ok(usernames);

    }

    @DeleteMapping("/delete-account")
public ResponseEntity<?> deleteAccount(@RequestBody Map<String, String> body, Authentication auth) {
    String userId = (String) auth.getPrincipal();
    String password = body.get("password");

    if (password == null || password.isEmpty())
        return ResponseEntity.badRequest().body(Map.of("message", "Please provide your password"));

    User user = repository.findById(userId).orElseThrow();

    if (!passwordEncoder.matches(password, user.getPassword()))
        return ResponseEntity.badRequest().body(Map.of("message", "Incorrect password"));

    repository.deleteById(userId);
    return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
}

@PutMapping("/change-password")
public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, Authentication auth) {
    String userId = (String) auth.getPrincipal();
    String currentPassword = body.get("currentPassword");
    String newPassword = body.get("newPassword");

    if (currentPassword == null || newPassword == null)
        return ResponseEntity.badRequest().body(Map.of("message", "Please provide current and new password"));
    if (newPassword.length() < 6)
        return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));

    User user = repository.findById(userId).orElseThrow();

    if (!passwordEncoder.matches(currentPassword, user.getPassword()))
        return ResponseEntity.badRequest().body(Map.of("message", "Current password is incorrect"));

    user.setPassword(passwordEncoder.encode(newPassword));
    repository.save(user);
    return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
}

  @PutMapping("/change-username")
public ResponseEntity<?> changeUsername(@RequestBody Map<String, String> body, Authentication auth) {
    String userId = (String) auth.getPrincipal();
    String newUsername = body.get("newUsername");

    if (newUsername == null || newUsername.trim().isEmpty())
        return ResponseEntity.badRequest().body(Map.of("message", "Username cannot be empty"));
    if (newUsername.contains(" "))
        return ResponseEntity.badRequest().body(Map.of("message", "Username cannot contain spaces"));
    if (repository.existsByUsername(newUsername.trim()))
        return ResponseEntity.badRequest().body(Map.of("message", "Username already taken"));

    User user = repository.findById(userId).orElseThrow();
    user.setUsername(newUsername.trim());
    repository.save(user);
    return ResponseEntity.ok(Map.of("message", "Username updated successfully"));
}

    @GetMapping("/exists/{username}")
    public ResponseEntity<?> userExist(Authentication auth, @PathVariable String username) {
        boolean exists = repository.existsByUsername(username);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

}