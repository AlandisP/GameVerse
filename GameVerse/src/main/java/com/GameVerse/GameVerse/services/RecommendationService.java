package com.GameVerse.GameVerse.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.GameVerse.GameVerse.model.Relationship;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.RelationshipRepository;
import com.GameVerse.GameVerse.repository.UserRepository;

@Service
public class RecommendationService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RelationshipRepository relationshipRepository;
    @Autowired
    private MongoTemplate mongoTemplate;
    

    public List<User> followRecommendations(String userId) {
        User currentUser = userRepository.findById(userId).orElseThrow();

        // I have the research further with these
        Set<String> exclude = relationshipRepository.findAllByFollowerId(userId)
            .stream()
            .map(Relationship::getFollowingId)
            .collect(Collectors.toSet());
        exclude.add(userId);

        List<User> results = new ArrayList<>();

        // 1. Mutuals' follows
        if (results.size() < 7) {
            List<String> followerIds = mongoTemplate.find(
                new Query(Criteria.where("followingId").is(userId)),
                Relationship.class
            ).stream().map(Relationship::getFollowerId).toList();

            List<String> mutualIds = mongoTemplate.find(
                new Query(
                    Criteria.where("followerId").is(userId)
                            .and("followingId").in(followerIds)
                ),
                Relationship.class
            ).stream().map(Relationship::getFollowingId).toList();

            if (!mutualIds.isEmpty()) {
                List<User> mutualRecs = mongoTemplate.find(
                    new Query(
                        Criteria.where("followerId").in(mutualIds)
                                .and("followingId").nin(exclude)
                    ),
                    Relationship.class
                ).stream()
                 .map(r -> userRepository.findById(r.getFollowingId()).orElse(null))
                 .filter(Objects::nonNull)
                 .distinct()
                 .limit(7 - results.size())
                 .toList();
                results.addAll(mutualRecs);
                mutualRecs.forEach(u -> exclude.add(u.getId()));
            }
        }

        // 2. Same platform
        if (results.size() < 7 && currentUser.getPlatform() != null) {
            List<User> samePlatform = userRepository.findAllByPlatform(currentUser.getPlatform())
                .stream()
                .filter(u -> !exclude.contains(u.getId()))
                .limit(7 - results.size())
                .toList();
            results.addAll(samePlatform);
            samePlatform.forEach(u -> exclude.add(u.getId()));
        }

        // 3. Popular users as filler
        if (results.size() < 7) {
            List<User> popular = mongoTemplate.find(
                new Query(Criteria.where("_id").nin(exclude))
                    .with(Sort.by(Sort.Direction.DESC, "followerCount"))
                    .limit(7 - results.size()),
                User.class
            );
            results.addAll(popular);
        }

        return results;
    }
}
