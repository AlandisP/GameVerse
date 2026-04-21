package com.GameVerse.GameVerse.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "requests")
public class FollowRequest {
    @Id
    private String id;

    private String senderId;
    private String receiverId;
    private Instant createdAt;

    public FollowRequest(String senderId, String receiverId) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.createdAt = Instant.now();

    }

    public String getId() { 
        return id; 
    }
    
    public String getSenderId() {
        return senderId; 
    }
    
    public String getReceiverId() { 
        return receiverId; 
    }

    public Instant getCreatedAt() { 
        return createdAt; 
    }
}
