package com.GameVerse.GameVerse.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.GameVerse.GameVerse.model.Community;
import com.GameVerse.GameVerse.model.Post;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.CommunityRepository;
import com.GameVerse.GameVerse.repository.PostRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.services.CommunityService;
import com.GameVerse.GameVerse.services.NotificationService;


@RestController
@RequestMapping("/post")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {
    @Autowired
    private PostRepository postRepo;
    @Autowired
    private UserRepository userRep;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private CommunityRepository communityRepository;
    @Autowired
    private CommunityService communityService;

    public static final String type = "Post";
    static class PostContent{
        public String body;
    }
    static class PostCommunityContent{
        public String id;
        public String body;
    }
    static class nsg{
        public String bod;
    }
    static class PostInf{
        public String id;
    }

    static class commentinf{
        public String id;
        public String content;
    }

    @PostMapping("/makepost")
    public ResponseEntity<String> makepost(@RequestBody PostContent content, Authentication auth){
        String username = userRep.findById(auth.getPrincipal().toString()).get().getUsername();
        Post newPost = new Post(content.body,username, null, null);
        newPost.setTag(userRep.findById(auth.getPrincipal().toString()).get().getPlatform());
        postRepo.save(newPost);
        return ResponseEntity.ok().body(newPost.getId());
    }
    // @GetMapping("/getposts")
    // public List<Post> getpost(){
    //     return postRepo.findAll();
    // }

    @PostMapping("/makecommunitypost")
    public ResponseEntity<?> makecommunitypost(@RequestBody PostCommunityContent content, Authentication auth) {
        String username = userRep.findById(auth.getPrincipal().toString()).get().getUsername();
        communityService.communityPost(content.id, username, content.body);
        return ResponseEntity.ok().body("new Post successfully created");
    }
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
        if(!user.equals(target.getUser())){
            String message = user + " has liked your post";
            notificationService.createNotification(type, message, userRep.findByUsernameIgnoreCase(target.getUser()).getId());
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/getbooks")
    public ResponseEntity<ArrayList<String>> getthebooks(Authentication auth){
        ArrayList<String> result = userRep.findById(auth.getPrincipal().toString()).get().getbookMarks();
        return ResponseEntity.ok().body(result);
    }

    @PostMapping("/bookpost")
    public ResponseEntity<?> bookapost(@RequestBody PostInf info, Authentication auth){
        String target = postRepo.findByid(info.id).getId();
        User person = userRep.findById(auth.getPrincipal().toString()).get();
        person.addBookmark(target);
        userRep.save(person);
        //System.out.println("User: "+person.getUsername()+" booked post: "+target.toString());
        String message = person.getUsername() + " has bookmarked your post.";
        notificationService.createNotification(type, message, userRep.findByUsernameIgnoreCase(postRepo.findById(target).orElse(null).getUser()).getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/comment")
    public ResponseEntity<Boolean> makecomment(@RequestBody commentinf content, Authentication auth){
        String username = userRep.findById(auth.getPrincipal().toString()).get().getUsername();
        Post current = postRepo.findById(content.id).get();
        current.addcomment(username,content.content);
        postRepo.save(current);
        return ResponseEntity.ok().body(true);
    }

    @PostMapping("/getcomments")
    public ResponseEntity<ArrayList<Post.comment>> getcomment(@RequestBody PostInf content, Authentication auth){
        //String username = userRep.findById(auth.getPrincipal().toString()).get().getUsername();
        Post current = postRepo.findById(content.id).get();
        ArrayList<Post.comment> comments = current.getcomments();
        
        return ResponseEntity.ok().body(comments);
    }

    @GetMapping("/{communityName}/posts")
    public ResponseEntity<?> getCommunityPost(@PathVariable String communityName) {
        Community com = communityRepository.findByNameIgnoreCase(communityName);
        if(com == null) {
            return ResponseEntity.badRequest().body("CommunityDoesnt exist");
        }
        return ResponseEntity.ok(postRepo.findAllByCommunityId(com.getId()));
    }
}
