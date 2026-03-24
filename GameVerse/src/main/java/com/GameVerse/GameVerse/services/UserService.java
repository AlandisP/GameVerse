package com.GameVerse.GameVerse.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.GameVerse.GameVerse.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    UserRepository userrep;

    public String getUserPFP(String user){
        return userrep.findByUsernameIgnoreCase(user).getpfp();
    }
}
