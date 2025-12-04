package com.GameVerse.GameVerse.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.GameVerse.GameVerse.model.Post;

@Repository
public interface PostRepository extends MongoRepository<Post, String>{
    Post findByText(String text);
    Post findByuserId(String userId);
}
