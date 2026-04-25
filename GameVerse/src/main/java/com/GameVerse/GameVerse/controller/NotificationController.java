package com.GameVerse.GameVerse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.GameVerse.GameVerse.model.Notification;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.NotificationRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.services.NotificationService;
import com.GameVerse.GameVerse.services.RecommendationService;

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

    @Autowired
    private RecommendationService recService;

    @GetMapping("/{username}")
    public ResponseEntity<?> getUnreadNotifications(@PathVariable String username, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = userRepository.findById(userId).orElse(null);
        if(user == null) {
            return ResponseEntity.badRequest().body("User doesnt exist");
        }
        Pageable page = PageRequest.of(0, 8);
        return ResponseEntity.ok().body(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping("/markRead/{id}")
    public ResponseEntity<?> markAsRead(@PathVariable String id, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        service.readNotification(id);
        return ResponseEntity.ok().build();

    }

    @GetMapping("/count")
    public ResponseEntity<?> getNotificationCount(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = userRepository.findById(userId).orElse(null);
        if(user == null) {
            return ResponseEntity.badRequest().body("User doesnt exist");
        }
        Long  count = notificationRepository.countByUserIdAndReadFalse(userId);
        return ResponseEntity.ok().body(count);
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(recService.followRecommendations(userId));
    }

    @DeleteMapping("/deleteNoti/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        Notification noti = notificationRepository.findById(id).orElse(null);
        notificationRepository.delete(noti);
        return ResponseEntity.ok("deleted");
    }

    @DeleteMapping("/deleteAllNotis")
    public ResponseEntity<?> deleteAllNotis(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        notificationRepository.deleteAllByUserId(userId);
        return ResponseEntity.ok("All Deleted");
    }



    
}
