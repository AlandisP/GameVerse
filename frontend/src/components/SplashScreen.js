import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Users,
  MessageSquareText,
  Swords,
  Play,
  ExternalLink,
} from "lucide-react";
import logo from "../images/GameVerse_LogoV2.png";
import "./SplashScreen.css";

function SplashScreen() {
  const screenshots = [
    {
      src: "/screenshots/home.png",
      alt: "Home feed screenshot",
      title: "Home Feed",
    },
    {
      src: "/screenshots/explore.png",
      alt: "Explore page screenshot",
      title: "Explore Communities",
    },
    {
      src: "/screenshots/parties.png",
      alt: "Messages screenshot",
      title: "Party Finder",
    },
  ];

  const repoUrl = "https://github.com/SCCapstone/CodeCartel";
  const videoUrl = ""; // Put your final demo embed URL here

  return (
    <div className="landing-page">
      <div className="landing-glow landing-glow-left" />
      <div className="landing-glow landing-glow-right" />

      <header className="hero">
        <nav className="topbar">
          <Link to="/" className="brand">
            <img src={logo} alt="GameVerse logo" />
            <span>GameVerse</span>
          </Link>

          <div className="topbar-links">
            <Link to="/about">About</Link>
            <a href={repoUrl} target="_blank" rel="noreferrer">
              GitHub Repo
            </a>
          </div>
        </nav>

        <div className="hero-content">
          <section className="hero-copy">
            <p className="eyebrow">BUILT FOR GAMERS, BY GAMERS</p>
            <h1>
              Find people to play, build <span>communities</span>, and stay
              connected.
            </h1>
            <p className="hero-text">
              GameVerse brings together posts, communities, party finding,
              messaging, notifications, and profile tools in one place so you
              can spend less time searching and more time playing.
            </p>

            <div className="cta-row">
              <Link to="/login" className="cta primary">
                <span>Login</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/signup" className="cta secondary">
                <span>Sign Up</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </section>

          <section className="hero-panel">
            <div className="video-shell">
              <div className="video-chrome" />
              {videoUrl ? (
                <iframe
                  src={videoUrl}
                  title="Final Demo Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="video-placeholder">
                  <div className="video-icon">
                    <Play size={42} fill="currentColor" />
                  </div>
                  <h3>Final Demo Video</h3>
                  <p>
                    Video coming soon. Replace this box with your final demo
                    embed or a placeholder video link.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </header>

      <main>
        <section className="section">
          <div className="section-heading center">
            <p className="section-label">WHY USE IT?</p>
            <h2>A better way to find your gaming circle.</h2>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon icon-blue">
                <Users size={28} />
              </div>
              <h3>Discover communities</h3>
              <p>
                Join communities based on the games and platforms you actually
                play.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon icon-purple">
                <MessageSquareText size={28} />
              </div>
              <h3>Post and interact</h3>
              <p>
                Share updates, react to posts, and keep up with what your
                friends are doing.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon icon-blue">
                <Swords size={28} />
              </div>
              <h3>Find parties faster</h3>
              <p>
                Search for teammates and build squads without jumping between
                apps.
              </p>
            </article>
          </div>
        </section>

        <section className="section screenshots">
          <div className="section-heading center">
            <p className="section-label">SCREENSHOTS</p>
            <h2>See the app in action.</h2>
          </div>

          <div className="screenshot-grid">
            {screenshots.map((shot) => (
              <figure className="shot-card" key={shot.title}>
                <img src={shot.src} alt={shot.alt} />
                <figcaption>{shot.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="section bottom-cta">
          <div className="bottom-cta-card">
            <div>
              <h2>Ready to build your gaming network?</h2>
              <p>
                Create an account to explore communities, message other players,
                and start posting right away.
              </p>
            </div>

            <div className="cta-row bottom">
              <Link to="/login" className="cta primary">
                <span>Login</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/signup" className="cta secondary">
                <span>Sign Up</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="cta tertiary">
                <span>About</span>
                <ExternalLink size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SplashScreen;
