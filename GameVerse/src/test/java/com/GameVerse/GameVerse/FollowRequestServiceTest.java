package com.GameVerse.GameVerse;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.GameVerse.GameVerse.model.FollowRequest;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.FollowRequestRepository;
import com.GameVerse.GameVerse.repository.RelationshipRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.services.FollowRequestService;
import com.GameVerse.GameVerse.services.RelationshipServices;

@ExtendWith(MockitoExtension.class)
class FollowRequestServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FollowRequestRepository frRepository;

    @Mock
    private RelationshipRepository relationshipRepository;

    @Mock
    private RelationshipServices relationshipServices;

    @InjectMocks
    private FollowRequestService followRequestService;

    @Test
    void sendARequest_throwsWhenAlreadyFollowing() {
        when(userRepository.findById("u1"))
                .thenReturn(Optional.of(new User()));
        when(userRepository.findById("u2"))
                .thenReturn(Optional.of(new User()));
        when(relationshipRepository
                .existsByFollowerIdAndFollowingId("u1", "u2"))
                .thenReturn(true);

        assertThrows(RuntimeException.class, () ->
                followRequestService.sendARequest("u1", "u2"));
    }

    @Test
    void requestChoice_acceptsRequest() {
        FollowRequest req = new FollowRequest("u1", "u2");

        when(frRepository.findById("req1"))
                .thenReturn(Optional.of(req));

        followRequestService.requestChoice("req1", true);

        verify(relationshipServices).followUser("u1", "u2");
        verify(frRepository).delete(req);
    }
}