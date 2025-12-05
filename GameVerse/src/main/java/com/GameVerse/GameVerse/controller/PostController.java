package com.GameVerse.GameVerse.controller;

import java.util.List;
import java.util.Collections;

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
    @Autowired
    private UserRepository userRep;
    static class PostContent{
        public String body;
    }
    static class nsg{
        public String bod;
    }
    static class PostInf{
        public String id;
    }
    @PostMapping("/makepost")
    public ResponseEntity<String> makepost(@RequestBody PostContent content, Authentication auth){
        String username = userRep.findById(auth.getPrincipal().toString()).get().getUsername();
        Post newPost = new Post(content.body,username);
        newPost.setTag(userRep.findById(auth.getPrincipal().toString()).get().getPlatform());
        postRepo.save(newPost);
        return ResponseEntity.ok().body(newPost.getId());
    }
    // @GetMapping("/getposts")
    // public List<Post> getpost(){
    //     return postRepo.findAll();
    // }
    @GetMapping("/getposts")
    public ResponseEntity<List<Post>> getapost(){
        List<Post> result = postRepo.findAll();
        Collections.reverse(result);
        return ResponseEntity.ok().body(result);
    }
    @PostMapping("/likepost")
    public ResponseEntity<?> likeapost(@RequestBody PostInf info, Authentication auth){
        Post target = postRepo.findByid(info.id);
        String user = userRep.findById(auth.getPrincipal().toString()).get().getUsername();
        target.setALike(user);
        postRepo.save(target);
        return ResponseEntity.ok().build();
    }
}
