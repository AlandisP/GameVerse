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
        if(cr.existsByCommunityIdAndUserId(communityId, userId)) {
            throw new RuntimeException("User is already a part of this community!");
        }
        CommunityMembership cm = new CommunityMembership(userId, communityId, MemberType.MEMBER);
        cr.save(cm);
        com.setMemberCount((int) cr.countByCommunityId(communityId));
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

    // deletes a community
    public void deleteCommunity(String communityId) {
        Community com = communityRepository.findById(communityId).orElse(null);
        if(com == null) {
            throw new RuntimeException("Community or User doesn't exist");
        }
        cr.deleteAllByCommunityId(communityId);
        communityRepository.delete(com);
    }
    // gets all of a user's communities
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
    // gets only members of a community
    public List<User> getCommunityMembers(String communityId) {
        List<User> usernames = new ArrayList<>();
        List<CommunityMembership> members = cr.findByCommunityId(communityId);
        for(int i = 0; i < members.size(); i++) {
            if(members.get(i).getType() == MemberType.MEMBER) {
                usernames.add(userRepository.findById(members.get(i).getUserId()).orElse(null));
            }
        }
        return usernames;
    }
    // Filters through and gets the moderators and owners of a community
    public List<User> getCommunityOwnerAndMods(String communityId) {
        List<User> users = new ArrayList<>();
        List<CommunityMembership> mods = cr.findByCommunityId(communityId);
        for(int i = 0; i < mods.size(); i++) {
            if(mods.get(i).getType() == MemberType.MODERATOR || mods.get(i).getType() == MemberType.OWNER) {
                users.add(userRepository.findById(mods.get(i).getUserId()).orElse(null));
            } 
        }
        return users;

    }

}
