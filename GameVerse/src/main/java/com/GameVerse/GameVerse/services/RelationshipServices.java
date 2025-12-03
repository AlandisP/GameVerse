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
    private RelationshipRepository relationshipRepository;

    @Autowired
    private UserRepository userRepository;

    // ---- FOLLOW USER ----
    public void followUser(String followerId, String followingId) {
        // Prevent duplicate follows
        if (relationshipRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            return;
        }

        // Create relationship entry
        Relationship relationship = new Relationship(followerId, followingId);
        relationshipRepository.save(relationship);

        // Update following count for follower
        User follower = userRepository.findById(followerId).orElseThrow();
        follower.setFollowingCount((int) relationshipRepository.countByFollowerId(followerId));
        userRepository.save(follower);

        // Update follower count for the user being followed
        User target = userRepository.findById(followingId).orElseThrow();
        target.setFollowerCount((int) relationshipRepository.countByFollowingId(followingId));
        userRepository.save(target);
    }

    // ---- UNFOLLOW USER ----
    public void unfollowUser(String followerId, String followingId) {
        relationshipRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);

        // Update following count for follower
        User follower = userRepository.findById(followerId).orElseThrow();
        follower.setFollowingCount((int) relationshipRepository.countByFollowerId(followerId));
        userRepository.save(follower);

        // Update follower count for the user that was unfollowed
        User target = userRepository.findById(followingId).orElseThrow();
        target.setFollowerCount((int) relationshipRepository.countByFollowingId(followingId));
        userRepository.save(target);
    }

    // ---- GET LIST OF USERS THIS PERSON FOLLOWS ----
    public List<String> getFollowingList(String userId) {
        return relationshipRepository.findByFollowerId(userId)
                .stream()
                .map(Relationship::getFollowingId)
                .collect(Collectors.toList());
    }

    // ---- GET LIST OF PEOPLE WHO FOLLOW THIS PERSON ----
    public List<String> getFollowerList(String userId) {
        return relationshipRepository.findByFollowingId(userId)
                .stream()
                .map(Relationship::getFollowerId)
                .collect(Collectors.toList());
    }

    // ---- CHECK IF FOLLOWING ----
    public boolean isFollowing(String followerId, String followingId) {
        return relationshipRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }
}
