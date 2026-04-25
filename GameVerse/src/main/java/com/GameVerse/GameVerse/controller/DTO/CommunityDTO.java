package com.GameVerse.GameVerse.controller.DTO;

import com.GameVerse.GameVerse.model.Community;

public class CommunityDTO {
    private Community community;
    private boolean isMember;

    public CommunityDTO(Community community, boolean isMember) {
        this.community = community;
        this.isMember = isMember;
    }

    // getters
    public Community getCommunity() { return community; }
    public boolean isMember() { return isMember; }
}