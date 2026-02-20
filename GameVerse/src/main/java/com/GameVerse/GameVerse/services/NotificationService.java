package com.GameVerse.GameVerse.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.GameVerse.GameVerse.model.Notification;
import com.GameVerse.GameVerse.repository.NotificationRepository;
import com.GameVerse.GameVerse.repository.UserRepository;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository repository;

    @Autowired
    private UserRepository userRepository;

    public void createNotification(String type, String message, String userId) {
        if(userRepository.findById(userId) == null) {
            throw new RuntimeException("User doesnt exist");
        }
        Notification n = new Notification(userId, type, message);
        repository.save(n);
    }

    public void readNotification(String id) {
        if(repository.findById(id) == null) {
            throw new RuntimeException("Notification doesnt exist");
        }
        Notification n = repository.findById(id).orElse(null);
        n.setRead(true);
        repository.save(n);
    }
    
}
