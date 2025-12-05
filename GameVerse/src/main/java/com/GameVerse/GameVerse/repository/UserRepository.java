package com.GameVerse.GameVerse.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.GameVerse.GameVerse.model.User;


@Repository
public interface UserRepository extends MongoRepository<User, String>{
    User findByUsernameIgnoreCase(String username);
    //User findByEmail(String email);
    @Query(value = "{ 'username' : { $regex : ?0, $options: 'i' } }", exists = true)
    boolean existsByUsername(String username);
    List<User> findByUsernameContainingIgnoreCase(String text);
}

