import React, { useState, useEffect } from 'react';
import StartMenu from './StartMenu';
import Game from './Game';
import GameOver from './GameOver';
import './styles.css'; // Import the CSS file

// Loading Page Component
const LoadingPage = ({ onLoadingComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onLoadingComplete();
    }, 2000); // 2-second loading simulation
    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div className="loading-container">
      <h1 className="loading-title">Geometry Dash</h1>
      <div className="spinner"></div>
      <p className="loading-text">Loading...</p>
    </div>
  );
};

const App = () => {
  const [gameState, setGameState] = useState('loading'); // Start with loading state

  const handleLoadingComplete = () => {
    setGameState('menu');
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {gameState === 'loading' && <LoadingPage onLoadingComplete={handleLoadingComplete} />}
      {gameState === 'menu' && <StartMenu onStart={() => setGameState('playing')} />}
      {gameState === 'playing' && <Game onGameOver={() => setGameState('gameover')} />}
      {gameState === 'gameover' && <GameOver onRestart={() => setGameState('playing')} />}
    </div>
  );
};

export default App;