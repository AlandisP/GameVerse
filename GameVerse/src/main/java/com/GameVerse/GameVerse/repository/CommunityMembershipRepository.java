package com.GameVerse.GameVerse.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.GameVerse.GameVerse.model.CommunityMembership;

@Repository
public interface CommunityMembershipRepository extends MongoRepository<CommunityMembership, String>{
    boolean existsByCommunityIdAndUserId(String communityId, String userId);
    CommunityMembership findByCommunityIdAndUserId(String communityId, String userId);
    List<CommunityMembership> findByCommunityId(String communityId);
    List<CommunityMembership> findAllByUserId(String userId);
    List<CommunityMembership> findTop5ByUserId(String userId);
    void deleteByUserIdAndCommunityId(String userId, String communityId);
    void deleteAllByCommunityId(String communityId);
    long countByCommunityId(String communityId);
    
}
