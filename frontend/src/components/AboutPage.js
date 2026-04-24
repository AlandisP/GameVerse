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
      name: "Alandis Patterson",
      linkedin: "https://www.linkedin.com/in/alandis-patterson/",
    },
    {
      name: "Gage Hulbert",
      linkedin: "https://www.linkedin.com/in/gage-hulbert-070b27353/",
    },
    {
      name: "Jamius Cheatham",
      linkedin: "https://www.linkedin.com/in/jamius-cheatham-5743b9215/",
    },
    {
      name: "Quintarius Floyd",
      linkedin: "https://www.linkedin.com/in/quintariusfloyd2/",
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
