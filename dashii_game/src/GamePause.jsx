import React from 'react';
import './gameOverStyle.css';

const GameWin = ({ onRestart, onResume, display }) => {
  return (
    <div style={{display: display}} className='gameOver'>
      <h1>Game Paused</h1>
      <div className='Win_Button'>
        <button onClick={onResume} style={{ fontSize: '20px', padding: '10px 20px' }}>
          Restart
        </button>
        <button onClick={onRestart} style={{ fontSize: '20px', padding: '10px 20px' }}>
          Next Level
        </button>
      </div>
    </div>
  );
};

export default GameOver;