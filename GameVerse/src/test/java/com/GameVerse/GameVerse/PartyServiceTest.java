package com.GameVerse.GameVerse;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.GameVerse.GameVerse.model.Category;
import com.GameVerse.GameVerse.model.PartyFinder;
import com.GameVerse.GameVerse.repository.PartyFinderRepository;
import com.GameVerse.GameVerse.services.PartyFinderService;

@ExtendWith(MockitoExtension.class)
public class PartyServiceTest {

    @Mock
    private PartyFinderRepository partyRepository;

    @InjectMocks
    private PartyFinderService partyService;

    @Test
    void joinParty_addUserSuccessful() {
        PartyFinder party = new PartyFinder("123", "Mario Party", "Donkey Kong runs", 4, List.of(Category.PARTY));

        when(partyRepository.findByNameIgnoreCase("Mario Party"))
            .thenReturn(party);

        when(partyRepository.existsByMembersContaining("xXGamerXx"))
            .thenReturn(false);

        partyService.joinParty("xXGamerXx", "Mario Party");

        assertTrue(party.getMembers().contains("xXGamerXx"));
        verify(partyRepository).save(party);
    }

    @Test
    void leaveParty_removeUserSuccessful() {
        PartyFinder party = new PartyFinder("321", "Everything", "we run every game", 3, List.of(Category.DIAMOND));
        party.setMembers(new ArrayList<>(List.of("testGamer")));

        when(partyRepository.findById("321"))
                .thenReturn(Optional.of(party));

        partyService.removeMember("testGamer", "321");

        assertTrue(!party.getMembers().contains("testGamer"));
        verify(partyRepository).save(party);
    }

    @Test
    void removeMember_throwsWhenUserNotInParty() {
        PartyFinder party = new PartyFinder("321", "Everything", "we run every game", 3, List.of(Category.DIAMOND));
        party.setMembers(new ArrayList<>(List.of("someOtherUser")));

        when(partyRepository.findById("321"))
                .thenReturn(Optional.of(party));

        assertThrows(RuntimeException.class, () ->
                partyService.removeMember("testGamer", "321")
        );

        verify(partyRepository, never()).save(any());
    }

    @Test
    void deleteParty_Successful() {
        PartyFinder party = new PartyFinder("123", "Mario Party", "Donkey Kong runs", 4, List.of(Category.PARTY));
        when(partyRepository.findById("123"))
            .thenReturn(Optional.of(party));
        partyService.deleteParty("123");

        verify(partyRepository).delete(party);
    }

    @Test
    void deleteParty_throwsWhenPartyNotFound() {
        when(partyRepository.findById("123"))
                .thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () ->
                partyService.deleteParty("123")
        );

        verify(partyRepository, never()).delete(any());
    }

    @Test
    void joinParty_throwsWhenPartyIsFull() {
        PartyFinder party = new PartyFinder("123", "Mario Party", "Donkey Kong runs", 2, List.of(Category.PARTY));

        // Fill the party to max capacity
        party.setMembers(new ArrayList<>(List.of("user1", "user2")));

        when(partyRepository.findByNameIgnoreCase("Mario Party"))
                .thenReturn(party);


        assertThrows(RuntimeException.class, () ->
                partyService.joinParty("testGamer", "Mario Party")
        );

        verify(partyRepository, never()).save(any());
    }



}
