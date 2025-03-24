import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import Player from "./assets/player.png";
import Background from './assets/background.jpg';
import Tiles from './assets/dashii_tilesets.png';
import Ground from './assets/ground.png';
import tileJson from './dashii_map.json';

const Game = ({ onGameOver }) => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1040,
      height: 580,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 500 },
          debug: false,
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
    let spikes;
    let platforms;
    let hazards;
    let lastSpawnX = 800;
    let difficulty = 0;
    let wasTouchingDown = false;
    let jumpTween = null;
    let jumpSpeed = 400;

    function preload() {
      this.load.image('player', Player);
      this.load.image('background', Background);
      this.load.image('tiles', Tiles);
      this.load.image('ground_tile', Ground);
      this.load.tilemapTiledJSON('map', tileJson);
    }

    function create() {
      const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
      // set the background to be fixed in one place
      background.setScrollFactor(0);
      background.setScale(1.2);

      // Initiallize the map tile
      const map = this.make.tilemap({ key: 'map'});

      // ✅ Fix: Use correct tileset names as defined in the JSON
      const tileset = map.addTilesetImage('dashii_tile', 'tiles');
      const groundTileset = map.addTilesetImage('ground', 'ground_tile');

      // ✅ Fix: Use correct layer names as in JSON
      const ground = map.createLayer('ground', [groundTileset, tileset]);
      const enemies = map.createLayer('enimies', tileset);
      
      ground.setCollisionByProperty({ collides: true });
      enemies.setCollisionByProperty({ collides: true });
      ground.setPosition(0, -600);
      // ground.body.setOffset(0, -600);
      enemies.setPosition(0, -600);
      // enemies.body.setOffset(0, -600);
      
      // ✅ Fix: Enable collision for ground
      

      player = this.physics.add.sprite(260, 390, 'player');
      player.setDisplaySize(50, 50);
      player.body.setCollideWorldBounds(true);
      this.cameras.main.startFollow(player, true, 1, 0);
      this.cameras.main.setFollowOffset(-this.cameras.main.width / 4, 0);
      player.setVelocityX(200);

      // ✅ Fix: Use `ground` instead of `grounds` (which was undefined)
      this.physics.add.collider(player, ground);
      this.physics.add.collider(player, enemies);
      this.physics.world.drawDebug = true;
      this.physics.world.debugGraphic = this.add.graphics();
      const debugGraphics = this.add.graphics().setAlpha(0.75);
      this.map.renderDebug(debugGraphics, {
          tileColor: null,        // Non-colliding tiles (set to null to ignore)
          collidingTileColor: new Phaser.Display.Color(255, 0, 0, 255), // Red for colliding tiles
          faceColor: new Phaser.Display.Color(0, 255, 0, 255) // Green for collision edges
      });

      this.physics.add.collider(player, this.groundLayer, () => {
        console.log("Collision detected!");
      });

      this.input.keyboard.on('keydown-SPACE', () => {
        if (player.body.touching.down) {
          player.body.setVelocityY(-jumpSpeed);
          jumpTween = this.tweens.add({
            targets: player,
            angle: player.angle + 90,
            duration: 2000,
            ease: 'Linear',
          });
        }
      });

      this.time.addEvent({
        delay: 10000,
        // callback: increaseDifficulty,
        callbackScope: this,
        loop: true,
      });
    }

    function update() {
      if (!wasTouchingDown && player.body.touching.down) {
        if (jumpTween && jumpTween.isPlaying()) {
          jumpTween.seek(2000);
        }
      }
    }

    function handleCollision() {
      onGameOver();
    }

    return () => {
      gameRef.current.destroy(true);
    };
  }, [onGameOver]);

  return <div id="phaser-game" style={{ width: '800px', height: '600px', margin: '0 auto' }} />;
};

export default Game;
