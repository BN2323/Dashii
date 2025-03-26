import React from 'react';
import './styles.css'; // Import CSS in StartMenu too if not using a global import

const StartMenu = ({ onStart }) => {
  return (
    <div className="start-menu-container">
      <h1 className="start-menu-title">Geometry Dash Clone</h1>
      <button className="start-button" onClick={onStart}>
        Start
      </button>
    </div>
  );
};

export default StartMenu;