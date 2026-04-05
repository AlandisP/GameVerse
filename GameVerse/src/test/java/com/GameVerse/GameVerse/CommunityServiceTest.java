package com.GameVerse.GameVerse;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
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

import com.GameVerse.GameVerse.model.Community;
import com.GameVerse.GameVerse.model.CommunityCategory;
import com.GameVerse.GameVerse.model.CommunityMembership;
import com.GameVerse.GameVerse.model.MemberType;
import com.GameVerse.GameVerse.model.Role;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.CommunityMembershipRepository;
import com.GameVerse.GameVerse.repository.CommunityRepository;
import com.GameVerse.GameVerse.repository.PostRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.security.S3Service;
import com.GameVerse.GameVerse.services.CommunityService;

@ExtendWith(MockitoExtension.class)
class CommunityServiceTest{

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommunityMembershipRepository cr;

    @Mock
    private S3Service s3serv;

    // ===== Service Under Test =====
    @InjectMocks
    private CommunityService communityService;

   @Test
    void createCommunity_throwsWhenUserDoesNotExist() {
        when(userRepository.findById("owner123"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                communityService.createCommunity("owner123", "TestCom", "desc", CommunityCategory.CROSSPLATFORM)
        );

        verify(communityRepository, never()).save(any());
        verify(cr, never()).save(any());
    }


    @Test
    void createCommunity_throwsWhenUserAlreadyOwnsCommunity() {
        User user = new User();
        user.setRole(Role.USER);

        when(userRepository.findById("owner123"))
                .thenReturn(Optional.of(user));

        when(communityRepository.existsByOwnerId("owner123"))
                .thenReturn(true);

        assertThrows(RuntimeException.class, () ->
                communityService.createCommunity("owner123", "TestCom", "desc", CommunityCategory.NINTENDO)
        );

        verify(communityRepository, never()).save(any());
        verify(cr, never()).save(any());
    }

    @Test
    void addMember_throwsWhenCommunityOrUserDoesNotExist() {
        when(communityRepository.findById("com1"))
                .thenReturn(Optional.empty());

        when(userRepository.findById("user1"))
                .thenReturn(Optional.of(new User()));

        assertThrows(RuntimeException.class, () ->
                communityService.addMember("com1", "user1")
        );

        verify(cr, never()).save(any());
    }

    @Test
    void addMember_throwsWhenUserAlreadyInCommunity() {
        Community com = new Community("owner", "Test", "desc", CommunityCategory.PC);
        User user = new User();

        when(communityRepository.findById("com1"))
                .thenReturn(Optional.of(com));

        when(userRepository.findById("user1"))
                .thenReturn(Optional.of(user));

        when(cr.existsByCommunityIdAndUserId("com1", "user1"))
                .thenReturn(true);

        assertThrows(RuntimeException.class, () ->
                communityService.addMember("com1", "user1")
        );

        verify(cr, never()).save(any());
    }


    @Test
    void addModerator_successful() {
        Community com = new Community("owner", "Test", "desc", CommunityCategory.NINTENDO);
        User user = new User();
        CommunityMembership cm = new CommunityMembership("user1", "com1", MemberType.MEMBER);

        when(communityRepository.findById("com1"))
                .thenReturn(Optional.of(com));

        when(userRepository.findById("user1"))
                .thenReturn(Optional.of(user));

        when(cr.findByCommunityIdAndUserId("com1", "user1"))
                .thenReturn(cm);

        communityService.addModerator("com1", "user1");

        assertTrue(com.getModeratorIds().contains("user1"));
        verify(cr).save(cm);
        verify(communityRepository).save(com);
    }

    @Test
    void removeModerator_successful() {
        Community com = new Community("owner", "Test", "desc", CommunityCategory.PLAYSTATION);
        com.addModerator("user1");

        User user = new User();
        CommunityMembership cm = new CommunityMembership("user1", "com1", MemberType.MODERATOR);

        when(communityRepository.findById("com1"))
                .thenReturn(Optional.of(com));

        when(userRepository.findById("user1"))
                .thenReturn(Optional.of(user));

        when(cr.findByCommunityIdAndUserId("com1", "user1"))
                .thenReturn(cm);

        communityService.removeModerator("com1", "user1");

        assertFalse(com.getModeratorIds().contains("user1"));
        verify(cr).save(cm);
        verify(communityRepository).save(com);
    }

    @Test
    void removeMember_throwsWhenCommunityOrUserMissing() {
        when(communityRepository.findById("com1"))
                .thenReturn(Optional.empty());

        when(userRepository.findById("user1"))
                .thenReturn(Optional.of(new User()));

        assertThrows(RuntimeException.class, () ->
                communityService.removeMember("com1", "user1")
        );

        verify(cr, never()).delete(any());
    }

}