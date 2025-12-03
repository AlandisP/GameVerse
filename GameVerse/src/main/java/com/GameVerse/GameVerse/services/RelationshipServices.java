package com.GameVerse.GameVerse.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.GameVerse.GameVerse.model.Relationship;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.RelationshipRepository;
import com.GameVerse.GameVerse.repository.UserRepository;

@Service
public class RelationshipServices {
    @Autowired
    RelationshipRepository relationshipRepository;

    @Autowired
    UserRepository userRepository;

    public void followUser(String followerId, String followingId) {
        if(relationshipRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            return;
        }

        Relationship relationship = new Relationship(followerId, followingId);
        relationshipRepository.save(relationship);
        User user1 = userRepository.findById(followerId).orElseThrow();
        user1.setFollowingCount((int)relationshipRepository.countByFollowerId(followerId));
        userRepository.save(user1);

        User user2 = userRepository.findById(followingId).orElseThrow();
        user2.setFollowerCount((int)relationshipRepository.countByFollowingId(followingId));
        userRepository.save(user2);
        
    }

    public void unfollowUser(String followerId, String followingId) {
        relationshipRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);

        User user1 = userRepository.findById(followerId).orElseThrow();
        user1.setFollowingCount((int)relationshipRepository.countByFollowerId(followerId));
        userRepository.save(user1);

        User user2 = userRepository.findById(followingId).orElseThrow();
        user2.setFollowerCount((int)relationshipRepository.countByFollowingId(followingId));
        userRepository.save(user2);
    }

    public List<String> getFollowingList(String userId) {
        return relationshipRepository.findByFollowingId(userId)
            .stream()
            .map(Relationship::getFollowerId)
            .collect(Collectors.toList());
    }

    public List<String> getFollowerList(String userId) {
        return relationshipRepository.findByFollowerId(userId)
            .stream()
            .map(Relationship::getFollowingId)
            .collect(Collectors.toList());
    }

    public boolean isFollowing(String followerId, String followingId) {
        return relationshipRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }


    
}
