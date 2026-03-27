package com.GameVerse.GameVerse.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.GameVerse.GameVerse.model.BlockingRelationship;
import com.GameVerse.GameVerse.model.Relationship;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.BlockedRelationshipRepository;
import com.GameVerse.GameVerse.repository.RelationshipRepository;
import com.GameVerse.GameVerse.repository.UserRepository;

@Service
public class BlockedService {
    @Autowired
    private BlockedRelationshipRepository blockedRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RelationshipRepository relationshipRepository;
    @Autowired 
    private RelationshipServices relationshipServices;

    //get users block list(Strings)
    public List<String> getBlockList(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if(user == null) {
            throw new RuntimeException("User is null");
        }
        //List of UserIds
        List<String> arr = blockedRepository.findAllByUserId(userId).stream().map(BlockingRelationship::getBlockedId).collect(Collectors.toList());
        return arr.stream().map(id -> userRepository.findById(id).orElse(null).getUsername()).collect(Collectors.toList());
    }


    public List<String> getBlockListIds(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if(user == null) {
            throw new RuntimeException("User is null");
        }
        //List of UserIds
        return blockedRepository.findAllByUserId(userId).stream().map(BlockingRelationship::getBlockedId).collect(Collectors.toList());
        
    }

    public List<String> getBlockedListIds(String blockedId) {
        User user = userRepository.findById(blockedId).orElse(null);
        if(user == null) {
            throw new RuntimeException("User is null");
        }
        return blockedRepository.findAllByBlockedId(blockedId).stream().map(BlockingRelationship::getUserId).collect(Collectors.toList());
    }

    //block a user
    public void blockUser(String userId, String blockedId) {
        User user1 = userRepository.findById(userId).orElse(null);
        User user2 = userRepository.findById(blockedId).orElse(null);
        if(user1 == null || user2 == null) {
            throw new RuntimeException("One of the users are null");
        }
        //case if user blocks a followed user
        if(relationshipRepository.existsByFollowerIdAndFollowingId(userId, blockedId)) {
            Relationship ship = relationshipRepository.findByFollowerIdAndFollowingId(userId, blockedId);
            // blocked a followed user case
            if(ship.getFollowerId().equals(userId)) {
               relationshipServices.unfollowUser(userId, blockedId); 
            } else {
                // the otherway around
                relationshipServices.unfollowUser(blockedId, userId);
            }
            //relationshipServices.unfollowUser(userId, blockedId);
            BlockingRelationship blocked = new BlockingRelationship(userId, blockedId);
            blockedRepository.save(blocked);
            user1.setBlockedCount((int)blockedRepository.countByUserId(userId));
            return;   
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
