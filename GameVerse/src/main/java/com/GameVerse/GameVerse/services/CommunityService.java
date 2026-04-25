package com.GameVerse.GameVerse.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.GameVerse.GameVerse.model.Community;
import com.GameVerse.GameVerse.model.CommunityCategory;
import com.GameVerse.GameVerse.model.CommunityMembership;
import com.GameVerse.GameVerse.model.MemberType;
import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.CommunityMembershipRepository;
import com.GameVerse.GameVerse.repository.CommunityRepository;
import com.GameVerse.GameVerse.repository.PostRepository;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.security.S3Service;

import java.util.*;

import javax.management.RuntimeErrorException;

import com.GameVerse.GameVerse.model.Post;
import com.GameVerse.GameVerse.model.Role;
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

    @Autowired
    private S3Service s3serv;

    public void createCommunity(String ownerId, String name, String description, CommunityCategory category) {
        User user = userRepository.findById(ownerId).orElse(null);
        if(user == null) {
            throw new RuntimeException("User doesn't exist");
        }
        if(communityRepository.existsByOwnerId(ownerId) && user.getRole() == Role.USER) {
            throw new RuntimeException("Cannot create another community. You can't create more than 1 community.");
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
        cm.changeMemberType(MemberType.MODERATOR);
        cr.save(cm); 
        com.addModerator(userId);
        communityRepository.save(com); 
    }

    public void removeModerator(String communityId, String userId) {
        Community com = communityRepository.findById(communityId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        if(com == null || user == null) {
            throw new RuntimeException("Community or User doesn't exist");
        }
        CommunityMembership cm = cr.findByCommunityIdAndUserId(communityId, userId);
        cm.changeMemberType(MemberType.MEMBER);
        cr.save(cm); 
        if(com.getModeratorIds() != null) {
            com.getModeratorIds().remove(userId);
        }
        communityRepository.save(com);
    }

    public void removeMember(String communityId, String userId) {
        Community com = communityRepository.findById(communityId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        if(com == null || user == null) {
            throw new RuntimeException("Community or User doesn't exist");
        }
        if(com.getOwnerId().equals(userId)) {
            throw new RuntimeException("You must transfer ownership of the community before you leave.");
        }
        CommunityMembership cm = cr.findByCommunityIdAndUserId(communityId, userId);
        cr.delete(cm);
        if(com.getModeratorIds().contains(userId)) {
            com.getModeratorIds().remove(userId);
        }
        com.setMemberCount((int) cr.countByCommunityId(communityId));
        communityRepository.save(com);
    }

    public void communityPost(String communityId, String username, String text, MultipartFile media) {
        try{
            Community com = communityRepository.findById(communityId).orElse(null);
            User user = userRepository.findByUsernameIgnoreCase(username);
            if(com == null || user == null) {
                throw new RuntimeException("Community or User doesn't exist");
            }
            Post post = new Post(text, username, communityId, com.getName());
            post.setTag(user.getPlatform());
            if(media!=null){
                post.setmediaType(media.getContentType());
                System.out.println(media.getOriginalFilename());
                String medianame = s3serv.uploadFile(media, username);
                System.out.println("upload successful");
                post.setmedia(medianame);
            }
            postRepository.save(post);
        }catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("000");
        }
    }

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
        if(!userRepository.existsById(userId)) {
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

    // Gets all Members + Mods of a Community
    public List<User> getCommunityAllMembers(String communityId) {
        List<User> users = new ArrayList<>();
        List<CommunityMembership> members = cr.findByCommunityId(communityId);
        for(int i = 0; i < members.size(); i++) {
            users.add(userRepository.findById(members.get(i).getUserId()).orElse(null));
        }
        return users;
    }

    // Transfers ownership to another member
    public void transferOwnership(String communityId, String userId) {
        User user = userRepository.findById(userId).orElse(null);
        Community community = communityRepository.findById(communityId).orElse(null);
        CommunityMembership cMembership = cr.findByCommunityIdAndUserId(communityId, userId); // check if user is in the community
        if(user == null || community == null) {
            throw new RuntimeException("community or user is null; User isn't in the community");
        }

        CommunityMembership cmo = cr.findByCommunityIdAndUserId(communityId, community.getOwnerId());
        cmo.changeMemberType(MemberType.MODERATOR); // makes the current owner a moderator
        cMembership.changeMemberType(MemberType.OWNER); // makes the requested user the new owner
        community.setOwnerId(userId);
        if(!community.getModeratorIds().contains(userId)) {
            community.addModerator(userId);
        }
        cr.save(cMembership);
        cr.save(cmo);
        communityRepository.save(community);
    }
}
