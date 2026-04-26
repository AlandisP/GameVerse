package com.GameVerse.GameVerse.controller;


import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.GameVerse.GameVerse.model.Community;
import com.GameVerse.GameVerse.model.CommunityMembership;
import com.GameVerse.GameVerse.model.FollowRequest;
import com.GameVerse.GameVerse.model.PartyFinder;
import com.GameVerse.GameVerse.model.Relationship;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.BlockedRelationshipRepository;
import com.GameVerse.GameVerse.repository.CommunityMembershipRepository;
import com.GameVerse.GameVerse.repository.CommunityRepository;
import com.GameVerse.GameVerse.repository.FollowRequestRepository;
import com.GameVerse.GameVerse.repository.PartyFinderRepository;
import com.GameVerse.GameVerse.repository.PostRepository;
import com.GameVerse.GameVerse.repository.RelationshipRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.security.S3Service;
import com.GameVerse.GameVerse.services.FollowRequestService;
import com.GameVerse.GameVerse.services.RecommendationService;
import com.GameVerse.GameVerse.services.RelationshipServices;


@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UsersController {

    @Autowired
    private RelationshipServices relationshipService;

    @Autowired
    private RecommendationService recService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PartyFinderRepository partyFinderRepo;
    @Autowired
    private BlockedRelationshipRepository blockedRelationshipRepository;
    @Autowired
    private CommunityMembershipRepository communityMembershipRepository;
    @Autowired
    private CommunityRepository communityRepository;
    @Autowired
    private RelationshipRepository relationshipRepository;
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private UserRepository repository;
    @Autowired 
    private FollowRequestRepository frRepository;
    @Autowired
    private FollowRequestService frService;

    @Autowired
    private S3Service s3serv;

    @GetMapping
    public List<User> getAllUsers() {
        return repository.findAll();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return repository.save(user);
    }
    // check if a user exist by username
    @GetMapping("/exists/{username}")
    public ResponseEntity<?> usernameExists(@PathVariable String username) {
    boolean exists = repository.existsByUsernameIgnoreCase(username);
    return ResponseEntity.ok(Map.of("exists", exists));
}

    @GetMapping("/{id}")
    public User getUserById(@PathVariable String id) {
        return repository.findById(id).orElse(null);
    }
    // useless endpoint
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        repository.deleteById(id);
    }


    @GetMapping("/matches")
    public List<User> getUsernameMatches(@RequestParam String text) {

        return repository.findByUsernameContainingIgnoreCase(text);
    }
    // new endpoint located in a different file
    @PostMapping("/follow/{username}")
    public ResponseEntity<?> followUser(@PathVariable String username, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User currUser = repository.findById(userId).orElseThrow();
        User following = repository.findByUsernameIgnoreCase(username);
        if(following == null) {
            return ResponseEntity.notFound().build();
        }
        if(relationshipService.isFollowing(currUser.getId(), following.getId())) {
            return ResponseEntity.badRequest().body("User is already following this person");
        }
        relationshipService.followUser(currUser.getId(), following.getId());
        return ResponseEntity.ok("Successfully followed the user");
    }
    // sends a follow request to a user
    @PostMapping("/request/{username}")
    public ResponseEntity<?> respondtoRequest(@PathVariable String username, @RequestParam boolean choice, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = repository.findById(userId).orElse(null);
        User userF = repository.findByUsernameIgnoreCase(username);
        FollowRequest req = frRepository.findBySenderIdAndReceiverId(userF.getId(), userId).orElse(null);
        if(req == null) {
            return ResponseEntity.badRequest().body("Request not found");
        }
        frService.requestChoice(req.getId(), choice);
        return ResponseEntity.ok("Success");
    }
    // cancels a request (thought there might be a way to do this without an extra endpoint)
    @PostMapping("/cancelRequest/{username}")
    public ResponseEntity<?> cancelRequest(@PathVariable String username, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = repository.findByUsernameIgnoreCase(username);
        try {
            frService.cancelRequest(userId, user.getId());
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return ResponseEntity.ok("Success");
    }

    @DeleteMapping("/unfollow/{username}")
    public ResponseEntity<?> unfollowUser(@PathVariable String username, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User currUser = repository.findById(userId).orElseThrow();
        User following = repository.findByUsernameIgnoreCase(username);
        if(following == null) {
            return ResponseEntity.notFound().build();
        }
        if(!relationshipService.isFollowing(currUser.getId(), following.getId())) {
            return ResponseEntity.badRequest().body("The relationship between the users dont exist");
        }
        relationshipService.unfollowUser(currUser.getId(), following.getId());
        return ResponseEntity.ok("Successfully unfollowed the user");
    }

    // Following List
    @GetMapping("/following/{username}")
    public ResponseEntity<?> viewFollowingList(@PathVariable String username, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = repository.findByUsernameIgnoreCase(username);
        if(user == null) {
            return ResponseEntity.badRequest().body("User doesn't exist");
        }
        List<String> arr = relationshipRepository.findAllByFollowerId(user.getId()).stream().map(Relationship::getFollowingId).collect(Collectors.toList());
        return ResponseEntity.ok(arr.stream().map(id ->  repository.findById(id).orElse(null)).collect(Collectors.toList()));
    }

    //Follower List
    @GetMapping("/followers/{username}")
    public ResponseEntity<?> viewFollowerList(@PathVariable String username, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = repository.findByUsernameIgnoreCase(username);
        if(user == null) {
            return ResponseEntity.badRequest().body("User doesn't exist");
        }
        List<String> arr = relationshipRepository.findAllByFollowingId(user.getId()).stream().map(Relationship::getFollowerId).collect(Collectors.toList());
        return ResponseEntity.ok(arr.stream().map(id ->  repository.findById(id).orElse(null)).collect(Collectors.toList()));
    }

    @GetMapping("/usernames")
    public ResponseEntity<?> getUsers(@RequestParam List<String> userIds) {
        List<String> usernames = userIds.stream()
            .map(userId -> repository.findById(userId).map(User::getUsername).orElse(null))
            .toList();
        return ResponseEntity.ok(usernames);
    }
    //sends a request
    @GetMapping("/followRequest/{username}")
    public ResponseEntity<?> getFollowRequest(Authentication auth, @PathVariable String username) {
        String userId = (String) auth.getPrincipal();
        User user = repository.findByUsernameIgnoreCase(username);
        List<String> requests = frRepository.findByReceiverId(user.getId()).stream().map(FollowRequest::getSenderId).collect(Collectors.toList());
        return ResponseEntity.ok(requests.stream().map(id -> repository.findById(id).orElse(null)).collect(Collectors.toList()));
    }
    // follow request endpoint
    @GetMapping("/requestSent")
    public ResponseEntity<?> getUserSentRequest(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = repository.findById(userId).orElse(null);
        List<String> sentRequest = frRepository.findBySenderId(userId).stream().map(FollowRequest::getReceiverId).collect(Collectors.toList());
        return ResponseEntity.ok(sentRequest.stream().map(id -> repository.findById(id).orElse(null).getUsername()).collect(Collectors.toList()));
    }

    // make sure they are gone from everything.
    @DeleteMapping("/delete-account")
public ResponseEntity<?> deleteAccount(@RequestBody Map<String, String> body, Authentication auth) {
    String userId = (String) auth.getPrincipal();
    String username = repository.findById(userId).get().getUsername();
    String password = body.get("password");

    if (password == null || password.isEmpty())
        return ResponseEntity.badRequest().body(Map.of("message", "Please provide your password"));

    User user = repository.findById(userId).orElseThrow();

    if (!passwordEncoder.matches(password, user.getPassword()))
        return ResponseEntity.badRequest().body(Map.of("message", "Incorrect password"));
    // REMOVE THEM FROM EVERYTHINGGGGGGGGGG
    PartyFinder party = partyFinderRepo.findByMembersContaining(userId);
    if(party != null) {
        if(party.getCreatorId().equals(userId)) {
            partyFinderRepo.deleteAllByCreatorId(userId);
        } else {
            party.removeMember(userId);
        }
    }

        // Update follower/following counts for affected users
    List<Relationship> following = relationshipRepository.findAllByFollowerId(userId);
    List<Relationship> followers = relationshipRepository.findAllByFollowingId(userId);

    for (Relationship r : following) {
        User followed = repository.findById(r.getFollowingId()).orElse(null);
        if (followed != null) {
            followed.setFollowerCount(Math.max(0, followed.getFollowerCount() - 1));
            repository.save(followed);
        }
    }

    for (Relationship r : followers) {
        User follower = repository.findById(r.getFollowerId()).orElse(null);
        if (follower != null) {
            follower.setFollowingCount(Math.max(0, follower.getFollowingCount() - 1));
            repository.save(follower);
        }
    }

    // Update community member counts
    List<CommunityMembership> memberships = communityMembershipRepository.findAllByUserId(userId);
    for (CommunityMembership membership : memberships) {
        Community community = communityRepository.findById(membership.getCommunityId()).orElse(null);
        if (community != null) {
            community.setMemberCount(Math.max(0, community.getMemberCount() - 1));
            communityRepository.save(community);
        }
    }
    blockedRelationshipRepository.deleteAllByBlockedId(userId);
    blockedRelationshipRepository.deleteAllByUserId(userId);
    communityMembershipRepository.deleteAllByUserId(userId);
    communityRepository.deleteAllByOwnerId(userId);
    postRepository.deleteAllByUserId(user.getUsername());
    relationshipRepository.deleteAllByFollowerId(userId);
    relationshipRepository.deleteAllByFollowingId(userId);
    repository.deleteById(userId);
    frRepository.deleteAllByReceiverId(userId);
    frRepository.deleteAllBySenderId(userId);
    try{
        s3serv.deleteAllMedia(username);
    } catch(Exception e){
        
    }
    
    return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
}
// change password endpoint
@PutMapping("/change-password")
public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, Authentication auth) {
    String userId = (String) auth.getPrincipal();
    String currentPassword = body.get("currentPassword");
    String newPassword = body.get("newPassword");

    if (currentPassword == null || newPassword == null)
        return ResponseEntity.badRequest().body(Map.of("message", "Please provide current and new password"));
    if (newPassword.length() < 6)
        return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));

    User user = repository.findById(userId).orElseThrow();

    if (!passwordEncoder.matches(currentPassword, user.getPassword()))
        return ResponseEntity.badRequest().body(Map.of("message", "Current password is incorrect"));

    user.setPassword(passwordEncoder.encode(newPassword));
    repository.save(user);
    return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
}
    // change username endpoint
  @PutMapping("/change-username")
  public ResponseEntity<?> changeUsername(@RequestBody Map<String, String> body, Authentication auth) {
    String userId = (String) auth.getPrincipal();
    String newUsername = body.get("newUsername");

    if (newUsername == null || newUsername.trim().isEmpty())
        return ResponseEntity.badRequest().body(Map.of("message", "Username cannot be empty"));
    if (newUsername.contains(" "))
        return ResponseEntity.badRequest().body(Map.of("message", "Username cannot contain spaces"));
    if (repository.existsByUsernameIgnoreCase(newUsername.trim()))
        return ResponseEntity.badRequest().body(Map.of("message", "Username already taken"));

    User user = repository.findById(userId).orElseThrow();
    user.setUsername(newUsername.trim());
    repository.save(user);
    return ResponseEntity.ok(Map.of("message", "Username updated successfully"));
}


}