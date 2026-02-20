package com.GameVerse.GameVerse.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    private String userId;
    private String type;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;


    public Notification(String userId, String type, String message) {
        this.userId = userId;
        this.type = type;
        this.message = message;
        read = false;
        createdAt =  LocalDateTime.now();
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

    public LocalDateTime getTime() {
        return createdAt;
    }

    public void setTime(LocalDateTime time) {
        this.createdAt = time;
    }
}
