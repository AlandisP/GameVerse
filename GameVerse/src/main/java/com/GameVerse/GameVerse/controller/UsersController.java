package com.GameVerse.GameVerse.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

     @GetMapping("/test/populate")
    public String populateTestData() {
        repository.deleteAll(); // Clear existing data

        User john = new User("alandis", passwordEncoder.encode("2190"));
        User q = new User("q", passwordEncoder.encode("1234"));
        repository.save(john);
        repository.save(q);
        
                                
        return "Test data inserted! Total users: " + repository.count();
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


}