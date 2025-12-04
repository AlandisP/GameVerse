package com.GameVerse.GameVerse.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.PostRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.services.RelationshipServices;

import com.GameVerse.GameVerse.model.Post;

@RestController
@RequestMapping("/post")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {
    @Autowired
    private PostRepository postRepo;
    static class PostContent{
        public String body;
    }
    @PostMapping("/makepost")
    public ResponseEntity<?> makepost(@RequestBody PostContent content, Authentication auth){
        Post newPost = new Post(content.body,auth.getPrincipal().toString());
        postRepo.save(newPost);
        return ResponseEntity.ok().build();
    }
}
