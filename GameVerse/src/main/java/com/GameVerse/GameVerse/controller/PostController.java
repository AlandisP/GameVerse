package com.GameVerse.GameVerse.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.GameVerse.GameVerse.model.Post;
import com.GameVerse.GameVerse.repository.CommunityRepository;
import com.GameVerse.GameVerse.repository.PostRepository;
import com.GameVerse.GameVerse.repository.UserRepository;

@RestController
@RequestMapping("/post")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {
    @Autowired
    private PostRepository postRepo;
    @Autowired
    private UserRepository userRep;
    @Autowired
    private CommunityRepository comRepo;
    static class PostContent{
        public String body;
    }
    static class nsg{
        public String bod;
    }
    static class PostInf{
        public String id;
    }
    static class PostContentCom {
        public String body;
        public String communityName;
    }
    @PostMapping("/makepost")
    public ResponseEntity<String> makepost(@RequestBody PostContent content, Authentication auth){
        String username = userRep.findById(auth.getPrincipal().toString()).get().getUsername();
        Post newPost = new Post(content.body,username);
        newPost.setTag(userRep.findById(auth.getPrincipal().toString()).get().getPlatform());
        postRepo.save(newPost);
        return ResponseEntity.ok().body(newPost.getId());
    }

    @PostMapping("/makecommunitypost")
    public ResponseEntity<?> makeCommunityPost(@RequestBody PostContentCom content, Authentication auth) {
        String username = userRep.findById(auth.getPrincipal().toString()).get().getUsername();
        String commId = comRepo.findByNameIgnoreCase(content.communityName).getId();
        Post newComPost = new Post(content.body, username, commId);
        newComPost.setTag(userRep.findById(auth.getPrincipal().toString()).get().getPlatform());
        postRepo.save(newComPost);
        return ResponseEntity.ok().body(newComPost.getId());
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deletePost(@RequestBody String postId, Authentication auth) {
        Post post = postRepo.findById(postId).orElse(null);
        String username = userRep.findById(auth.getPrincipal().toString()).get().getUsername();
        if(post == null) {
            return ResponseEntity.badRequest().body("Post not found");
        }
        if(!post.getUser().equalsIgnoreCase(username)) {
            return ResponseEntity.badRequest().body("user does not own this Post"); 
        }
        postRepo.delete(post);
        return ResponseEntity.ok("Post successfully deleted");
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
