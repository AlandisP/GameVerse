package com.GameVerse.GameVerse.controller;

import java.util.Arrays;
import java.util.List;
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
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.PartyFinderRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
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
        PartyFinder party = new PartyFinder(userId, req.name, req.description, req.maxMembers, req.categories);
        partyRepository.save(party);
        return ResponseEntity.ok().body(party.getId());   
    }

    @GetMapping("/{partyName}")
    public ResponseEntity<?> getParty(@PathVariable String name) {
        PartyFinder party = partyRepository.findByNameIgnoreCase(name);
        if(party == null) {
            return ResponseEntity.badRequest().body("Party doesn't exist");
        }
        return ResponseEntity.ok(party);
    }

    @GetMapping("/matches")
    public List<PartyFinder> getPartyMatches(@RequestParam String text) {
        return partyRepository.findByNameContainingIgnoreCase(text);
    }

    @GetMapping("/matchesCategory")
    public List<PartyFinder> getCategoryMatches(@RequestParam List<String> categories) {
        List<Category> categoryList = categories.stream().map(cat -> Category.valueOf(cat.toUpperCase())).collect(Collectors.toList());
        List<PartyFinder> list = partyRepository.findByCategoriesIn(categoryList);
        return list;
    }

    @PutMapping("/{partyname}/join")
    public ResponseEntity<?> joinParty(@PathVariable String name, Authentication auth) {
        PartyFinder party = partyRepository.findByNameIgnoreCase(name);
        if( party == null) {
            return ResponseEntity.badRequest().body("Party doesnt exist");
        }
        String id = party.getId();
        String userId = (String) auth.getPrincipal();
        partyService.joinParty(userId, id);
        return ResponseEntity.ok(party);
    }

    @PutMapping("/{partyname}/leave")
    public ResponseEntity<?> leaveParty(@PathVariable String name, Authentication auth) {
        PartyFinder party = partyRepository.findByNameIgnoreCase(name);
        if( party == null) {
            return ResponseEntity.badRequest().body("Party doesnt exist");
        }
        String id = party.getId();
        String userId = (String) auth.getPrincipal();
        partyService.removeMember(userId, id);
        return ResponseEntity.ok(party);
    }
    //Kick a member from the party
    @PutMapping("/{partyname}/{username}")
    public ResponseEntity<?> kickFromParty(@PathVariable String partyname, @PathVariable String username) {
        PartyFinder party = partyRepository.findByNameIgnoreCase(partyname);
        User user = repository.findByUsernameIgnoreCase(username);
        if( party == null || user == null) {
            return ResponseEntity.badRequest().body("Party or User doesnt exist");
        }

        partyService.removeMember(user.getId(), party.getId());
        return ResponseEntity.ok().body(party);
    }
    //Delete Party
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteParty(@RequestParam String partyname) {
        PartyFinder party = partyRepository.findByNameIgnoreCase(partyname);
        if(party == null) {
            return ResponseEntity.badRequest().body("Party with that name doesn't exist");
        }
        partyService.deleteParty(partyname);
        return ResponseEntity.ok("party successfully deleted");
    }

    // Testing 
    @GetMapping("/test/populate")
    public String populateParties() {
        User owner = repository.findById("69320f828c7352454ed8b7ea").orElse(null);
        List<Category> cats = Arrays.asList(Category.COOP, Category.PRO);
        List<Category> cats2 = Arrays.asList(Category.COOP, Category.PRO, Category.MARVELRIVALS);
        PartyFinder party = new PartyFinder(owner.getId(), "Elden Ring Coop Testing", "Consort Radahn and Miquella Boss Fight", 4,cats );
        partyService.joinParty(repository.findByUsernameIgnoreCase("akame").getId(), party.getId());
        PartyFinder party2 = new PartyFinder("693754ac5e5fe6949986a855", "Rivals Platinum Rounds", "No Noobs allowed", 6, cats2);
        partyRepository.save(party);
        partyRepository.save(party2);
        return "parties successfully created!";
    }



    static class createPartyRequest {
        public String name;
        public String description;
        public int maxMembers;
        public List<Category> categories;

    }
}
