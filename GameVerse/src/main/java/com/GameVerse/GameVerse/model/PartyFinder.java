package com.GameVerse.GameVerse.model;

import java.util.ArrayList;

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
    private ArrayList<Category> categories;

    public PartyFinder() {

    }

    public PartyFinder(String creatorId, String name, String description, int maxMembers) {
        this.creatorId = creatorId;
        this.name = name;
        this.description = description;
        this.maxMembers = maxMembers;
        categories = new ArrayList<>();
        members = new ArrayList<>();
        members.add(creatorId);
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
    

    
}

