import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import NavBar from "./NavBar";
import Pfp from "../images/Profile.png";
import axios from "axios";
import PostObj from "./Post";
import API_URL from "../config/api";
import clip from "../images/PaperClip.png";
import UploadBox from "./MediaUpload";

const urlprefab =
  "https://gameverse-media-026955879175-us-east-2-an.s3.us-east-2.amazonaws.com/";

function HomePage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const hasValidToken = token && token !== "null" && token !== "undefined";

  const [activeTab, setActiveTab] = useState("General");
  const [platform, setSelectedValue] = useState("");
  const text = useRef(null);
  const maxlen = 300;
  const [postbod, setpostbod] = useState("");
  const [posts, setposts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const [bookmarks, setbooks] = useState([]);
  const [uploadbox, setupload] = useState(false);
  const [uploadedFile, uploadFile] = useState(null);
  const clipico = useRef(null);
  const [imgsrc, setimgsrc] = useState(
    urlprefab + username + "/Profile/ProfilePic",
  );
  const [posting, makingpost] = useState(false);
  const [hasloaded, finishloading] = useState(false);
  const [displaying, setdisplay] = useState(10);

  const authHeaders = hasValidToken ? { Authorization: `Bearer ${token}` } : {};

  const handleAuthFailure = (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      navigate("/login", { replace: true });
    }
    throw error;
  };

  const autoresize = (e) => {
    text.current.style.height = "fit-content";
    text.current.style.height = `${text.current.scrollHeight}px`;
    setpostbod(e.target.value);
  };

  const makepost = async () => {
    if (!hasValidToken) {
      navigate("/login", { replace: true });
      return;
    }

    if ((postbod !== "" || uploadedFile != null) && !posting) {
      try {
        makingpost(true);
        const formdat = new FormData();
        formdat.append("body", postbod);
        formdat.append("media", uploadedFile);

        const pid = await axios.post(`${API_URL}/post/makepost`, formdat, {
          headers: authHeaders,
          timeout: 0,
        });

        const now = new Date().toISOString();
        setposts((posts) => {
          const newArray = [...posts];
          const mediaurl =
            uploadedFile != null ? URL.createObjectURL(uploadedFile) : null;
          const mediatypefile = uploadedFile != null ? uploadedFile.type : "";
          newArray.unshift({
            user: username,
            text: postbod,
            likes: 0,
            liked: {},
            id: pid.data,
            comments: [],
            media: mediaurl,
            mediaType: mediatypefile,
            createdAt: now,
          });
          return newArray;
        });

        uploadFile(null);
        text.current.value = "";
        setpostbod("");
      } catch (error) {
        handleAuthFailure(error);
      } finally {
        makingpost(false);
      }
    }
  };

  const HandleChange = (e) => {
    setSelectedValue(e.target.value);
  };

  const getposts = async () => {
    if (!hasValidToken) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const result = await axios.get(`${API_URL}/post/getposts`, {
        headers: authHeaders,
      });

      const bookmarks = await axios.get(`${API_URL}/post/getbooks`, {
        headers: authHeaders,
      });
      
      setbooks(bookmarks.data);
      setposts(result.data);
      finishloading(true);
    } catch (error) {
      handleAuthFailure(error);
    }
  };

  const getFollowingPosts = async () => {
    if (!hasValidToken) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/post/getFollowingPosts`, {
        headers: authHeaders,
      });
      setFollowingPosts(res.data);
    } catch (error) {
      handleAuthFailure(error);
    }
  };

  const parselike = (postinf) => {
    const array = postinf["liked"];
    const like = array[username];
    return like;
  };

  const bookarray = Array.from(bookmarks);
  const filtered = platform ? posts.filter((p) => p.tag === platform) : posts;
  const filteredfollow = platform
    ? followingPosts.filter((p) => p.tag === platform)
    : followingPosts;

  const GetAllPosts = filtered.map((post, index) => {
    const isbookd = bookarray.includes(post["id"]) ? true : false;
    if(index<displaying){
      return (
        <PostObj
          key={post["id"]}
          User={post["user"]}
          Content={post["text"]}
          Likes={post["likes"]}
          Liked={parselike(post)}
          id={post["id"]}
          commcount={post["comments"].length}
          books={isbookd}
          CreatedAt={post["createdAt"]}
          CommunityName={post["communityName"]}
          media={post["media"]}
          type={post["mediaType"]}
        />
      );
    }
  });

  const GetAllFollowingPosts = filteredfollow.map((post) => {
    const isbookd = bookarray.includes(post["id"]) ? true : false;
    return (
      <PostObj
        key={post["id"]}
        User={post["user"]}
        Content={post["text"]}
        Likes={post["likes"]}
        Liked={parselike(post)}
        id={post["id"]}
        commcount={post["comments"].length}
        books={isbookd}
        CreatedAt={post["createdAt"]}
        CommunityName={post["communityName"]}
        media={post["media"]}
        type={post["mediaType"]}
      />
    );
  });

  useEffect(() => {
    if (!hasValidToken) {
      navigate("/login", { replace: true });
      return;
    }

    getposts();
    getFollowingPosts();
  }, [hasValidToken, navigate]);

  const loadMore = (type)=>{
    if(type==1){
      if(displaying+10<filtered.length){
        setdisplay(displaying+10);
      }else{
        setdisplay(filtered.length);
      }
    }else{
      if(displaying+10<filteredfollow.length){
        setdisplay(displaying+10);
      }else{
        setdisplay(filteredfollow.length);
      }
    }
  }

  return (
    <div className="page-container">
      <NavBar GetPosts={getposts} />
      <div className="main-content">
        <div
          style={{
            borderBottom: "1px solid #000000ff",
            paddingBottom: "10px",
            marginLeft: "-20px",
            paddingLeft: "20px",
          }}
        >
          <h1
            style={{
              color: "white",
              textAlign: "left",
              marginTop: "50px",
              marginLeft: "20px",
              marginBottom: "0",
            }}
          >
            Feed
          </h1>
        </div>
        <div id="Post-Body">
          <div className="tabs">
            {["General", "Following"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setdisplay(10);
                }}
                className={activeTab === tab ? "tabs-sa" : "tabs-s"}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="Post-Bar">
            <img
              className="PFP"
              src={imgsrc}
              onError={() => {
                setimgsrc(Pfp);
              }}
              alt="Profile"
            />
            <textarea
              rows="1"
              cols="50"
              maxLength={maxlen}
              ref={text}
              onChange={autoresize}
              placeholder="What are you thinking?"
            />
            <img
              src={clip}
              className={`clip ${uploadedFile ? "hasfile" : ""}`}
              ref={clipico}
              onClick={() => {
                setupload(true);
              }}
              alt="Upload"
            />
            <button
              className={`Post${posting ? "ing" : ""}`}
              onClick={makepost}
            >
              Post{posting ? "ing..." : ""}
            </button>
          </div>
          <div className="Displaying">
            <h3>Currently Showing</h3>
            <select
              className="filter-drop"
              name="Platform"
              required
              value={platform}
              onChange={HandleChange}
            >
              <option value="">All</option>
              <option value="PS">Playstation</option>
              <option value="PC">PC</option>
              <option value="XB">Xbox</option>
              <option value="NI">Nintendo</option>
            </select>
          </div>
          {hasloaded?
          activeTab === "General" ? (
            <div className="Content">
              <div>{GetAllPosts}</div>
              {displaying<filtered.length?<button className="Load-More" onClick={()=>{loadMore(1)}}>Load More</button>:""}
            </div>
          ) : (
            <div className="Content">
              <div>
                {GetAllFollowingPosts.length > 0 ? (
                  GetAllFollowingPosts
                ) : (
                  <p className="none-yet">
                    There are no posts dedicated to this category😔
                  </p>
                )}
              </div>
              {displaying<filtered.length?<button className="Load-More" onClick={()=>{loadMore(1)}}>Load More</button>:""}
            </div>
          ):<div className="Loading-Notification"><h1>Loading Posts...</h1></div>}
        </div>
      </div>
      {uploadbox ? (
        <UploadBox
          clearvar={setupload}
          fileinf={{ file: uploadedFile, upload: uploadFile }}
        />
      ) : (
        ""
      )}
    </div>
  );
}

export default HomePage;
