package com.GameVerse.GameVerse.controller;

import java.time.Instant;
import java.util.Collections;
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

import com.GameVerse.GameVerse.model.Category;
import com.GameVerse.GameVerse.model.PartyFinder;
import com.GameVerse.GameVerse.model.Status;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.PartyFinderRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.services.NotificationService;
import com.GameVerse.GameVerse.services.PartyFinderService;

@RestController
@RequestMapping("/parties")
@CrossOrigin(origins = "http://localhost:3000")
public class PartyController {
    @Autowired
    private UserRepository repository;

    @Autowired
    private PartyFinderService partyService;

    @Autowired
    private PartyFinderRepository partyRepository;

    @Autowired
    private NotificationService notificationService;

    private static final String type = "Party";

    @GetMapping
    public ResponseEntity<?> getAllParties() {
        List<PartyFinder> parties = partyRepository.findAll();
        return ResponseEntity.ok().body(parties);
    }

    @PostMapping("/createParty")
    public ResponseEntity<?> createParty(@RequestBody createPartyRequest req, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        if(partyRepository.existsByName(req.name)) {
            return ResponseEntity.badRequest().body("Party name already exists");
        }
        if(partyRepository.findByCreatorId(userId) != null || partyRepository.existsByMembersContaining(userId)) {
            return ResponseEntity.badRequest().body("User already owns a party or is a member of a party");
        }
        if(req.maxMembers <= 0) {
            return ResponseEntity.badRequest().body("You cannot have a party with 0 members!");
        }
        if(req.maxMembers > 16) {
            return ResponseEntity.badRequest().body("You cannot have a party with more than 16 members!");
        }
        if(req.name.equals("")) {
            return ResponseEntity.badRequest().body("Party needs a name");
        }
        if(req.time < 0 || req.time > 999) {
             return ResponseEntity.badRequest().body("You cant set a timer less than 0 or higher than 1000");
        }
        PartyFinder party = new PartyFinder(userId, req.name, req.description, req.maxMembers, req.categories);
        party.startTimer(req.time);
        partyRepository.save(party);
        return ResponseEntity.ok().body(party.getId());   
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories() {
        return ResponseEntity.ok(Category.grouped());
    }

    @GetMapping("/myParty")
    public ResponseEntity<?> getCurrentParty(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        PartyFinder party = partyRepository.findByMembersContaining(userId);
        if(party == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(party);
    }

    @GetMapping("/{partyName}")
    public ResponseEntity<?> getParty(@PathVariable String partyName) {
        PartyFinder party = partyRepository.findByNameIgnoreCase(partyName);
        if(party == null) {
            return ResponseEntity.badRequest().body("Party doesn't exist");
        }
        return ResponseEntity.ok(party);
    }

    @GetMapping("/matches")
    public ResponseEntity<?> getPartyMatches(@RequestParam String text) {
        List<PartyFinder> parties = partyRepository.findByNameContainingIgnoreCase(text);
        Category category = tryParseCategory(text);
        List<PartyFinder> byCategory = category != null
            ? partyRepository.findByCategoriesContaining(category)
            : Collections.emptyList();

        Set<PartyFinder> combined = new HashSet<>();
        combined.addAll(parties);
        combined.addAll(byCategory);

        return ResponseEntity.ok(combined);

    }

    @GetMapping("/matchesCategory")
    public List<PartyFinder> getCategoryMatches(@RequestParam List<String> categories) {
        List<Category> categoryList = categories.stream().map(cat -> Category.valueOf(cat.toUpperCase())).collect(Collectors.toList());
        List<PartyFinder> list = partyRepository.findByCategoriesIn(categoryList);
        return list;
    }

    @PutMapping("/{partyname}/join")
    public ResponseEntity<?> joinParty(@PathVariable String partyname, Authentication auth) {
        PartyFinder party = partyRepository.findByNameIgnoreCase(partyname);
        if( party == null) {
            return ResponseEntity.badRequest().body("Party doesnt exist");
        }
        try {
            String userId = (String) auth.getPrincipal();
            String message = (repository.findById(userId).orElse(null).getUsername()) + " has joined your party!";
            notificationService.createNotification(type, message, party.getCreatorId());
            partyService.joinParty(userId, partyname);
            return ResponseEntity.ok(party);
        } catch(RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/{partyname}/leave")
    public ResponseEntity<?> leaveParty(@PathVariable String partyname, Authentication auth) {
        PartyFinder party = partyRepository.findByNameIgnoreCase(partyname);
        if( party == null) {
            return ResponseEntity.badRequest().body("Party doesnt exist");
        }
        String id = party.getId();
        String userId = (String) auth.getPrincipal();
        String message = (repository.findById(userId).orElse(null).getUsername()) + " has left the your party!";
        notificationService.createNotification(type, message, party.getCreatorId());
        partyService.removeMember(userId, id);
        return ResponseEntity.ok(party);
    }
    //Kick a member from the party
    @PutMapping("/{partyname}/{member}")
    public ResponseEntity<?> kickFromParty(@PathVariable String partyname, @PathVariable String member, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        PartyFinder party = partyRepository.findByNameIgnoreCase(partyname);
        User user = repository.findByUsernameIgnoreCase(member);
        if( party == null || user == null) {
            return ResponseEntity.badRequest().body("Party or User doesnt exist");
        }

        partyService.removeMember(user.getId(), party.getId());
        String message = "You have been kicked from " + party.getName() + " party!";
        notificationService.createNotification(type, message, user.getId());
        return ResponseEntity.ok().body(party);
    }
    //Delete Party
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteParty(@PathVariable String id, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        PartyFinder party = partyRepository.findById(id).orElse(null);
        if(party == null) {
            return ResponseEntity.badRequest().body("Party doesn't exist");
        }
         if (!party.getCreatorId().equals(userId)) {
            return ResponseEntity.status(403).body("You are not the owner of this party");
        }
        partyService.deleteParty(id);
        return ResponseEntity.ok("party successfully deleted");
    }

    @PostMapping("/{partyName}/editParty")
    public ResponseEntity<?> editParty(@RequestBody createPartyRequest req, Authentication auth, @PathVariable String partyName) {
        PartyFinder party = partyRepository.findByNameIgnoreCase(partyName);
        String userId = (String) auth.getPrincipal();
        if(partyRepository.existsByName(req.name) && !party.getName().equals(partyRepository.findByNameIgnoreCase(partyName).getName())) {
            return ResponseEntity.badRequest().body("Party name already exists");
        }
        if(req.maxMembers <= 0) {
            return ResponseEntity.badRequest().body("You cannot have a party with 0 members!");
        }
        if(req.maxMembers > 16) {
            return ResponseEntity.badRequest().body("You cannot have a party with more than 16 members!");
        }
        if(req.name.equals("")) {
            return ResponseEntity.badRequest().body("Party Needs a name");
        }
        if(party.getMembers().size() > req.maxMembers) {
            return ResponseEntity.badRequest().body("You cannot set the members less than whats in the party");
        }
        if(req.time < 0 || req.time > 999) {
             return ResponseEntity.badRequest().body("You cant set a timer less than 0");
        }
        party.setName(req.name);
        party.setDescription(req.description);
        party.setCategories(req.categories);
        party.setMaxMembers(req.maxMembers);
        party.setTime(Instant.now());
        party.startTimer(req.time);
        party.setStatus(Status.WAITING);
        partyRepository.save(party);
        return ResponseEntity.ok().body(party.getId());   
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateParty(@PathVariable String id) {
        PartyFinder party = partyRepository.findById(id).orElseThrow();
        party.setStatus(Status.ACTIVE);
        partyRepository.save(party);
        return ResponseEntity.ok("Party is now active");
    }


    





    static class createPartyRequest {
        public String name;
        public String description;
        public int maxMembers;
        public List<Category> categories;
        public int time;

    }

    // Needed help with this type of enum searching
    private Category tryParseCategory(String q) {
    String cleaned = q.trim().toUpperCase();

    // Full match
    try {
        return Category.valueOf(cleaned);
    } catch (IllegalArgumentException ignored) {}

    // Partial match
    for (Category cat : Category.values()) {
        if (cat.name().startsWith(cleaned)) {
            return cat;
        }
    }

    return null;
}

}
