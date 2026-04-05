package com.GameVerse.GameVerse.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.GameVerse.GameVerse.model.Conversation;

public interface ConversationRepository extends MongoRepository<Conversation, String> {
    List<Conversation> findByTypeAndMemberIdsContaining(String type, String memberId);
    List<Conversation> findByMemberIdsContaining(String memberId);
}