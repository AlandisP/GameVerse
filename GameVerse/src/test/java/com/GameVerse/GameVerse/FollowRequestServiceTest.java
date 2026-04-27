package com.GameVerse.GameVerse;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.GameVerse.GameVerse.model.FollowRequest;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.FollowRequestRepository;
import com.GameVerse.GameVerse.repository.RelationshipRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.services.FollowRequestService;
import com.GameVerse.GameVerse.services.RelationshipServices;
@ExtendWith(MockitoExtension.class)
public class FollowRequestServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private FollowRequestRepository frRepository;
    @Mock private RelationshipRepository relationshipRepository;
    @Mock private RelationshipServices relationshipServices;

    @InjectMocks private FollowRequestService followRequestService;



    @Test
    void sendARequest_SuccessfullySavesRequest() {
        User sender = new User(); sender.setId("u1");
        User receiver = new User(); receiver.setId("u2");

        when(userRepository.findById("u1")).thenReturn(Optional.of(sender));
        when(userRepository.findById("u2")).thenReturn(Optional.of(receiver));

        when(relationshipRepository.existsByFollowerIdAndFollowingId("u1", "u2")).thenReturn(false);
        when(frRepository.existsBySenderIdAndReceiverId("u1", "u2")).thenReturn(false);

        followRequestService.sendARequest("u1", "u2");

        verify(frRepository).save(any(FollowRequest.class));
    }

    @Test
    void sendARequest_UserNotFound_ThrowsException() {
        when(userRepository.findById("u1")).thenReturn(Optional.empty());
        when(userRepository.findById("u2")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
            followRequestService.sendARequest("u1", "u2")
        );
    }
    @Test
    void sendARequest_RelationshipAlreadyExists_ThrowsException() {
        User sender = new User(); sender.setId("u1");
        User receiver = new User(); receiver.setId("u2");

        when(userRepository.findById("u1")).thenReturn(Optional.of(sender));
        when(userRepository.findById("u2")).thenReturn(Optional.of(receiver));

        when(relationshipRepository.existsByFollowerIdAndFollowingId("u1", "u2")).thenReturn(true);

        assertThrows(RuntimeException.class, () ->
            followRequestService.sendARequest("u1", "u2")
        );
    }

    @Test
    void sendARequest_RequestAlreadyExists_ThrowsException() {
        User sender = new User(); sender.setId("u1");
        User receiver = new User(); receiver.setId("u2");

        when(userRepository.findById("u1")).thenReturn(Optional.of(sender));
        when(userRepository.findById("u2")).thenReturn(Optional.of(receiver));

        when(relationshipRepository.existsByFollowerIdAndFollowingId("u1", "u2")).thenReturn(false);
        when(frRepository.existsBySenderIdAndReceiverId("u1", "u2")).thenReturn(true);

        assertThrows(RuntimeException.class, () ->
            followRequestService.sendARequest("u1", "u2")
        );
    }

    @Test
    void cancelRequest_DeletesRequest() {
        FollowRequest req = new FollowRequest("u1", "u2");

        when(frRepository.findBySenderIdAndReceiverId("u1", "u2"))
                .thenReturn(Optional.of(req));

        followRequestService.cancelRequest("u1", "u2");

        verify(frRepository).delete(req);
    }

    @Test
    void cancelRequest_RequestNotFound_ThrowsException() {
        when(frRepository.findBySenderIdAndReceiverId("u1", "u2"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
            followRequestService.cancelRequest("u1", "u2")
        );
    }

    @Test
    void requestChoice_Accept_FollowsUserAndDeletesRequest() {
        FollowRequest req = new FollowRequest("sender", "receiver");
        req.setId("req1");

        when(frRepository.findById("req1")).thenReturn(Optional.of(req));

        followRequestService.requestChoice("req1", true);

        verify(relationshipServices).followUser("sender", "receiver");
        verify(frRepository).delete(req);
    }

    @Test
    void requestChoice_Reject_DeletesRequestOnly() {
        FollowRequest req = new FollowRequest("sender", "receiver");
        req.setId("req1");

        when(frRepository.findById("req1")).thenReturn(Optional.of(req));

        followRequestService.requestChoice("req1", false);

        verify(relationshipServices, never()).followUser(any(), any());
        verify(frRepository).delete(req);
    }

    @Test
    void requestChoice_RequestNotFound_ThrowsException() {
        when(frRepository.findById("req1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
            followRequestService.requestChoice("req1", true)
        );
    }


    
}
