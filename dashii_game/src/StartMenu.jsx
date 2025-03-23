import React from 'react';

const StartMenu = ({ onStart }) => {
  return (
    <div style={{ marginTop: '20%' }}>
      <h1>Geometry Dash Clone</h1>
      <button onClick={onStart} style={{ fontSize: '20px', padding: '10px 20px' }}>
        Start
      </button>
    </div>
  );
};

export default StartMenu;