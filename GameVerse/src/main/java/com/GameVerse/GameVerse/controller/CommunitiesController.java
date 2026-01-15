package com.GameVerse.GameVerse.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.GameVerse.GameVerse.model.Community;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.CommunityRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.services.CommunityService;
@Controller
@RequestMapping("/communities")
@CrossOrigin(origins = "http://localhost:3000")
public class CommunitiesController {

    @Autowired
    private UserRepository repository;

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired 
    private CommunityService communityService;

    @GetMapping
    public ResponseEntity<?> getAllCommunities() {
        List<Community> list = communityRepository.findAll();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping("/matches")
    public List<Community> getCommunityMatches(@RequestParam String name) {
        return communityRepository.findByNameContainingIgnoreCase(name);
    }

    @PostMapping("/createCommunity")
    public ResponseEntity<?> createCommunity(@RequestBody createCommunityRequest req, Authentication auth) {
        String id = (String) auth.getPrincipal();
        if(communityRepository.existsByNameIgnoreCase(req.name)) {
            return ResponseEntity.badRequest().body("Community with this name already exists");
        }
        communityService.createCommunity(id, req.name, req.description);
        return ResponseEntity.ok().body("Community Created!");
    }

    @GetMapping("/{name}")
    public ResponseEntity<?> getCommunity(@PathVariable String name) {
        Community com = communityRepository.findByNameIgnoreCase(name);
        if(com == null) {
            return ResponseEntity.badRequest().body("Community not found");
        }
        return ResponseEntity.ok(com);
    }

    @PutMapping("/{communityname}/join")
    public ResponseEntity<?> joinCommunity(@PathVariable String communityname, Authentication auth) {
        String id = (String) auth.getPrincipal();
        if(!communityRepository.existsByNameIgnoreCase(communityname)) {
            return ResponseEntity.badRequest().body("Community doesn't exist");
        }
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

    @PutMapping("/{communityname}/{username}")
    public ResponseEntity<?> addModerator(@PathVariable String communityname, @PathVariable String username){
        Community com = communityRepository.findByNameIgnoreCase(communityname);
        User user = repository.findByUsernameIgnoreCase(username);
        if(com == null || user == null) {
            return ResponseEntity.badRequest().body("User or community doesn't exist");
        }
        communityService.addModerator(com.getId(), user.getId());
        return ResponseEntity.ok("Successfuly made the user moderator");
    }

    @PutMapping("/{communityname}/{username}")
    public ResponseEntity<?> removeModerator(@PathVariable String communityname, @PathVariable String username){
        Community com = communityRepository.findByNameIgnoreCase(communityname);
        User user = repository.findByUsernameIgnoreCase(username);
        if(com == null || user == null) {
            return ResponseEntity.badRequest().body("User or community doesn't exist");
        }
        communityService.removeModerator(com.getId(), user.getId());
        return ResponseEntity.ok("Successfuly removed the user moderator");
    }

    @PutMapping("/{name}/editName")
    public ResponseEntity<?> editCommunityName(@PathVariable String name, @RequestBody String newName ) {
        Community com = communityRepository.findByNameIgnoreCase(name);
        if(com == null || communityRepository.existsByNameIgnoreCase(newName) == true) {
            return ResponseEntity.badRequest().body("Community not found");
        }
        com.setName(newName);
        communityRepository.save(com);
        return ResponseEntity.ok(com);
    }

    @PutMapping("/{name}/editDescription")
    public ResponseEntity<?> editCommunityDescription(@PathVariable String name, @RequestBody String description ) {
        Community com = communityRepository.findByNameIgnoreCase(name);
        if(com == null) {
            return ResponseEntity.badRequest().body("Community not found");
        }
        com.setDescription(description);
        communityRepository.save(com);
        return ResponseEntity.ok(com);
    }

    // @DeleteMapping("/delete")
    // public ResponseEntity<?> deleteCommunity(@RequestBody String name) {
    //     Community com = communityRepository.findByNameIgnoreCase(name);
    //     if(com == null) {
    //         return ResponseEntity.badRequest().body("Community not found");
    //     }
        
    // }



    static class createCommunityRequest {
        public String name;
        public String description;
    }

    
}
