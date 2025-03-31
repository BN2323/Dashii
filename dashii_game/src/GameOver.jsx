import React from 'react';
import './gameOverStyle.css';

const GameOver = ({ onRestart }) => {
  return (
    <div style={{ marginTop: '20%' }} className='gameOver'>
      <h1>Game Over</h1>
      <button onClick={onRestart} style={{ fontSize: '20px', padding: '10px 20px' }}>
        Restart
      </button>
    </div>
  );
};

export default GameOver;