package com.GameVerse.GameVerse.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.GameVerse.GameVerse.model.Relationship;

@Repository
public interface RelationshipRepository extends MongoRepository<Relationship, String>{

    boolean existsByFollowerIdAndFollowingId(String followerId, String followingId);
    
    List<Relationship> findByFollowerId(String followerId);

    List<Relationship> findByFollowingId(String followingId);

    void deleteByFollowerIdAndFollowingId(String followerId, String followingId);

    long countByFollowerId(String followerId);

    long countByFollowingId(String followingId);


}
