import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import GameOver from './GameOver';
import Player from "./assets/player.png";
import Background from './assets/background.jpg';
import Tiles from './assets/dashii_tilesets.png';
import Ground from './assets/ground.png';
import tileJson from './dashii_map.json';
import Jump from './assets/sound fx/Jump.wav';
import Die from './assets/sound fx/Hit_Hurt.wav';
import BGMusic from './assets/sound fx/background.mp3';

const Game = ({ onGameOver }) => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1040,
      height: 580,
      physics: {
        default: 'matter', // Switch to Matter.js
        matter: {
          gravity: { y: 2.5 }, // Match original gravity
          debug: true, // Set to true for debugging physics bodies
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

    let player;
    let speed = 8; // Pixels per second
    let jumpSpeed = 11.5; // Adjust as needed
    let jumpAngle = 6;
    let wasTouchingDown = false;
    let dieSound;

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
      // Background
      const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
      background.setScrollFactor(0);
      background.setScale(1.2);

      // Add sound
      const jumpSound = this.sound.add('jump');
      dieSound = this.sound.add('jump');

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
      player = this.matter.add.sprite(1040 / 4, 424, 'player', null, {
        friction: 0,        // No friction on surfaces
        frictionStatic: 0,  // No static friction
        frictionAir: 0,     // No air resistance
        restitution: 0,
      });
      player.setDisplaySize(50, 50); // Adjust display size
      player.setFriction(0); // Prevent slowing due to friction
      player.isOnGround = false; // Custom flag for ground check
      // player.setMass(10);
      // player.body.restitution = 0;


      // Camera
      this.cameras.main.startFollow(player, true, 1, 1);
      this.cameras.main.setFollowOffset(-this.cameras.main.width / 4, 138);

      // Collision detection for enemies
      this.matter.world.on('collisionstart', (event) => {
        event.pairs.forEach(pair => {
          const { bodyA, bodyB } = pair;
          if ((bodyA === player.body && bodyB.label === 'enemy') ||
              (bodyB === player.body && bodyA.label === 'enemy')) {
            handleCollision();
            console.log("You're dead!");
          }
        });
      });

      // Jump input

      // Space key
      this.input.keyboard.on('keydown-SPACE', () => {
        if (player.isOnGround) {
          jumpSound.play();
          player.setVelocityY(-jumpSpeed); // Jump upward
          player.setAngularVelocity(Phaser.Math.DegToRad(jumpAngle)); // Spin (optional)
        } else {
          console.log("Cannot jump, not on ground");
        }
      });
      
      // Mouth click or touch click
      this.input.on('pointerdown', () => {
        console.log("Pointer clicked");
        if (player.isOnGround) {
          jumpSound.play();
          player.setVelocityY(-jumpSpeed); // Jump upward
          player.setAngularVelocity(Phaser.Math.DegToRad(jumpAngle)); // Spin (optional)
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


      const bgmusic = this.sound.add('bgmusic');
      bgmusic.loop = true;
      bgmusic.play();


    }

    function update() {
      // Check if player is on ground
      player.isOnGround = false;
      this.matter.world.engine.pairs.list.forEach(pair => {
        if (pair.isActive) {
          const { bodyA, bodyB } = pair;
          if ((bodyA === player.body && bodyB.label === 'ground') ||
              (bodyB === player.body && bodyA.label === 'ground')) {
            player.isOnGround = true;
          }
        }
      });

      // Maintain forward movement
      player.setVelocityX(speed);

      

      // Stop spinning when landing (optional)
      let isTouchingDown = player.isOnGround;
      if (!wasTouchingDown && isTouchingDown) {
        player.setAngularVelocity(0); // Stop rotation
        
        // Normalize the angle to be within 0-360 degrees
        let normalizedAngle = player.angle % 360;
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
        player.setAngle(closestAngle);
      
        console.log(`Normalized Angle: ${normalizedAngle}, Closest Angle: ${closestAngle}`);
      }      
    
      wasTouchingDown = isTouchingDown;
      
    }

    function handleCollision() {
      onGameOver();
    }

    return () => {
      gameRef.current.destroy(true);
    };
  }, [onGameOver]);

  return <div id="phaser-game" style={{ width: '800px', height: '600px', margin: '0 auto', position: 'relative' }}>
            <GameOver onRestart={() => setGameState('playing')} />
         </div>;
};

export default Game;