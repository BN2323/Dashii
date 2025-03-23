import React from 'react';

const GameOver = ({ onRestart }) => {
  return (
    <div style={{ marginTop: '20%' }}>
      <h1>Game Over</h1>
      <button onClick={onRestart} style={{ fontSize: '20px', padding: '10px 20px' }}>
        Restart
      </button>
    </div>
  );
};

export default GameOver;