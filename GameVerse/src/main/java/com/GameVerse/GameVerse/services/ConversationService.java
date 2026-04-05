package com.GameVerse.GameVerse.services;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.GameVerse.GameVerse.model.Conversation;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.ConversationRepository;
import com.GameVerse.GameVerse.repository.UserRepository;

@Service
public class ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UserRepository userRepository;

    public Conversation createDirectConversation(String currentUsername, String targetUsername) {
        User currentUser = userRepository.findByUsernameIgnoreCase(currentUsername);
        if (currentUser == null) {
            throw new RuntimeException("Current user not found");
        }

        User targetUser = userRepository.findByUsernameIgnoreCase(targetUsername);
        if (targetUser == null) {
            throw new RuntimeException("Target user not found");
        }

        if (currentUser.getUsername().equalsIgnoreCase(targetUser.getUsername())) {
            throw new RuntimeException("You cannot create a conversation with yourself");
        }

        List<Conversation> existingDirects =
                conversationRepository.findByTypeAndMemberIdsContaining("DIRECT", currentUser.getId());

        for (Conversation convo : existingDirects) {
            List<String> members = convo.getMemberIds();
            if (members != null
                    && members.size() == 2
                    && members.contains(currentUser.getId())
                    && members.contains(targetUser.getId())) {
                return convo;
            }
        }

        Set<String> memberSet = new LinkedHashSet<>();
        memberSet.add(currentUser.getId());
        memberSet.add(targetUser.getId());

        List<String> memberIds = new ArrayList<>(memberSet);

        Conversation conversation = new Conversation();
        conversation.setType("DIRECT");
        conversation.setTitle(null);
        conversation.setCreatedBy(currentUser.getId());
        conversation.setMemberIds(memberIds);

        return conversationRepository.save(conversation);
    }

    public Conversation createGroupConversation(String currentUsername, String title, List<String> usernames) {
        User currentUser = userRepository.findByUsernameIgnoreCase(currentUsername);
        if (currentUser == null) {
            throw new RuntimeException("Current user not found");
        }

        Set<String> memberIds = new LinkedHashSet<>();
        memberIds.add(currentUser.getId());

        for (String username : usernames) {
            User user = userRepository.findByUsernameIgnoreCase(username);
            if (user == null) {
                throw new RuntimeException("User not found: " + username);
            }

            memberIds.add(user.getId());
        }

        if (memberIds.size() < 3) {
            throw new RuntimeException("A group chat must have at least 3 members including the creator");
        }

        Conversation conversation = new Conversation();
        conversation.setType("GROUP");
        conversation.setTitle(title);
        conversation.setCreatedBy(currentUser.getId());
        conversation.setMemberIds(new ArrayList<>(memberIds));

        return conversationRepository.save(conversation);
    }

    public List<Conversation> getUserConversations(String currentUsername) {
        User currentUser = userRepository.findByUsernameIgnoreCase(currentUsername);
        if (currentUser == null) {
            throw new RuntimeException("Current user not found");
        }

        return conversationRepository.findByMemberIdsContaining(currentUser.getId());
    }
}