package com.GameVerse.GameVerse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.GameVerse.GameVerse.model.BlockingRelationship;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.BlockedRelationshipRepository;
import com.GameVerse.GameVerse.repository.RelationshipRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.services.BlockedService;
import com.GameVerse.GameVerse.services.RelationshipServices;

@ExtendWith(MockitoExtension.class)
class BlockedServiceTest {

    @Mock
    private BlockedRelationshipRepository blockedRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RelationshipRepository relationshipRepository;

    @Mock
    private RelationshipServices relationshipServices;

    @InjectMocks
    private BlockedService blockedService;

    @Test
    void getBlockList_throwsWhenUserNotFound() {
        when(userRepository.findById("user1"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                blockedService.getBlockList("user1"));
    }

    @Test
    void getBlockListIds_successful() {
        User user = new User();
        user.setId("user1");

        BlockingRelationship block =
                new BlockingRelationship("user1", "user2");

        when(userRepository.findById("user1"))
                .thenReturn(Optional.of(user));
        when(blockedRepository.findAllByUserId("user1"))
                .thenReturn(List.of(block));

        List<String> ids =
                blockedService.getBlockListIds("user1");

        assertEquals(List.of("user2"), ids);
    }

    @Test
    void blockUser_unfollowsAndSaves() {
        when(userRepository.findById("u1"))
                .thenReturn(Optional.of(new User()));
        when(userRepository.findById("u2"))
                .thenReturn(Optional.of(new User()));
        when(relationshipRepository
                .existsByFollowerIdAndFollowingId("u1", "u2"))
                .thenReturn(true);

        blockedService.blockUser("u1", "u2");

        verify(relationshipServices).unfollowUser("u1", "u2");
        verify(blockedRepository).save(any());
    }
}

