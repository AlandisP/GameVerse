package com.GameVerse.GameVerse.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.GameVerse.GameVerse.model.Community;
import com.GameVerse.GameVerse.model.CommunityMembership;
import com.GameVerse.GameVerse.model.MemberType;
import com.GameVerse.GameVerse.model.Post;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.CommunityMembershipRepository;
import com.GameVerse.GameVerse.repository.CommunityRepository;
import com.GameVerse.GameVerse.repository.PostRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
@Service
public class CommunityService {
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommunityMembershipRepository cr;

    public void createCommunity(String ownerId, String name, String description) {
        User user = userRepository.findById(ownerId).orElse(null);
        if(user == null) {
            throw new RuntimeException("User doesn't exist");
        }
        Community com = new Community(ownerId, name, description);
        CommunityMembership cm = new CommunityMembership(ownerId, com.getId(), MemberType.OWNER);
        communityRepository.save(com);
        cr.save(cm);
    }

    public void addMember(String communityId, String userId) {
        Community com = communityRepository.findById(communityId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        if(com == null || user == null) {
            throw new RuntimeException("Community or User doesn't exist");
        }
        CommunityMembership cm = new CommunityMembership(userId, communityId, MemberType.MEMBER);
        com.setMemberCount((int) cr.countByCommunityId(communityId));
        cr.save(cm);
        communityRepository.save(com);
    }

    public void addModerator(String communityId, String userId) {
        Community com = communityRepository.findById(communityId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        if(com == null || user == null) {
            throw new RuntimeException("Community or User doesn't exist");
        }
        CommunityMembership cm = cr.findByCommunityIdAndUserId(communityId, userId);
        com.addModerator(userId);
        cm.changeMemberType(MemberType.MODERATOR);
        cr.save(cm);
        communityRepository.save(com);
    }

    public void removeModerator(String communityId, String userId) {
        Community com = communityRepository.findById(communityId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        if(com == null || user == null) {
            throw new RuntimeException("Community or User doesn't exist");
        }
        com.getModeratorIds().remove(userId);
        communityRepository.save(com);
    }

    public void removeMember(String communityId, String userId) {
        Community com = communityRepository.findById(communityId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        if(com == null || user == null) {
            throw new RuntimeException("Community or User doesn't exist");
        }
        CommunityMembership cm = cr.findByCommunityIdAndUserId(communityId, userId);
        cr.delete(cm);
        com.setMemberCount((int) cr.countByCommunityId(communityId));
        communityRepository.save(com);
    }

    public void communityPost(String communityId, String userId, String text) {
        Community com = communityRepository.findById(communityId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        if(com == null || user == null) {
            throw new RuntimeException("Community or User doesn't exist");
        }
        Post post = new Post(text, userId, communityId);
        postRepository.save(post);

    }

}
