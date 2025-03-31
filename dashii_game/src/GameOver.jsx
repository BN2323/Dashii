import React from 'react';
import './gameOverStyle.css';

const GameOver = ({ onRestart, display, attemp }) => {
  return (
    <div style={{display: display}} className='gameOver'>
      <h1>Game Over</h1>
      <p>Attempt: {attemp}</p>
      <button onClick={onRestart} style={{ fontSize: '20px', padding: '10px 20px' }}>
        Restart
      </button>
    </div>
  );
};

export default GameOver;