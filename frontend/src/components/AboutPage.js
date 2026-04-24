import React from "react";
import { Link } from "react-router-dom";
import "./AboutPage.css";

function AboutPage() {
  const team = [
    {
      name: "Joshua Cook",
      linkedin: "https://www.linkedin.com/in/joshua-cook-220a4b290/",
    },
    {
      name: "Allandis Patterson",
    },
    {
      name: "Gage Hulbert",
    },
    {
      name: "Jamius Cheatham",
    },
    {
      name: "Quintarius Floyd",
    },
  ];

  return (
    <div className="about-page">
      <div className="about-card">
        <h1>About GameVerse</h1>
        <p>
          GameVerse is a social gaming platform built to help players find
          communities, share posts, message friends, and organize parties with
          people who play the same games.
        </p>

        <div className="team-list">
          {team.map((person) => (
            <div className="team-member" key={person.name}>
              <h3>{person.name}</h3>
              <a href={person.linkedin} target="_blank" rel="noreferrer">
                LinkedIn Profile
              </a>
            </div>
          ))}
        </div>

        <div className="about-links">
          <a
            href="https://github.com/SCCapstone/CodeCartel"
            target="_blank"
            rel="noreferrer"
            className="about-btn"
          >
            View GitHub Repo
          </a>

          <Link to="/" className="about-btn secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
