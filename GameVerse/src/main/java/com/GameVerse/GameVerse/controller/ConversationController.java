package com.GameVerse.GameVerse.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.GameVerse.GameVerse.model.Conversation;
import com.GameVerse.GameVerse.services.ConversationService;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = "http://localhost:3000")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @PostMapping("/direct")
    public ResponseEntity<?> createDirectConversation(@RequestBody Map<String, String> body) {
        try {
            String currentUsername = body.get("currentUsername");
            String targetUsername = body.get("targetUsername");

            Conversation conversation = conversationService.createDirectConversation(
                    currentUsername,
                    targetUsername
            );

            return ResponseEntity.ok(conversation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/groups")
    public ResponseEntity<?> createGroupConversation(@RequestBody Map<String, Object> body) {
        try {
            String currentUsername = (String) body.get("currentUsername");
            String title = (String) body.get("title");

            @SuppressWarnings("unchecked")
            List<String> usernames = (List<String>) body.get("usernames");

            Conversation conversation = conversationService.createGroupConversation(
                    currentUsername,
                    title,
                    usernames
            );

            return ResponseEntity.ok(conversation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMyConversations(@RequestParam String currentUsername) {
        try {
            List<Conversation> conversations = conversationService.getUserConversations(currentUsername);
            return ResponseEntity.ok(conversations);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}