package com.GameVerse.GameVerse.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
// model for notifications
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    private String userId;
    private String type;
    private String message;
    private boolean read;
    private Instant createdAt;



    public Notification(String userId, String type, String message) {
        this.userId = userId;
        this.type = type;
        this.message = message;
        read = false;
        createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getType() {
        return type;
    }

    public String getMessage() {
        return message;
    }

    public boolean getRead() {
        return read;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setType(String type) {
        this.type = type;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setTime(Instant time) {
        this.createdAt = time;
    }
}
