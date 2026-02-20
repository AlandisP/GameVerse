package com.GameVerse.GameVerse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.NotificationRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.services.NotificationService;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService service;

    @GetMapping("/{username}")
    public ResponseEntity<?> getUnreadNotifications(@PathVariable String username, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = userRepository.findById(userId).orElse(null);
        if(user == null) {
            return ResponseEntity.badRequest().body("User doesnt exist");
        }
        Pageable page = PageRequest.of(0, 8);
        return ResponseEntity.ok().body(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, page));
    }

    @PostMapping("/{id}")
    public void markAsRead(@PathVariable String id, Authentication auth) {
        service.readNotification(id);
    }


    
}
