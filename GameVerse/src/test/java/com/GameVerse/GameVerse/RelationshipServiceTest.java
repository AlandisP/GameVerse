package com.GameVerse.GameVerse;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
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

import com.GameVerse.GameVerse.model.Relationship;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.RelationshipRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.services.RelationshipServices;

@ExtendWith(MockitoExtension.class)
public class RelationshipServiceTest {

    @Mock
    private RelationshipRepository relationshipRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RelationshipServices relationshipServices;

    @Test
    void followUser_NewFollow_SavesRelationshipAndUpdatesCounts() {
        String followerId = "u1";
        String followingId = "u2";

        User follower = new User();
        follower.setId(followerId);

        User target = new User();
        target.setId(followingId);

        when(relationshipRepository.existsByFollowerIdAndFollowingId(followerId, followingId))
                .thenReturn(false);

        when(userRepository.findById(followerId)).thenReturn(Optional.of(follower));
        when(userRepository.findById(followingId)).thenReturn(Optional.of(target));

        when(relationshipRepository.countByFollowerId(followerId)).thenReturn(3L);
        when(relationshipRepository.countByFollowingId(followingId)).thenReturn(5L);

        relationshipServices.followUser(followerId, followingId);

        verify(relationshipRepository).save(any(Relationship.class));
        assertEquals(3, follower.getFollowingCount());
        assertEquals(5, target.getFollowerCount());
    }

    @Test
    void followUser_AlreadyFollowing_DoesNothing() {
        when(relationshipRepository.existsByFollowerIdAndFollowingId("u1", "u2"))
                .thenReturn(true);

        relationshipServices.followUser("u1", "u2");

        verify(relationshipRepository, never()).save(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void unfollowUser_RemovesRelationshipAndUpdatesCounts() {
        String followerId = "u1";
        String followingId = "u2";

        User follower = new User();
        follower.setId(followerId);

        User target = new User();
        target.setId(followingId);

        when(userRepository.findById(followerId)).thenReturn(Optional.of(follower));
        when(userRepository.findById(followingId)).thenReturn(Optional.of(target));

        when(relationshipRepository.countByFollowerId(followerId)).thenReturn(1L);
        when(relationshipRepository.countByFollowingId(followingId)).thenReturn(4L);

        relationshipServices.unfollowUser(followerId, followingId);

        verify(relationshipRepository).deleteByFollowerIdAndFollowingId(followerId, followingId);
        assertEquals(1, follower.getFollowingCount());
        assertEquals(4, target.getFollowerCount());
    }

    @Test
    void getFollowingList_ReturnsCorrectIds() {
        List<Relationship> rels = Arrays.asList(
                new Relationship("u1", "a"),
                new Relationship("u1", "b"),
                new Relationship("u1", "c")
        );

        when(relationshipRepository.findAllByFollowerId("u1")).thenReturn(rels);

        List<String> result = relationshipServices.getFollowingList("u1");

        assertEquals(Arrays.asList("a", "b", "c"), result);
    }

    @Test
    void getFollowerList_ReturnsCorrectIds() {
        List<Relationship> rels = Arrays.asList(
                new Relationship("x", "u1"),
                new Relationship("y", "u1"),
                new Relationship("z", "u1")
        );

        when(relationshipRepository.findAllByFollowingId("u1")).thenReturn(rels);

        List<String> result = relationshipServices.getFollowerList("u1");

        assertEquals(Arrays.asList("x", "y", "z"), result);
    }

    @Test
    void isFollowing_ReturnsFalseWhenNotExists() {
        when(relationshipRepository.existsByFollowerIdAndFollowingId("u1", "u2"))
                .thenReturn(false);

        assertFalse(relationshipServices.isFollowing("u1", "u2"));
    }
    
}
