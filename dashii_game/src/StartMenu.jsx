import React from 'react';
import './styles.css';

const StartMenu = ({ onStart }) => {
  return (
    <div className="start-menu-container">
      {/* Background Pattern */}
      <div className="background-pattern"></div>

      {/* Title */}
      <h1 className="start-menu-title">
        <span className="title-main">DASHII</span>
        <span className="title-sub">GAME</span>
      </h1>

      {/* Character Element */}
      <div className="character-element">
        <div className="character-cube"></div>
        <div className="character-trail"></div>
      </div>

      {/* Play Button */}
      <button className="play-button" onClick={onStart}>
        <span className="play-icon">▶</span>
      </button>

      {/* Navigation Buttons */}
      <div className="nav-buttons">
        <button className="nav-button cube-button">
          <span className="cube-icon">⬛</span>
        </button>
        <button className="nav-button settings-button">
          <span className="settings-icon">⚙️</span>
        </button>
      </div>
    </div>
  );
};

export default StartMenu;