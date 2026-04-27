package com.GameVerse.GameVerse;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

import com.GameVerse.GameVerse.model.Category;
import com.GameVerse.GameVerse.model.PartyFinder;
import com.GameVerse.GameVerse.model.Status;

public class PartyFinderTest {

    @Test
    void constructor_initializesCorrectDefaults() {
        PartyFinder party = new PartyFinder(
                "creator123",
                "Test Party",
                "Description",
                5,
                List.of(Category.ACTION)
        );

        assertEquals("creator123", party.getCreatorId());
        assertEquals("Test Party", party.getName());
        assertEquals("Description", party.getDescription());
        assertEquals(5, party.getMaxMembers());
        assertEquals(1, party.getCurrentNumMembers()); // creator auto-added
        assertEquals(Status.WAITING, party.getStatus());
        assertNotNull(party.getCreatedAt());
        assertNotNull(party.getPartyImg());
        assertTrue(party.getPartyImg().startsWith("/images/"));
    }

    @Test
    void addMember_increasesCountAndSetsFullStatus() {
        PartyFinder party = new PartyFinder("creator", "Party", "desc", 2, List.of());

        party.addMember("user1");

        assertEquals(2, party.getCurrentNumMembers());
        assertEquals(Status.FULL, party.getStatus());
    }

    @Test
    void removeMember_decreasesCountAndSetsWaitingStatus() {
        PartyFinder party = new PartyFinder("creator", "Party", "desc", 3, List.of());

        party.addMember("user1");
        party.addMember("user2");
        assertEquals(Status.FULL, party.getStatus());

        party.removeMember("user2");

        assertEquals(2, party.getCurrentNumMembers());
        assertEquals(Status.WAITING, party.getStatus());
    }

    @Test
    void removeMember_doesNotCrashIfUserNotInList() {
        PartyFinder party = new PartyFinder("creator", "Party", "desc", 3, List.of());

        assertDoesNotThrow(() -> party.removeMember("nonexistent"));
        assertEquals(1, party.getCurrentNumMembers());
    }


    @Test
    void setTime_updatesCreatedAt() {
        PartyFinder party = new PartyFinder("creator", "Party", "desc", 5, List.of());

        Instant newTime = Instant.now().minusSeconds(500);
        party.setTime(newTime);

        assertEquals(newTime, party.getCreatedAt());
    }

    @Test
    void setMaxMembers_updatesValue() {
        PartyFinder party = new PartyFinder("creator", "Party", "desc", 5, List.of());
        party.setMaxMembers(10);

        assertEquals(10, party.getMaxMembers());
    }

    @Test
    void setName_updatesValue() {
        PartyFinder party = new PartyFinder("creator", "Party", "desc", 5, List.of());
        party.setName("New Name");

        assertEquals("New Name", party.getName());
    }

    @Test
    void setDescription_updatesValue() {
        PartyFinder party = new PartyFinder("creator", "Party", "desc", 5, List.of());
        party.setDescription("Updated");

        assertEquals("Updated", party.getDescription());
    }

    @Test
    void setCategories_updatesValue() {
        PartyFinder party = new PartyFinder("creator", "Party", "desc", 5, List.of());
        party.setCategories(List.of(Category.ADVENTURE, Category.ACTION));

        assertEquals(2, party.getCategories().size());
        assertTrue(party.getCategories().contains(Category.ACTION));
    }

    @Test
    void randomImage_isAlwaysValid() {
        boolean allValid = true;

        for (int i = 0; i < 50; i++) {
            PartyFinder party = new PartyFinder("creator", "Party", "desc", 5, List.of());
            String img = party.getPartyImg();

            if (!List.of(
                    "/images/img1.png",
                    "/images/img2.png",
                    "/images/img3.png",
                    "/images/img4.png",
                    "/images/img5.png",
                    "/images/img6.png",
                    "/images/img7.png"
            ).contains(img)) {
                allValid = false;
                break;
            }
        }

        assertTrue(allValid);
    }
}
