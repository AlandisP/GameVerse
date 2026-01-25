package com.GameVerse.GameVerse.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.GameVerse.GameVerse.model.Category;
import com.GameVerse.GameVerse.model.PartyFinder;

@Repository
public interface PartyFinderRepository extends MongoRepository<PartyFinder, String>{
    PartyFinder findByNameIgnoreCase(String name);
    PartyFinder findByMembersContaining(String userId);
    List<PartyFinder> findByNameContainingIgnoreCase(String chars);
    List<PartyFinder> findByDescriptionContainingIgnoreCase(String description);
    List<PartyFinder> findByCategoriesContaining(Category category);
    List<PartyFinder> findByCategoriesIn(List<Category> categories);
    PartyFinder findByCreatorId(String id);
    boolean existsByName(String name);
    boolean existsByMembersContaining(String userId);
}