package com.GameVerse.GameVerse;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.GameVerse.GameVerse.model.BlockingRelationship;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.BlockedRelationshipRepository;
import com.GameVerse.GameVerse.repository.RelationshipRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.services.BlockedService;
import com.GameVerse.GameVerse.services.RelationshipServices;
@ExtendWith(MockitoExtension.class)
public class BlockedServiceTest {

    @Mock private BlockedRelationshipRepository blockedRepository;
    @Mock private UserRepository userRepository;
    @Mock private RelationshipRepository relationshipRepository;
    @Mock private RelationshipServices relationshipServices;

    @InjectMocks private BlockedService blockedService;

    @Test
    void getBlockList_ReturnsUsernames() {
        User u1 = new User(); u1.setId("u1");
        User u2 = new User(); u2.setId("u2"); u2.setUsername("Alice");
        User u3 = new User(); u3.setId("u3"); u3.setUsername("Bob");

        when(userRepository.findById("u1")).thenReturn(Optional.of(u1));

        List<BlockingRelationship> blocks = Arrays.asList(
                new BlockingRelationship("u1", "u2"),
                new BlockingRelationship("u1", "u3")
        );

        when(blockedRepository.findAllByUserId("u1")).thenReturn(blocks);
        when(userRepository.findById("u2")).thenReturn(Optional.of(u2));
        when(userRepository.findById("u3")).thenReturn(Optional.of(u3));

        List<String> result = blockedService.getBlockList("u1");

        assertEquals(Arrays.asList("Alice", "Bob"), result);
    }

    @Test
    void getBlockList_UserNotFound_ThrowsException() {
        when(userRepository.findById("u1")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> blockedService.getBlockList("u1"));
    }

    @Test
    void getBlockListIds_ReturnsIds() {
        User u1 = new User(); u1.setId("u1");

        when(userRepository.findById("u1")).thenReturn(Optional.of(u1));

        List<BlockingRelationship> blocks = Arrays.asList(
                new BlockingRelationship("u1", "x"),
                new BlockingRelationship("u1", "y")
        );

        when(blockedRepository.findAllByUserId("u1")).thenReturn(blocks);

        List<String> result = blockedService.getBlockListIds("u1");

        assertEquals(Arrays.asList("x", "y"), result);
    }

    @Test
    void getBlockListIds_UserNotFound_ThrowsException() {
        when(userRepository.findById("u1")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> blockedService.getBlockListIds("u1"));
    }

    @Test
    void getBlockedListIds_ReturnsIds() {
        User u = new User(); u.setId("u2");

        when(userRepository.findById("u2")).thenReturn(Optional.of(u));

        List<BlockingRelationship> blocks = Arrays.asList(
                new BlockingRelationship("a", "u2"),
                new BlockingRelationship("b", "u2")
        );

        when(blockedRepository.findAllByBlockedId("u2")).thenReturn(blocks);

        List<String> result = blockedService.getBlockedListIds("u2");

        assertEquals(Arrays.asList("a", "b"), result);
    }

    @Test
    void getBlockedListIds_UserNotFound_ThrowsException() {
        when(userRepository.findById("u2")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> blockedService.getBlockedListIds("u2"));
    }

    @Test
    void blockUser_SuccessfullyBlocksAndUpdatesCount() {
        User u1 = new User(); u1.setId("u1");
        User u2 = new User(); u2.setId("u2");

        when(userRepository.findById("u1")).thenReturn(Optional.of(u1));
        when(userRepository.findById("u2")).thenReturn(Optional.of(u2));

        when(relationshipRepository.existsByFollowerIdAndFollowingId("u1", "u2")).thenReturn(false);
        when(relationshipRepository.existsByFollowerIdAndFollowingId("u2", "u1")).thenReturn(false);

        when(blockedRepository.countByUserId("u1")).thenReturn(3L);

        blockedService.blockUser("u1", "u2");

        verify(blockedRepository).save(any(BlockingRelationship.class));
        assertEquals(3, u1.getBlockedCount());
    }

    @Test
    void blockUser_UsersFollowEachOther_UnfollowsBothDirections() {
        User u1 = new User(); u1.setId("u1");
        User u2 = new User(); u2.setId("u2");

        when(userRepository.findById("u1")).thenReturn(Optional.of(u1));
        when(userRepository.findById("u2")).thenReturn(Optional.of(u2));

        when(relationshipRepository.existsByFollowerIdAndFollowingId("u1", "u2")).thenReturn(true);
        when(relationshipRepository.existsByFollowerIdAndFollowingId("u2", "u1")).thenReturn(true);

        blockedService.blockUser("u1", "u2");

        verify(relationshipServices).unfollowUser("u1", "u2");
        verify(relationshipServices).unfollowUser("u2", "u1");
        verify(blockedRepository).save(any(BlockingRelationship.class));
    }

    @Test
    void blockUser_UserNotFound_ThrowsException() {
        when(userRepository.findById("u1")).thenReturn(Optional.empty());
        when(userRepository.findById("u2")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> blockedService.blockUser("u1", "u2"));
    }

    @Test
    void unblockUser_RemovesBlockAndUpdatesCount() {
        BlockingRelationship rel = new BlockingRelationship("u1", "u2");
        User u1 = new User(); u1.setId("u1");

        when(blockedRepository.findByUserIdAndBlockedId("u1", "u2")).thenReturn(rel);
        when(userRepository.findById("u1")).thenReturn(Optional.of(u1));
        when(blockedRepository.countByUserId("u1")).thenReturn(1L);

        blockedService.unblockUser("u1", "u2");

        verify(blockedRepository).deleteByUserIdAndBlockedId("u1", "u2");
        assertEquals(1, u1.getBlockedCount());
    }

    @Test
    void unblockUser_RelationshipNotFound_ThrowsException() {
        when(blockedRepository.findByUserIdAndBlockedId("u1", "u2")).thenReturn(null);
        assertThrows(RuntimeException.class, () -> blockedService.unblockUser("u1", "u2"));
    }
    
}
