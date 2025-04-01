import React from 'react';
import './gameOverStyle.css';
import ben10 from './assets/ben10.png';

const GameVictory = ({ onRestart, onNextLevel, display, attemp }) => {
  return (
    <div style={{display: display}} className='gameOver'>
      <h1>You Win!</h1>
      <p>Attempt: {attemp}</p>
      <p>Reward: <img src= {ben10} alt="" /></p>
      <div className='Win_Button'>
        <button onClick={onRestart} style={{ fontSize: '20px', padding: '10px 20px' }}>
          Restart
        </button>
        <button onClick={onNextLevel} style={{ fontSize: '20px', padding: '10px 20px' }}>
          Next Level
        </button>
      </div>
    </div>
  );
};

export default GameVictory;