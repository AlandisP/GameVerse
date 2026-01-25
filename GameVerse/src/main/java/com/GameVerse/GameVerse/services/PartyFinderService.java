package com.GameVerse.GameVerse.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.GameVerse.GameVerse.model.PartyFinder;
import com.GameVerse.GameVerse.model.Status;
import com.GameVerse.GameVerse.repository.PartyFinderRepository;
import com.GameVerse.GameVerse.repository.UserRepository;

@Service
public class PartyFinderService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PartyFinderRepository partyFinderRepository;

    // join a party
    public void joinParty(String userId, String partyName) {
        PartyFinder party = partyFinderRepository.findByNameIgnoreCase(partyName);
        if(party == null) {
           throw new RuntimeException("Party not found"); 
        }
        if(party.getMaxMembers() == party.getCurrentNumMembers()) {
            throw new RuntimeException("Party is full");
        } else if(party.getMembers().contains(userId)){
            throw new RuntimeException("User is already in the party");    
        }
        if(partyFinderRepository.existsByMembersContaining(userId)) {
            throw new RuntimeException("User is already in another party");
        }
        party.addMember(userId);
        partyFinderRepository.save(party);
    }

    // leave a party --- could also be used to kick
    public void removeMember(String userId, String partyId) {
        PartyFinder party = partyFinderRepository.findById(partyId).orElseThrow();
        if(!(party.getMembers().contains(userId))) {
            throw new RuntimeException("User isn't in the party");
        } else {
            party.getMembers().remove(userId);
            party.setStatus(Status.WAITING);
        }

        partyFinderRepository.save(party);
    }

    public void deleteParty(String partyId) {
        PartyFinder party = partyFinderRepository.findById(partyId).orElseThrow();
        if(party == null) {
            throw new RuntimeException("Party doesn't exist");
        }
        partyFinderRepository.delete(party);
    }


    
}
