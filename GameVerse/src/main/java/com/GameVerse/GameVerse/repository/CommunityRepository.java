package com.GameVerse.GameVerse.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.GameVerse.GameVerse.model.Community;
import com.GameVerse.GameVerse.model.CommunityCategory;
@Repository
public interface CommunityRepository extends MongoRepository<Community, String>{
    List<Community> findByDescription(String description);
    List<Community> findByNameContainingIgnoreCase(String name);
    List<Community> findByCategory(CommunityCategory category);
    List<Community> findTop3ByOrderByMemberCountDesc();
    List<Community> findTop3ByCategoryOrderByMemberCountDesc(CommunityCategory category);
    boolean existsByNameIgnoreCase(String name);
    Community findByNameIgnoreCase(String name);
}
