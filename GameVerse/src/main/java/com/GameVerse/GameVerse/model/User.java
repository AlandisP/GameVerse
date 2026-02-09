package com.GameVerse.GameVerse.model;

import java.util.ArrayList;
import java.util.List;

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
    private String bio;
    private String platform;
    private Role role;

    // These are COUNT values only.
    private int followerCount;
    private int followingCount;

    private ArrayList<String> bookMarks;

    public User() {}

    public User(String username, String password) {
        this.username = username;
        this.password = password;
        this.bio = "";
        this.platform = "";
        this.role = Role.USER;
        this.followerCount = 0;
        this.followingCount = 0;
        bookMarks = new ArrayList<>();
    }

    // ---- Getters ----

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getBio() {
        return bio;
    }

    public String getPlatform() {
        return platform;
    }

    public Role getRole() {
        return role;
    }

    public int getFollowerCount() {
        return followerCount;
    }

    public int getFollowingCount() {
        return followingCount;
    }

    // ---- Setters ----

    public void setId(String id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setFollowerCount(int followerCount) {
        this.followerCount = followerCount;
    }

    public void setFollowingCount(int followingCount) {
        this.followingCount = followingCount;
    }

    public void addBookmark(String post){
        if(bookMarks == null){
            bookMarks = new ArrayList<>();
        }
        if(!bookMarks.contains(post)){
            bookMarks.add(post);
        }else{
            bookMarks.remove(post);
        }
    }

    public void removeBookmark(String post){

    }

    public ArrayList<String> getbookMarks(){
        return bookMarks;
    }

    // public void setbookMarks(ArrayList<String> input){
    //     bookMarks = input;
    // }
}
