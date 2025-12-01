package com.GameVerse.GameVerse.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.GameVerse.GameVerse.model.PartyFinder;

@Repository
public interface PartyFinderRepository extends MongoRepository<PartyFinder, String>{
    List<PartyFinder> findByNameIgnoreCase(String name);
    List<PartyFinder> findByNameContainingIgnoreCase(String chars);
    List<PartyFinder> findByDescriptionContainingIgnoreCase(String description);
    //List<PartyFinder> findByCategory(Category category);
    List<PartyFinder> findByCreatorId(String id);
}