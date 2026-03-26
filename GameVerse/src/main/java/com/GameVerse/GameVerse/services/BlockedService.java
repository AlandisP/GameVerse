package com.GameVerse.GameVerse.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.GameVerse.GameVerse.model.BlockingRelationship;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.BlockedRelationshipRepository;
import com.GameVerse.GameVerse.repository.UserRepository;

@Service
public class BlockedService {
    @Autowired
    private BlockedRelationshipRepository blockedRepository;
    @Autowired
    private UserRepository userRepository;

    //get users block list
    public List<String> getBlockList(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if(user == null) {
            throw new RuntimeException("User is null");
        }
        //List of UserIds
        List<String> arr = blockedRepository.findAllByUserId(userId).stream().map(BlockingRelationship::getBlockedId).collect(Collectors.toList());
        return arr.stream().map(id -> userRepository.findById(id).orElse(null).getUsername()).collect(Collectors.toList());
    }

    //block a user
    public void blockUser(String userId, String blockedId) {
        User user1 = userRepository.findById(userId).orElse(null);
        User user2 = userRepository.findById(blockedId).orElse(null);
        if(user1 == null || user2 == null) {
            throw new RuntimeException("One of the users are null");
        }
        BlockingRelationship blocked = new BlockingRelationship(userId, blockedId);
        blockedRepository.save(blocked);
        user1.setBlockedCount((int)blockedRepository.countByUserId(userId));
    }

    //unblock a user
    public void unblockUser(String userId, String blockedId) {
        BlockingRelationship relationship = blockedRepository.findByUserIdAndBlockedId(userId, blockedId);
        if(relationship == null) {
            throw new RuntimeException("Relationship doesn't exist");
        }
        User user1 = userRepository.findById(userId).orElse(null);
        blockedRepository.deleteByUserIdAndBlockedId(userId, blockedId);
        user1.setBlockedCount((int)blockedRepository.countByUserId(userId));


    }

    
    
}
