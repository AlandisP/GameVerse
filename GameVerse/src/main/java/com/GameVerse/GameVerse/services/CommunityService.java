package com.GameVerse.GameVerse.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.GameVerse.GameVerse.model.Community;
import com.GameVerse.GameVerse.model.CommunityCategory;
import com.GameVerse.GameVerse.model.CommunityMembership;
import com.GameVerse.GameVerse.model.MemberType;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.CommunityMembershipRepository;
import com.GameVerse.GameVerse.repository.CommunityRepository;
import com.GameVerse.GameVerse.repository.PostRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import java.util.*;
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

    public void createCommunity(String ownerId, String name, String description, CommunityCategory category) {
        User user = userRepository.findById(ownerId).orElse(null);
        if(user == null) {
            throw new RuntimeException("User doesn't exist");
        }
        Community com = new Community(ownerId, name, description, category);
        communityRepository.save(com);
        CommunityMembership cm = new CommunityMembership(ownerId, com.getId(), MemberType.OWNER);
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

    // public void communityPost(String communityId, String userId, String text) {
    //     Community com = communityRepository.findById(communityId).orElse(null);
    //     User user = userRepository.findById(userId).orElse(null);
    //     if(com == null || user == null) {
    //         throw new RuntimeException("Community or User doesn't exist");
    //     }
    //     Post post = new Post(text, userId, communityId);
    //     postRepository.save(post);

    // }

    public void deleteCommunity(String communityId) {
        Community com = communityRepository.findById(communityId).orElse(null);
        if(com == null) {
            throw new RuntimeException("Community or User doesn't exist");
        }
        cr.deleteAllByCommunityId(communityId);
        communityRepository.delete(com);
    }

    public List<Community> getUsersCommunities(String userId) {
        if(!userRepository.existsByUsername(userId)) {
            throw new RuntimeException(" User doesn't exist");
        }
        List<CommunityMembership> arr = cr.findAllByUserId(userId);
        List<Community> coms = new ArrayList<Community>();
        for(int i = 0; i < arr.size(); i++) {
            coms.add(communityRepository.findById(arr.get(i).getCommunityId()).orElse(null));
        }
        return coms;
    }
    // This is structured so that we aren't showing 5+ commiunites on the featured page
    public List<Community> getTopCommunitiesForUser(String userId) {
        if(!userRepository.existsByUsername(userId)) {
            throw new RuntimeException(" User doesn't exist");
        }
        List<CommunityMembership> arr = cr.findTop5ByUserId(userId);
        List<Community> coms = new ArrayList<Community>();
        for(int i = 0; i < arr.size(); i++) {
            coms.add(communityRepository.findById(arr.get(i).getCommunityId()).orElse(null));
        }
        return coms;
    }

}
