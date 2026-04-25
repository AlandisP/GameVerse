package com.GameVerse.GameVerse.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.GameVerse.GameVerse.model.FollowRequest;

@Repository
public interface FollowRequestRepository extends MongoRepository<FollowRequest, String> {
    Optional<FollowRequest> findBySenderIdAndReceiverId(String senderId, String receiverId);
    List<FollowRequest> findByReceiverId(String receiverId);
    List<FollowRequest> findBySenderId(String senderId);     
    void deleteBySenderIdAndReceiverId(String senderId, String receiverId);
    boolean existsBySenderIdAndReceiverId(String senderId, String receiverId);
}