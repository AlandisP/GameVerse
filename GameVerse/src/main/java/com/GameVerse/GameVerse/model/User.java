package com.GameVerse.GameVerse.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    @Indexed(unique = true)  
    private String username;
    private String password;

    public User() {
        System.out.println("Jamius");

    }

    public User(String name, String password) {
        this.username = name;
        this.password = password;
    }

    public String getId() {
        return this.id;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }



}
