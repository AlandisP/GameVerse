package com.GameVerse.GameVerse.model;

import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.Map;

public enum Category {
    ACTION,
    ADVENTURE,
    SHOOTER,
    SPORTS,
    STRATEGY,

    // Party-focused categories
    CASUAL,
    COMPETITIVE,
    RANKED,
    CO_OP,
    MULTIPLAYER,

    // Playstyle / intent
    CHILL,
    BEGINNER_FRIENDLY,
    EXPERIENCED,
    MIC_REQUIRED,
    NO_MIC,

    BATTLE_ROYALE,
    TEAM_BASED,
    DUO,
    SQUAD,
    CUSTOM_LOBBY,

    PLAYSTATION,
    XBOX,
    NINTENDO,
    PC,
    CROSS_PLATFORM,

    PARTY_GAMES,
    ROLEPLAY,
    COMMUNITY,
    EVENTS;

    public static EnumSet<Category> genre = EnumSet.of(ACTION,ADVENTURE,SHOOTER,SPORTS,STRATEGY);
    public static EnumSet<Category> partyfocused = EnumSet.of(CASUAL,COMPETITIVE,RANKED,CO_OP,MULTIPLAYER);
    public static EnumSet<Category> playstyle = EnumSet.of(CHILL,BEGINNER_FRIENDLY,EXPERIENCED,MIC_REQUIRED,NO_MIC);
    public static EnumSet<Category> gamemods = EnumSet.of(BATTLE_ROYALE,TEAM_BASED,DUO,SQUAD,CUSTOM_LOBBY);
    public static EnumSet<Category> social = EnumSet.of(PARTY_GAMES,ROLEPLAY,COMMUNITY,EVENTS);
    public static EnumSet<Category> platforms = EnumSet.of(PLAYSTATION,XBOX,NINTENDO,PC,CROSS_PLATFORM);

    public static Map<String, EnumSet<Category>> grouped() {
        Map<String, EnumSet<Category>> map = new LinkedHashMap<>();
        map.put("genre", genre);
        map.put("partyFocused", partyfocused);
        map.put("playstyle", playstyle);
        map.put("gameModes", gamemods);
        map.put("social", social);
        map.put("platform", platforms);
        return map;
    }

}
