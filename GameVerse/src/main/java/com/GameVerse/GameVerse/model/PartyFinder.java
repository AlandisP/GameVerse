package com.GameVerse.GameVerse.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection ="parties")
public class PartyFinder {

    @Id
    private String id;
    @Indexed(unique = true)  
    private String creatorId;
    private String name;
    private String description;
    private int maxMembers;
    private ArrayList<String> members;
    private Status status;
    private List<Category> categories;
    private Instant createdAt;

    public PartyFinder() {

    }

    public PartyFinder(String creatorId, String name, String description, int maxMembers, List<Category> categories) {
        this.creatorId = creatorId;
        this.name = name;
        this.description = description;
        this.maxMembers = maxMembers;
        this.categories = categories;
        members = new ArrayList<>();
        members.add(creatorId);
        this.status = Status.WAITING;
        createdAt = Instant.now();

    }

    public Status getStatus() {
        return status;
    }

    public String getId() {
        return id;
    }

    public String getCreatorId() {
        return creatorId;
    }

    public List<Category> getCategories() {
        return categories;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public int getMaxMembers() {
        return maxMembers;
    }

    public int getCurrentNumMembers(){
        return members.size();
    }

    public ArrayList<String> getMembers() {
        return members;
    }

    public void addMember(String userId) {
        members.add(userId);
        if(members.size() == maxMembers) {
            this.status = Status.FULL;
        }
    }

    public void removeMember(String userId) {
        members.remove(userId);
        if(members.size() < maxMembers) {
            this.status = Status.WAITING;
        }
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public void setMembers(ArrayList<String> members) {
        this.members = members;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCategories(List<Category> cats) {
        this.categories = cats;
    }

    public void setMaxMembers(int mems) {
        this.maxMembers = mems;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setTime(Instant time) {
        this.createdAt = time;
    }



    
    

    
}

