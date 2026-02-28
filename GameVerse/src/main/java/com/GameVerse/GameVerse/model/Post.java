package com.GameVerse.GameVerse.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.GameVerse.GameVerse.repository.UserRepository;

@Document(collection = "posts")
public class Post {

    
    public class comment {
        public String poster;
        public String content;
        public comment(String poster,String content){
            this.poster = poster;
            this.content = content;
        }
    }

    @Id
    private String id;
    // @Indexed(unique = true)  
    private String text;
    private String userId;
    private String communityId;
    private String tag;
    private int likes;
    private Map<String,Boolean> liked;
    private ArrayList<comment> comments;

    public Post(String text, String userId){
        this.text = text;
        this.userId = userId;
        this.tag = "";
        this.likes = 0;
        liked = new HashMap<String,Boolean>();
        comments = new ArrayList<comment>();
    }

    // public Post(String text, String userId, String communityId){
    //     this.text = text;
    //     this.userId = userId;
    //     this.communityId = communityId;
    //     this.tag = "";
    //     this.likes = 0;
    //     liked = new HashMap<String,Boolean>();
    // }

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
    public void addcomment(String poster, String comment){
        comment newcom = new comment(poster, comment);
        //System.out.println(newcom.content);
        // if(comments == null)
        //     comments = new ArrayList<>();
        comments.add(newcom);
        System.out.println(comments.size());
    }
    public ArrayList<comment> getcomments(){
        if(comments == null)
            comments = new ArrayList<>();
        return comments;
    }

    public void setcomments(ArrayList<comment> comments){
        this.comments = comments;
    }
}
