import React from 'react';
import './gameOverStyle.css';

const GamePause = ({ onRestart, onResume, display }) => {
  return (
    <div style={{display: display}} className='gameOver'>
      <h1>Game Paused</h1>
      <div className='Win_Button'>
        <button onClick={onResume} style={{ fontSize: '20px', padding: '10px 20px' }}>
          Resume
        </button>
        <button onClick={onRestart} style={{ fontSize: '20px', padding: '10px 20px' }}>
          Restart
        </button>
      </div>
    </div>
  );
};

export default GamePause;