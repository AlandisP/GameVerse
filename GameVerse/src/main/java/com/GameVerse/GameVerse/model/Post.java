package com.GameVerse.GameVerse.model;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.GameVerse.GameVerse.repository.UserRepository;

@Document(collection = "posts")
public class Post {

    @Autowired
    private UserRepository repository;

    @Id
    private String id;
    // @Indexed(unique = true)  
    private String text;
    private String userId;
    private String tag;

    public Post(String body, String uid){
        this.text = body;
        this.userId = uid;
        this.tag = repository.findById(userId).get().getPlatform();
    }

    public String getId(){
        return this.id;
    }
    public String getText(){
        return this.text;
    }
    public String getTag(){
        return this.tag;
    }
    public String getUser(){
        return this.userId;
    }
    
    
}
