package com.GameVerse.GameVerse.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "relationships")
public class Relationship {
    @Id
    private String id;
    //@Indexed(unique = true) 
    private String followerId;
    private String followingId;

    public Relationship(String followerId, String followingId){
        this.followerId = followerId;
        this.followingId = followingId;
    }

    public String getId() {
        return id;
    }

    public String getFollowerId() {
        return followerId;
    }

    public String getFollowingId() {
        return followingId;
    }

    
}
