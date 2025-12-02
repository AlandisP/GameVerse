package com.GameVerse.GameVerse.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    @Indexed(unique = true)  
    //private String email; //This is entirely optional
    private String username;
    private String password;
    private String bio;
    private String platform;
    private Role role;
    private int followerCount;
    private int followingCount;

    public User() {

    }

    // public User(String name, String password, String email) {
    //     this.email = email;
    //     this.username = name;
    //     this.password = password;
    //     role = Role.USER;

    // }

    public User(String name, String password) {
        //this.email = "";
        this.username = name;
        this.password = password;
        this.bio = "";
        this.followerCount = 0;
        this.followingCount = 0;
        this.platform = "";
        role = Role.USER;
    }

    public String getPlatform() {
        return platform;
    }

    public String getId() {
        return this.id;
    }

    public int getFollowerCount() {
        return followerCount;
    }

    public int getFollowingCount() {
        return followingCount;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public Role getRole() {
        return role;
    }

    public String getBio() {
        return bio;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setFollowingCount(int followingCount) {
        this.followingCount = followingCount;
    }

    public void setFollowerCount(int followerCount) {
        this.followerCount = followerCount;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }




}
