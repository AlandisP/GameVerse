package com.GameVerse.GameVerse.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.GameVerse.GameVerse.model.User;


@Repository
public interface UserRepository extends MongoRepository<User, String>{
    User findByUsername(String username);
    //User findByEmail(String email);
    boolean existsByUsername(String username);
}

