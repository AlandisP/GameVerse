package com.GameVerse.GameVerse.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.GameVerse.GameVerse.model.BlockingRelationship;
import com.GameVerse.GameVerse.model.Community;
import com.GameVerse.GameVerse.model.Post;
import com.GameVerse.GameVerse.model.Relationship;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.BlockedRelationshipRepository;
import com.GameVerse.GameVerse.repository.CommunityRepository;
import com.GameVerse.GameVerse.repository.PostRepository;
import com.GameVerse.GameVerse.repository.RelationshipRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.security.S3Service;
import com.GameVerse.GameVerse.services.BlockedService;
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
    @Autowired
    private RelationshipRepository relationshipRepository;
    @Autowired
    private S3Service s3serv;
    @Autowired
    private MongoTemplate mongoTemplate;
    @Autowired
    private BlockedRelationshipRepository blockedRepository;
    @Autowired
    private BlockedService blockedService;

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
    public ResponseEntity<String> makepost(@RequestParam("body") String content, @RequestParam(value = "media", required = false) MultipartFile media, Authentication auth){
        try{
        //System.out.println(media.getOriginalFilename());
        String username = userRep.findById(auth.getPrincipal().toString()).get().getUsername();
        Post newPost = new Post(content,username, null, null);
        newPost.setTag(userRep.findById(auth.getPrincipal().toString()).get().getPlatform());
        newPost.setmediaType(media.getContentType());
        if(media!=null){
            System.out.println(media.getOriginalFilename());
            String medianame = s3serv.uploadFile(media, username);
            System.out.println("upload successful");
            newPost.setmedia(medianame);
        }
        // if(media!=null){
        //     String medianame = s3serv.testFile(media);
        //     newPost.setmedia(medianame);
        // }
        //System.out.println("Test media: "+medianame);
        postRepo.save(newPost);
        return ResponseEntity.ok().body(newPost.getId());
        }
        catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("000");
        }
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
    public ResponseEntity<List<Post>> getapost(Authentication auth){
        String userId = (String) auth.getPrincipal();
        // users that the auth has blocked
        List<String> blockedIds = getBlockedIds(userId);
        // list of users that auth is blocked by
        List<String> nopes = blockedService.getBlockedListIds(userId);
        List<Post> result = postRepo.findAll()
            .stream()
            .filter(post -> {
                User poster = userRep.findByUsernameIgnoreCase(post.getUser());
                return poster != null 
                    && !blockedIds.contains(poster.getId())
                    && !nopes.contains(poster.getId());
            })
            .collect(Collectors.toList());

        Collections.reverse(result);
        return ResponseEntity.ok().body(result);
    }

    @GetMapping("/{username}/posts")
    public ResponseEntity<?> getUserPosts(@PathVariable String username, Authentication auth) {
        try{
            return ResponseEntity.ok(fetchUserPosts(username));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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

    //gets all community posts
    @GetMapping("/{communityName}/community/posts")
    public ResponseEntity<?> getCommunityPost(@PathVariable String communityName, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        List<String> blockedIds = getBlockedIds(userId);
        List<String> nopes = blockedService.getBlockedListIds(userId);
        Community com = communityRepository.findByNameIgnoreCase(communityName);
        if(com == null) {
            return ResponseEntity.badRequest().body("CommunityDoesnt exist");
        }
        List<Post> posts = postRepo.findAllByCommunityId(com.getId())
            .stream()
            .filter(post -> {
                User poster = userRep.findByUsernameIgnoreCase(post.getUser());
                return poster != null
                    && !blockedIds.contains(poster.getId())
                    && !nopes.contains(poster.getId());
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(posts);
    }
    // gets all Following Posts
    @GetMapping("/getFollowingPosts")
    public ResponseEntity<?> getFollowingPost(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        List<String> blockedIds = getBlockedIds(userId);

        List<Relationship> following = relationshipRepository.findAllByFollowerId(userId);

        List<Post> followingPosts = new ArrayList<>();
        for (Relationship r : following) {
            if (!blockedIds.contains(r.getFollowingId())) {
                List<Post> userPosts = fetchUserPosts(userRep.findById(r.getFollowingId()).orElse(null).getUsername());
                followingPosts.addAll(userPosts);
            }
        }
        Collections.shuffle(followingPosts);
        return ResponseEntity.ok(followingPosts);
    }

    @GetMapping("/liked/{username}")
    public List<Post> getLikedPosts(@PathVariable String username) {
        Query query = new Query(Criteria.where("liked." + username).is(true));
        return mongoTemplate.find(query, Post.class);
    }

    // Helper Function(s)
    private List<Post> fetchUserPosts(String username) {
        User user = userRep.findByUsernameIgnoreCase(username);
        if (user == null) {
            throw new RuntimeException("User doesn't exist");
        }
        List<Post> result = postRepo.findAllByUserIdIgnoreCase(username);
        Collections.reverse(result);
        return result;
    }

    private List<String> getBlockedIds(String userId) {
        return blockedRepository.findAllByUserId(userId)
                .stream()
                .map(BlockingRelationship::getBlockedId)
                .collect(Collectors.toList());
    }
}
