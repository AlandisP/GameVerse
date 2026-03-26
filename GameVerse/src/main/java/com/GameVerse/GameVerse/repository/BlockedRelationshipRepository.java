package com.GameVerse.GameVerse.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.GameVerse.GameVerse.model.BlockingRelationship;

@Repository
public interface  BlockedRelationshipRepository extends MongoRepository<BlockingRelationship, String> {
    boolean existByUserIdAndBlockedId(String userId, String blockedId);
    List<BlockingRelationship> findAllByUserId(String userId);
    BlockingRelationship findByUserIdAndBlockedId(String userId, String blockedId);
    void deleteByUserIdAndBlockedId(String userId, String blockedId);
    void deleteAllByUserId(String userId);
    void deleteAllByBlockedId(String blockedId);
    long countByUserId(String userId);
    
}
