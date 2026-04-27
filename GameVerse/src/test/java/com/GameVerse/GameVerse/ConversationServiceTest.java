package com.GameVerse.GameVerse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.GameVerse.GameVerse.model.Conversation;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.ConversationRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.services.ConversationService;

@ExtendWith(MockitoExtension.class)
class ConversationServiceTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ConversationService conversationService;

    @Test
    void createDirectConversation_throwsWhenCurrentUserNotFound() {
        when(userRepository.findByUsernameIgnoreCase("current"))
                .thenReturn(null);

        assertThrows(RuntimeException.class, () ->
                conversationService.createDirectConversation("current", "target"));

        verify(conversationRepository, never()).save(any());
    }

    @Test
    void createDirectConversation_returnsExistingConversation() {
        User current = new User();
        current.setId("u1");
        current.setUsername("current");

        User target = new User();
        target.setId("u2");
        target.setUsername("target");

        Conversation convo = new Conversation();
        convo.setType("DIRECT");
        convo.setMemberIds(List.of("u1", "u2"));

        when(userRepository.findByUsernameIgnoreCase("current"))
                .thenReturn(current);
        when(userRepository.findByUsernameIgnoreCase("target"))
                .thenReturn(target);
        when(conversationRepository.findByTypeAndMemberIdsContaining("DIRECT", "u1"))
                .thenReturn(List.of(convo));

        Conversation result =
                conversationService.createDirectConversation("current", "target");

        assertEquals(convo, result);
    }

    @Test
    void createGroupConversation_successful() {
        User creator = new User();
        creator.setId("u1");

        User user2 = new User();
        user2.setId("u2");

        User user3 = new User();
        user3.setId("u3");

        when(userRepository.findByUsernameIgnoreCase("creator"))
                .thenReturn(creator);
        when(userRepository.findByUsernameIgnoreCase("user2"))
                .thenReturn(user2);
        when(userRepository.findByUsernameIgnoreCase("user3"))
                .thenReturn(user3);

        when(conversationRepository.save(any()))
                .thenAnswer(inv -> inv.getArgument(0));

        Conversation convo =
                conversationService.createGroupConversation(
                        "creator", "Group", List.of("user2", "user3"));

        assertEquals("GROUP", convo.getType());
        assertEquals(3, convo.getMemberIds().size());
    }
}