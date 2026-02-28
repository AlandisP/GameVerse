package com.GameVerse.GameVerse.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.GameVerse.GameVerse.model.Notification;
@Repository
public interface NotificationRepository extends MongoRepository<Notification, Object> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    long countByUserIdAndReadFalse(String userId);
}
