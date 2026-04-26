package com.GameVerse.GameVerse.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.GameVerse.GameVerse.model.FollowRequest;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.FollowRequestRepository;
import com.GameVerse.GameVerse.repository.RelationshipRepository;
import com.GameVerse.GameVerse.repository.UserRepository;

@Service
public class FollowRequestService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FollowRequestRepository frRepository;

    @Autowired
    private RelationshipRepository relationshipRepository;

    @Autowired
    private RelationshipServices service;
    
    // Send a follow request
    public void sendARequest(String userId, String acctId) {
        User user = userRepository.findById(userId).orElse(null);
        User privUser = userRepository.findById(acctId).orElse(null);

        if(user == null || privUser == null) {
            throw new RuntimeException("User doesnt exist");
        }
        if(relationshipRepository.existsByFollowerIdAndFollowingId(userId, acctId)) {
            throw new RuntimeException("Relationship already exist");
        }
        if(frRepository.existsBySenderIdAndReceiverId(userId, acctId)) {
            throw new RuntimeException("Request already exists");
        }

        FollowRequest newReq = new FollowRequest(userId, acctId);
        frRepository.save(newReq);
    }
    // cancel a request
    public void cancelRequest(String userId, String acctId) {
        // User user = userRepository.findById(userId).orElse(null);
        // User privUser = userRepository.findById(acctId).orElse(null);
        FollowRequest req = frRepository.findBySenderIdAndReceiverId(userId, acctId).orElse(null);
        if(req == null) {
            throw new RuntimeException("Request doesn't exist");
        }
        frRepository.delete(req);
    }
    // true or false and follows the user if true. very simple approach
    public void requestChoice(String reqId, boolean choice) {
        FollowRequest req = frRepository.findById(reqId).orElse(null);
        if(req == null) {
            throw new RuntimeException("Relationship doesnt exist.");
        }
        if(choice) {
            service.followUser(req.getSenderId(), req.getReceiverId());
            frRepository.delete(req);
        } else {
            frRepository.delete(req);
        }
    }
}
