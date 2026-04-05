package com.GameVerse.GameVerse.controller;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
import org.springframework.web.multipart.MultipartFile;

import com.GameVerse.GameVerse.model.Community;
import com.GameVerse.GameVerse.model.CommunityCategory;
import com.GameVerse.GameVerse.model.CommunityMembership;
import com.GameVerse.GameVerse.model.MemberType;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.CommunityMembershipRepository;
import com.GameVerse.GameVerse.repository.CommunityRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.security.S3Service;
import com.GameVerse.GameVerse.services.CommunityService;
import com.GameVerse.GameVerse.services.NotificationService;
@RestController
@RequestMapping("/communities")
@CrossOrigin(origins = "http://localhost:3000")
public class CommunitiesController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository repository;

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired 
    private CommunityService communityService;

    @Autowired
    private CommunityMembershipRepository cmr;

    @Autowired
    private S3Service s3serv;

    private static final String type = "Community";


    @GetMapping
    public ResponseEntity<?> getAllCommunities() {
        List<Community> list = communityRepository.findAll();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping("/matches")
    public ResponseEntity<?> getCommunityMatches(@RequestParam String text) {
        List<Community> byName = communityRepository.findByNameContainingIgnoreCase(text);
        List<Community> byDescription = communityRepository.findByDescriptionContainingIgnoreCase(text);

        Set<Community> combined = new HashSet<>();
        combined.addAll(byName);
        combined.addAll(byDescription);

        return ResponseEntity.ok(combined);
    }

    @PostMapping("/createCommunity")
    public ResponseEntity<?> createCommunity(@RequestBody createCommunityRequest req, Authentication auth) {
        String id = (String) auth.getPrincipal();
        if(communityRepository.existsByNameIgnoreCase(req.name)) {
            return ResponseEntity.badRequest().body("Community with this name already exists");
        }
        try {
            communityService.createCommunity(id, req.name, req.description, req.category);
            return ResponseEntity.ok().body("Community Created!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{name}")
    public ResponseEntity<?> getCommunity(@PathVariable String name, Authentication auth) {
        String id = (String) auth.getPrincipal();
        User user = repository.findById(id).orElse(null);
        Community com = communityRepository.findByNameIgnoreCase(name);
        if(com == null) {
            return ResponseEntity.badRequest().body("Community not found");
        }
        return ResponseEntity.ok(com);
    }

    @PutMapping("/{communityname}/join")
    public ResponseEntity<?> joinCommunity(@PathVariable String communityname, Authentication auth) {
        String id = (String) auth.getPrincipal();
        User user = repository.findById(id).orElse(null);
        if(!communityRepository.existsByNameIgnoreCase(communityname)) {
            return ResponseEntity.badRequest().body("Community doesn't exist");
        }
        Community com = communityRepository.findByNameIgnoreCase(communityname);
        String ownerId = com.getOwnerId();
        String body = user.getUsername() + " has joined your community!";
        notificationService.createNotification(type, body, ownerId);
        communityService.addMember(communityRepository.findByNameIgnoreCase(communityname).getId(), id);
        return ResponseEntity.ok().body("Successfully joined community");
    }

    @PutMapping("/{communityname}/leave")
    public ResponseEntity<?> leaveCommunity(@PathVariable String communityname, Authentication auth) {
        String id = (String) auth.getPrincipal();
        if(!communityRepository.existsByNameIgnoreCase(communityname)) {
            return ResponseEntity.badRequest().body("Community doesn't exist");
        }
        communityService.removeMember(communityRepository.findByNameIgnoreCase(communityname).getId(), id);
        return ResponseEntity.ok().body("Successfully left community");
    }

    @PutMapping("/{communityname}/{username}/kick")
    public ResponseEntity<?> kickMember(@PathVariable String communityname, @PathVariable String username, Authentication auth) {
        String id = (String) auth.getPrincipal();
        User user = repository.findById(id).orElse(null);
        Community com = communityRepository.findByNameIgnoreCase(communityname);
        CommunityMembership membership = cmr.findByCommunityIdAndUserId(com.getId(), user.getId());
        if(membership.getType() != MemberType.MODERATOR && membership.getType() != MemberType.OWNER) {
            return ResponseEntity.badRequest().body("User doesn't have permission to do this");
        }
        if(!communityRepository.existsByNameIgnoreCase(communityname)) {
            return ResponseEntity.badRequest().body("Community doesn't exist");
        }
        if(!repository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body("User doesn't exist");
        }
        communityService.removeMember(communityRepository.findByNameIgnoreCase(communityname).getId(), repository.findByUsernameIgnoreCase(username).getId());
        return ResponseEntity.ok().body("User has been kicked from the community");
    }

    @PutMapping("/{communityname}/{username}/mod")
    public ResponseEntity<?> addModerator(@PathVariable String communityname, @PathVariable String username, Authentication auth){
        String id = (String) auth.getPrincipal();
        User userOwner = repository.findById(id).orElse(null);
        Community com = communityRepository.findByNameIgnoreCase(communityname);
        User user = repository.findByUsernameIgnoreCase(username);
        CommunityMembership membership = cmr.findByCommunityIdAndUserId(com.getId(), userOwner.getId());
        if(com == null || user == null) {
            return ResponseEntity.badRequest().body("User or community doesn't exist");
        }
        if(membership.getType() != MemberType.MODERATOR && membership.getType() != MemberType.OWNER) {
            return ResponseEntity.badRequest().body("User doesn't have permission to do this");
        }
        communityService.addModerator(com.getId(), user.getId());
        return ResponseEntity.ok("Successfuly made the user moderator");
    }

    @PutMapping("/{communityname}/{username}/demote")
    public ResponseEntity<?> removeModerator(@PathVariable String communityname, @PathVariable String username, Authentication auth){
        String id = (String) auth.getPrincipal();
        User userOwner = repository.findById(id).orElse(null);
        Community com = communityRepository.findByNameIgnoreCase(communityname);
        User user = repository.findByUsernameIgnoreCase(username);
        CommunityMembership membership = cmr.findByCommunityIdAndUserId(com.getId(), userOwner.getId());
        if(com == null || user == null) {
            return ResponseEntity.badRequest().body("User or community doesn't exist");
        }
        if(membership.getType() != MemberType.MODERATOR && membership.getType() != MemberType.OWNER) {
            return ResponseEntity.badRequest().body("User doesn't have permission to do this");
        }
        communityService.removeModerator(com.getId(), user.getId());
        return ResponseEntity.ok("Successfuly removed the user moderator");
    }

    @PutMapping("/{name}/editName")
    public ResponseEntity<?> editCommunityName(@PathVariable String name, @RequestBody EditNameRequest req ) {
        Community com = communityRepository.findByNameIgnoreCase(name);
        if(com == null || communityRepository.existsByNameIgnoreCase(req.name) == true) {
            return ResponseEntity.badRequest().body("Community not found");
        }
        com.setName(req.name);
        communityRepository.save(com);
        return ResponseEntity.ok(com);
    }

    @PutMapping("/{name}/editDescription")
    public ResponseEntity<?> editCommunityDescription(@PathVariable String name, @RequestBody EditDescriptionRequest req ) {
        Community com = communityRepository.findByNameIgnoreCase(name);
        if(com == null) {
            return ResponseEntity.badRequest().body("Community not found");
        }
        com.setDescription(req.description);
        communityRepository.save(com);
        return ResponseEntity.ok(com);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteCommunity(@RequestBody DeleteCommunityRequest req, Authentication auth) {
        String id = (String)auth.getPrincipal();
        User user = repository.findById(id).orElse(null);
        Community com = communityRepository.findByNameIgnoreCase(req.name);
        if(com == null) {
            return ResponseEntity.badRequest().body("Community not found");
        }
        if(user == null || !user.getId().equals(com.getOwnerId())) {
            return ResponseEntity.badRequest().body("User isn't the owner of the community");
        }
        communityService.deleteCommunity(com.getId());
        return ResponseEntity.ok("Community successfully deleted");
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories() {
        List<String> categories = Arrays.stream(CommunityCategory.values())
            .map(Enum::name)
            .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/memberships")
    public ResponseEntity<?> getUserCommunities(Authentication auth, @RequestParam(defaultValue = "6") int limit) {
         String id = (String) auth.getPrincipal();
        List<Community> communities = communityService.getUsersCommunities(id);
        List<Community> limited = communities.stream()
            .limit(limit)
            .toList();
        return ResponseEntity.ok(limited);
    }

    @GetMapping("/{communityName}/Members")
    public ResponseEntity<?> getCommunityMembers(@PathVariable String communityName) {
        Community com = communityRepository.findByNameIgnoreCase(communityName);
        if(com == null) {
            return ResponseEntity.badRequest().body("Community not found");
        }
        return ResponseEntity.ok(communityService.getCommunityMembers(com.getId()));
    }

    @GetMapping("/{communityName}/Mods")
    public ResponseEntity<?> getCommunityModerators(@PathVariable String communityName) {
        Community com = communityRepository.findByNameIgnoreCase(communityName);
        if(com == null) {
            return ResponseEntity.badRequest().body("Community not found");
        }
        return ResponseEntity.ok(communityService.getCommunityOwnerAndMods(com.getId()));
    }

    @GetMapping("/{communityName}/AllMembers")
    public ResponseEntity<?> getCommunityAllMembers(@PathVariable String communityName) {
        Community com = communityRepository.findByNameIgnoreCase(communityName);
        if(com == null) {
            return ResponseEntity.badRequest().body("Community not found");
        }
        return ResponseEntity.ok(communityService.getCommunityAllMembers(com.getId()));
    }

    @GetMapping("/featured")
    public ResponseEntity<?> getCommunitiesInOrder() {
        return ResponseEntity.ok(communityRepository.findAllByOrderByMemberCountDesc());
    }

    @PutMapping("/{communityName}/TransferOwnership")
    public ResponseEntity transferLeadership(@PathVariable String communityName, @RequestBody transferOwnershipRequest req, Authentication auth) {
        String id = (String) auth.getPrincipal();
        Community community = communityRepository.findByNameIgnoreCase(communityName);
        User user = repository.findByUsernameIgnoreCase(req.username);
        if(community == null || user == null) {
            return ResponseEntity.badRequest().body("User or Community doesn't exist");
        }
        if(!community.getOwnerId().equals(id)) {
            return ResponseEntity.badRequest().body("User isn't allowed to do this");
        }
        communityService.transferOwnership(community.getId(), user.getId());
        return ResponseEntity.ok().body("Successfully made the new user the Owner!");
    }

    @PostMapping("/setmedia")
    public ResponseEntity<?> editUserMedia(@RequestParam("name") String name, @RequestParam(value = "pfp", required = false) MultipartFile pfp, @RequestParam(value = "banner", required = false) MultipartFile banner, Authentication auth) {
        try{
            Community com = communityRepository.findByNameIgnoreCase(name);
            if(pfp!=null){
                String newpfp = s3serv.staticMedia(pfp, com.getName(), "ProfilePic");
                com.setpfp(newpfp);
            }
            if(banner!=null){
                String newbanner = s3serv.staticMedia(banner, com.getName(), "Banner");
                com.setbanner(newbanner);
            }
            communityRepository.save(com);
        }
        catch(IOException e){
            e.printStackTrace();
        }

        return ResponseEntity.ok("Profile Updates Successfully");
    }



    static class DeleteCommunityRequest {
        public String name;
    }

    static class EditDescriptionRequest {
        public String description;
    }

    static class EditNameRequest {
        public String name;
    }

    static class createCommunityRequest {
        public String name;
        public String description;
        public CommunityCategory category;
    }

    static class transferOwnershipRequest {
        public String username;
    }

    
}
