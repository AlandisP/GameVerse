package com.GameVerse.GameVerse.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "communities")
public class Community {
    @Id
    private String id;
    private String ownerId;
    private List<String> moderatorIds;
    private String name;
    private String description;
    private int memberCount;
    private int postCount;

    private CommunityCategory category;

    public Community(String ownerId, String name, String description, CommunityCategory category) {
        this.ownerId = ownerId;
        this.name = name;
        this.description = description;
        this.category = category;
        memberCount = 1;
        postCount = 0;
    }

    public String getId() {
        return id;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public List<String> getModeratorIds() {
        return moderatorIds;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public int getMemberCount() {
        return memberCount;
    }

    public int getPostCount() {
        return postCount;
    }

    public void setOwnerId(String id) {
        this.ownerId = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void addModerator(String userId) {
        moderatorIds.add(userId);
        //memberCount++;
    }

    public void setMemberCount(int memberCount) {
        this.memberCount = memberCount;
    }

    public void setPostCount(int postCount) {
        this.postCount = postCount;
    }
    
}
