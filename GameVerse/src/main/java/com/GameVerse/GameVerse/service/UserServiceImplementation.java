package com.GameVerse.GameVerse.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.UserRepository;

@Service
public class UserServiceImplementation implements UserDetailsService{

    @Autowired
    private UserRepository userRepository;

    public UserServiceImplementation(UserRepository uR) {
        this.userRepository = uR;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
        User user = userRepository.findByUsername(username);
        System.out.println(user);

        if(user == null) {
            throw new UsernameNotFoundException("User not found with this name " + username);
        }

        System.out.println("Loaded user: " + user.getUsername());
        List<GrantedAuthority> authorities = new ArrayList<>();
        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), authorities);
    }
    
}
