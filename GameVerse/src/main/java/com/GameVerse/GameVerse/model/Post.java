package com.GameVerse.GameVerse.model;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.GameVerse.GameVerse.repository.UserRepository;

@Document(collection = "posts")
public class Post {

    
    
    @Id
    private String id;
    // @Indexed(unique = true)  
    private String text;
    private String userId;
    private String tag;
    private int likes;
    private Map<String,Boolean> liked;

    public Post(String text, String userId){
        this.text = text;
        this.userId = userId;
        this.tag = "";
        this.likes = 0;
        liked = new HashMap<String,Boolean>();
    }

    public String getId(){
        return this.id;
    }
    public String getText(){
        return this.text;
    }
    public String getTag(){
        return this.tag;
    }
    public String getUser(){
        return this.userId;
    }
    public void setTag(String t){
        this.tag = t;
    }
    
    public int getLikes(){
        return this.likes;
    }

    public void setLikes(int likes){
        this.likes = likes;
    }

    public Map<String,Boolean> getLiked(){
        return this.liked;
    }

    public void setLiked(Map<String,Boolean> liked){
        this.liked = liked;
    }

    public void setALike(String user){
        if(liked.containsKey(user)){
            boolean boolval = liked.get(user);
            liked.put(user, !boolval);
            if(!boolval){
                likes++;
            }else{
                likes--;
            }
        }else{
            liked.put(user, true);
            likes++;
        }
    }
    public Boolean hasLiked(String user){
        return liked.get(user);
    }
}
