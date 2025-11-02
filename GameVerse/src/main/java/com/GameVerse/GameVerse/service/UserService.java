package com.GameVerse.GameVerse.service;

import java.util.List;

import com.GameVerse.GameVerse.model.User;

public interface UserService {
    public List<User> getAllUsers();
    public User findUserProfileByJwt(String jwt);
    public User findUserByEmail(String email);
    public User findUserById(String id);
    public List<User> findAllUsers();
    
}
