import React, { useState } from 'react';
import StartMenu from './StartMenu';
import Game from './Game';
import GameOver from './GameOver';

const App = () => {
  const [gameState, setGameState] = useState('menu');

  return (
    <div style={{ textAlign: 'center' }}>
      {gameState === 'menu' && <StartMenu onStart={() => setGameState('playing')} />}
      {gameState === 'playing' && <Game onGameOver={() => setGameState('gameover')} />}
      {gameState === 'gameover' && <GameOver onRestart={() => setGameState('playing')} />}
    </div>
  );
};

export default App;