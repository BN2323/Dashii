import React, { useEffect, useRef, useState } from 'react';

// Phaser import
import Phaser from 'phaser';
// import { use } from 'matter';

// State cards import
import GamePause from './GamePause';
import GameVictory from './GameVictory.jsx';
import GameOver from './GameOver';

// Assets import
// Image
import Player from "./assets/player.png";
import Background from './assets/background.jpg';
import Tiles from './assets/dashii_tilesets.png';
import Ground from './assets/ground.png';
//Soundfx
import Jump from './assets/sound fx/lot.wav';
import Die from './assets/sound fx/oy.wav';
import BGMusic from './assets/sound fx/background.mp3';

// Map import
import tileJson from './dashii_map.json';

// Game props
import PIcon from './assets/pause_icon.png'

// Style
import './gameStyle.css';



const Game = () => {
  const gameRef = useRef(null);
  const sceneRef = useRef(null);
  const [goDisplayStat, setgoDisplayStat] = useState('none');
  const [attemp, setAttemp] = useState(0);
  const [gameCurState, setGameCurState] = useState('');

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1040,
      height: 580,
      physics: {
        default: 'matter', // Switch to Matter.js
        matter: {
          gravity: { y: 2.5 }, // Match original gravity
          debug: false, // Set to true for debugging physics bodies
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
      parent: 'phaser-game',
    };

    gameRef.current = new Phaser.Game(config);

    function preload() {
      this.load.image('player', Player);
      this.load.image('background', Background);
      this.load.image('tiles', Tiles);
      this.load.image('ground_tile', Ground);
      this.load.tilemapTiledJSON('map', tileJson);
      this.load.audio('jump', Jump);
      this.load.audio('die', Die);
      this.load.audio('bgmusic', BGMusic);
    }

    function create() {
      sceneRef.current = this;
      this.isGameOver = false;
      this.speed = 8; // Pixels per second
      this.jumpSpeed = 11.5; // Adjust as needed
      this.jumpAngle = 6;
      this.wasTouchingDown = false;
      // Background
      const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
      background.setScrollFactor(0);
      background.setScale(1.2);
      // BG sound track
      this.bgMusic = this.sound.add('bgmusic');
      this.bgMusic.loop = true;
      this.bgMusic.setVolume(0.5);
      this.bgMusic.play();

      // Add sound
      this.jumpSound = this.sound.add('jump');
      this.dieSound = this.sound.add('die');

      this.jumpSound.setVolume(2);
      this.dieSound.setVolume(2);

      // Tilemap
      const map = this.make.tilemap({ key: 'map' });
      const tileset = map.addTilesetImage('dashii_tile', 'tiles');
      const groundTileset = map.addTilesetImage('ground', 'ground_tile');
      this.ground = map.createLayer('ground', [groundTileset, tileset], 0, 0);
      this.enemies = map.createLayer('enemies', tileset, 0, 0);

      // Create ground bodies (static)
      const groundTiles = this.ground.layer.data.flat().filter(tile => tile.properties.collides);
      groundTiles.forEach(tile => {
        const x = tile.x * tile.width + tile.width / 2;
        const y = tile.y * tile.height + tile.height / 2;
        const body = this.matter.add.rectangle(x, y, tile.width, tile.height, { isStatic: true });
        body.label = 'ground';
      });

      // Create enemy bodies (sensors)
      const enemyTiles = this.enemies.layer.data.flat().filter(tile => tile.properties.collides);
      enemyTiles.forEach(tile => {
        const x = tile.x * tile.width + tile.width / 2;
        const y = tile.y * tile.height + tile.height / 2;
        const body = this.matter.add.polygon(x, y + 15, 3, tile.width / 1.9, { isSensor: true, isStatic: true, angle: Phaser.Math.DegToRad(90)});
        body.label = 'enemy';
        // body.setAngle(Phaser.Math.DegToRad(45));
      });

      this.matter.world.createDebugGraphic();


      // Create player
      this.player = this.matter.add.sprite(1040 / 4, 424, 'player', null, {
        friction: 0,        // No friction on surfaces
        frictionStatic: 0,  // No static friction
        frictionAir: 0,     // No air resistance
        restitution: 0,
      });
      this.player.setDisplaySize(50, 50); // Adjust display size
      this.player.setFriction(0); // Prevent slowing due to friction
      this.player.isOnGround = false; // Custom flag for ground check


      // Camera
      this.cameras.main.startFollow(this.player, true, 1, 1);
      this.cameras.main.setFollowOffset(-this.cameras.main.width / 4, 138);

      // Collision detection for enemies
      this.matter.world.on('collisionstart', (event) => {
        event.pairs.forEach(pair => {
          const { bodyA, bodyB } = pair;
          if ((bodyA === this.player.body && bodyB.label === 'enemy') ||
              (bodyB === this.player.body && bodyA.label === 'enemy')) {
            handleCollision();
            console.log(this.player.body.velocity.x);
          }
        });
      });

      // Jump input
      // Space key
      this.input.keyboard.on('keydown-SPACE', () => { 
        if (!this.isGameOver && this.player.isOnGround) {
          this.jumpSound.play();
          this.player.setVelocityY(-this.jumpSpeed); // Jump upward
          this.player.setAngularVelocity(Phaser.Math.DegToRad(this.jumpAngle)); // Spin (optional)
          console.log('jump!');
        } else {
          console.log("Cannot jump, not on ground");
        }
      });
      
      // Mouth click or touch click
      this.input.on('pointerdown', () => {
        console.log("Pointer clicked");
        if (!this.isGameOver && this.player.isOnGround) {
          this.jumpSound.play();
          this.player.setVelocityY(-this.jumpSpeed); // Jump upward
          this.player.setAngularVelocity(Phaser.Math.DegToRad(this.jumpAngle)); // Spin (optional)
        } else {
          console.log("Cannot jump, not on ground");
        }
      });

      // Difficulty timer (unimplemented callback)
      this.time.addEvent({
        delay: 10000,
        // callback: increaseDifficulty,
        callbackScope: this,
        loop: true,
      });
    }

    function update() {
      console.log(this.player.body.velocity.x);
      // Check if player is on ground
      this.player.isOnGround = false;
      this.matter.world.engine.pairs.list.forEach(pair => {
        if (pair.isActive) {
          const { bodyA, bodyB } = pair;
          if ((bodyA === this.player.body && bodyB.label === 'ground') ||
              (bodyB === this.player.body && bodyA.label === 'ground')) {
                this.player.isOnGround = true;
          }
        }
      });

      // Maintain forward movement
      this.player.setVelocityX(this.speed);

      

      // Stop spinning when landing (optional)
      let isTouchingDown = this.player.isOnGround;
      if (!this.wasTouchingDown && isTouchingDown) {
        this.player.setAngularVelocity(0); // Stop rotation
        
        // Normalize the angle to be within 0-360 degrees
        let normalizedAngle = this.player.angle % 360;
        if (normalizedAngle < 0) {
          normalizedAngle += 360; // Handle negative angles
        }
        
        // Flat angles (0°, 90°, 180°, 270°, 360°)
        const flatAngles = [0, 90, 180, 270, 360];
      
        // Calculate the closest angle
        let closestAngle = flatAngles.reduce((prev, curr) => {
          return Math.abs(curr - normalizedAngle) < Math.abs(prev - normalizedAngle) ? curr : prev;
        });
      
        // Set the player's angle to the closest flat angle
        this.player.setAngle(closestAngle);
      
        console.log(`Normalized Angle: ${normalizedAngle}, Closest Angle: ${closestAngle}`);
      }      
    
      this.wasTouchingDown = isTouchingDown;
      
    }

    function handleCollision() {
      if (sceneRef.current.isGameOver) return; // Prevent multiple triggers
      setGameCurState('over');
      sceneRef.current.dieSound.play();
      sceneRef.current.tweens.add({
        targets: sceneRef.current.bgMusic,
        volume: 0,
        duration: 800,
        onComplete: () => {
          sceneRef.current.bgMusic.stop(); // Stop the music completely after fading out
        }
      });
      setgoDisplayStat('block');
      sceneRef.current.isGameOver = true;
      sceneRef.current.speed = 0;
      sceneRef.current.player.setVelocityX(0);
      sceneRef.current.jumpSpeed = 0;
      sceneRef.current.jumpAngle = 0;
      setAttemp(prevAttemp => prevAttemp +  1);
    }

    return () => {
      gameRef.current.destroy(true);
    };
  }, []);

  const handleRestart = () => {
    // Prevent overlaping bg music
    sceneRef.current.bgMusic.stop();
    sceneRef.current.jumpSound.stop();
    sceneRef.current.dieSound.stop();
    setgoDisplayStat('none');
    sceneRef.current.scene.restart()
  };

  const handlePaue = () => {
    setGameCurState('pause');
    setgoDisplayStat('block');
    sceneRef.current.scene.pause()
    
  }
  const handleResume = () => {
    setgoDisplayStat('none');
    sceneRef.current.scene.resume();
  }
  const handleNextLevel = () => {
    setgoDisplayStat('block');
  }

  return <div id="phaser-game" style={{position: 'relative'}}>
              <button onClick={handlePaue} className='pButton' style={{backgroundImage: {PIcon}}}></button>
              {gameCurState === 'pause' && <GamePause onRestart={handleRestart} onResume={handleResume} display={goDisplayStat} />}
              {gameCurState === 'win' && <GameVictory onRestart={handleRestart} onNextLevel={handleNextLevel} display={goDisplayStat} attemp={attemp} />}
              {gameCurState === 'over' && <GameOver onRestart={handleRestart} display={goDisplayStat} attemp={attemp} />}
          </div>
            
};

export default Game;