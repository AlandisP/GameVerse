package com.GameVerse.GameVerse.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection ="blockingRelationships")
public class BlockingRelationship {
    @Id
    private String id;
    private String userId;
    private String blockedId;

    public BlockingRelationship(String userId, String blockedId) {
        this.userId = userId;
        this.blockedId = blockedId;
    }

    public String getId() {
        return id;
    }
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getBlockedId() {
        return blockedId;
    }

    public void setBlockedId(String blockedId) {
        this.blockedId = blockedId;
    }
    
}
