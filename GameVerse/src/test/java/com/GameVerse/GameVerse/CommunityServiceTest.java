package com.GameVerse.GameVerse;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import com.GameVerse.GameVerse.model.Community;
import com.GameVerse.GameVerse.model.CommunityCategory;
import com.GameVerse.GameVerse.model.CommunityMembership;
import com.GameVerse.GameVerse.model.MemberType;
import com.GameVerse.GameVerse.model.Post;
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

        @Test
        void createCommunity_UserAlreadyOwnsCommunity_ThrowsException() {
                User user = new User();
                user.setId("u1");
                user.setRole(Role.USER);

                when(userRepository.findById("u1")).thenReturn(Optional.of(user));
                when(communityRepository.existsByOwnerId("u1")).thenReturn(true);

                assertThrows(RuntimeException.class, () ->
                        communityService.createCommunity("u1", "Test", "Desc", CommunityCategory.CROSSPLATFORM)
                );
        }

        @Test
        void addMember_UserAlreadyMember_ThrowsException() {
                Community com = new Community("owner", "name", "desc", CommunityCategory.PLAYSTATION);
                User user = new User();

                when(communityRepository.findById("c1")).thenReturn(Optional.of(com));
                when(userRepository.findById("u1")).thenReturn(Optional.of(user));
                when(cr.existsByCommunityIdAndUserId("c1", "u1")).thenReturn(true);

                assertThrows(RuntimeException.class, () ->
                        communityService.addMember("c1", "u1")
                );
        }

        @Test
        void addModerator_UserNotInCommunity_ThrowsException() {
                Community com = new Community("owner", "name", "desc", CommunityCategory.PC);
                User user = new User();

                when(communityRepository.findById("c1")).thenReturn(Optional.of(com));
                when(userRepository.findById("u1")).thenReturn(Optional.of(user));
                when(cr.findByCommunityIdAndUserId("c1", "u1")).thenReturn(null);

                assertThrows(NullPointerException.class, () ->
                        communityService.addModerator("c1", "u1")
                );
        }

        @Test
        void removeMember_OwnerTriesToLeave_ThrowsException() {
                Community com = new Community("ownerId", "name", "desc", CommunityCategory.PLAYSTATION);
                User user = new User();

                when(communityRepository.findById("c1")).thenReturn(Optional.of(com));
                when(userRepository.findById("ownerId")).thenReturn(Optional.of(user));

                assertThrows(RuntimeException.class, () ->
                        communityService.removeMember("c1", "ownerId")
                );
        }

        @Test
        void removeMember_RemovesModeratorAndUpdatesCount() {
                Community com = new Community("owner", "name", "desc", CommunityCategory.CROSSPLATFORM);
                com.addModerator("u1");

                User user = new User();
                CommunityMembership cm = new CommunityMembership("u1", "c1", MemberType.MODERATOR);

                when(communityRepository.findById("c1")).thenReturn(Optional.of(com));
                when(userRepository.findById("u1")).thenReturn(Optional.of(user));
                when(cr.findByCommunityIdAndUserId("c1", "u1")).thenReturn(cm);

                when(cr.countByCommunityId("c1")).thenReturn(3L);

                communityService.removeMember("c1", "u1");

                verify(cr).delete(cm);
                assertFalse(com.getModeratorIds().contains("u1"));
                assertEquals(3, com.getMemberCount());
        }

        @Test
        void communityPost_WithMedia_UploadsAndSaves() throws Exception {
                Community com = new Community("owner", "name", "desc", CommunityCategory.XBOX);
                User user = new User();
                user.setUsername("testUser");

                MultipartFile file = mock(MultipartFile.class);
                when(file.getContentType()).thenReturn("image/png");
                when(file.getOriginalFilename()).thenReturn("pic.png");

                when(communityRepository.findById("c1")).thenReturn(Optional.of(com));
                when(userRepository.findByUsernameIgnoreCase("testUser")).thenReturn(user);
                when(s3serv.uploadFile(file, "testUser")).thenReturn("uploaded.png");

                communityService.communityPost("c1", "testUser", "hello", file);

                verify(postRepository).save(any(Post.class));
        }

        @Test
        void deleteCommunity_DeletesMembershipsThenCommunity() {
                Community com = new Community("owner", "name", "desc", CommunityCategory.PC);

                when(communityRepository.findById("c1")).thenReturn(Optional.of(com));

                communityService.deleteCommunity("c1");

                verify(cr).deleteAllByCommunityId("c1");
                verify(communityRepository).delete(com);
        }

        @Test
        void transferOwnership_UpdatesRolesAndOwner() {
                Community com = new Community("oldOwner", "name", "desc", CommunityCategory.PC);

                User newOwner = new User();
                CommunityMembership newOwnerMembership = new CommunityMembership("newOwner", "c1", MemberType.MEMBER);
                CommunityMembership oldOwnerMembership = new CommunityMembership("oldOwner", "c1", MemberType.OWNER);

                when(userRepository.findById("newOwner")).thenReturn(Optional.of(newOwner));
                when(communityRepository.findById("c1")).thenReturn(Optional.of(com));
                when(cr.findByCommunityIdAndUserId("c1", "newOwner")).thenReturn(newOwnerMembership);
                when(cr.findByCommunityIdAndUserId("c1", "oldOwner")).thenReturn(oldOwnerMembership);

                communityService.transferOwnership("c1", "newOwner");

                assertEquals("newOwner", com.getOwnerId());
                assertTrue(com.getModeratorIds().contains("newOwner"));
                assertEquals(MemberType.OWNER, newOwnerMembership.getType());
                assertEquals(MemberType.MODERATOR, oldOwnerMembership.getType());
        }
}