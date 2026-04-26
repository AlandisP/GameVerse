package com.GameVerse.GameVerse.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "memberships")
// Membership class for communities
public class CommunityMembership {
    @Id
    private String id;
    private String userId;
    private String communityId;
    private MemberType type;

    public CommunityMembership(String userId, String communityId, MemberType type) {
        this.userId = userId;
        this.communityId = communityId;
        this.type = type;
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getCommunityId() {
        return communityId;
    }

    public MemberType getType() {
        return type;
    }

    public void changeMemberType(MemberType type) {
        this.type = type;
    }

    
}
