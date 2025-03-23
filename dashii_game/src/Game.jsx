import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import Player from './assets/player.png';
import Background from './assets/background.jpg'
import Ground from './assets/ground.png'

const Game = ({ onGameOver }) => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
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

    function preload() {
      // Load assets here if you want to replace shapes with images later
      this.load.image('player', Player);
      this.load.image('background', Background);
      this.load.image('ground', Ground);
    }

    function create() {
      // Add ground
      this.add.image(0, 0, 'background').setOrigin(0, 0);
      const grounds = this.add.rectangle(0, 400, 800, 40, 0x4287f5).setOrigin(0, 0);
      this.physics.add.existing(grounds, true);
      this.add.image(0, 400, 'ground').setOrigin(0, 0);


      // Add player (red square)    
      player = this.physics.add.sprite(100, 350, 'player');
      player.setDisplaySize(50, 50);

      // Add collider with ground
      this.physics.add.collider(player, grounds);

      // Jump input (spacebar)
      this.input.keyboard.on('keydown-SPACE', () => {
        if (player.body.touching.down) {
          player.body.setVelocityY(-300); // Jump
          // Start rotation tween
          jumpTween = this.tweens.add({
            targets: player,
            angle: player.angle + 90,
            duration: 2000, // Matches expected jump time
            ease: 'Linear',
          });
        }
      });

      // Initialize obstacle groups
      spikes = this.physics.add.group({ immovable: true });
      platforms = this.physics.add.group({ immovable: true });
      hazards = this.physics.add.group({ immovable: true });

      // Initial obstacle spawn
      spawnObstacles.call(this, 800);

      // Increase difficulty over time
      this.time.addEvent({
        delay: 10000, // Every 10 seconds
        callback: increaseDifficulty,
        callbackScope: this,
        loop: true,
      });

      // Collision detection
      this.physics.add.overlap(player, spikes, handleCollision, null, this);
      this.physics.add.overlap(player, hazards, handleCollision, null, this);
      this.physics.add.collider(player, platforms);
    }

    function update() {
      // Check for just landed
      if (!wasTouchingDown && player.body.touching.down) {
        if (jumpTween && jumpTween.isPlaying()) {
          jumpTween.seek(2000); // Complete rotation on landing
        }
      }

      // Update wasTouchingDown
      wasTouchingDown = player.body.touching.down;

      // Spawn obstacles ahead of the player
      const spawnX = Math.floor((player.x + 800) / 800) * 800;
      if (spawnX > lastSpawnX) {
        spawnObstacles.call(this, spawnX);
        lastSpawnX = spawnX;
      }
    }

    function spawnObstacles(x) {
      // Randomly choose a pattern
      const pattern = Phaser.Math.Between(0, 2);

      if (pattern === 0) {
        // Spike row
        for (let i = 0; i < 3; i++) {
          const spike = spikes.create(x + i * 50, 550, null);
          spike.setDisplaySize(20, 20);
          spike.setTint(0x66ff66); // Light green spikes
        }
      } else if (pattern === 1) {
        // Moving platform
        const platformY = Phaser.Math.Between(300, 500);
        const platform = this.add.rectangle(x + 200, platformY, 100, 20, 0x6666ff); // Blue platform
        this.physics.add.existing(platform);
        platform.body.setImmovable(true);
        platforms.add(platform);
        this.tweens.add({
          targets: platform,
          y: platformY + 100,
          duration: 2000,
          ease: 'Sine.easeInOut',
          repeat: -1,
          yoyo: true,
        });
      } else {
        // Rotating hazard
        const hazard = this.add.rectangle(x + 300, 550, 20, 20, 0xff66ff); // Purple hazard
        this.physics.add.existing(hazard);
        hazard.body.setImmovable(true);
        hazards.add(hazard);
        this.tweens.add({
          targets: hazard,
          angle: 360,
          duration: 1000,
          repeat: -1,
        });
      }
    }

    function increaseDifficulty() {
      difficulty += 1;
      player.body.velocity.x *= 1.1; // Increase speed by 10%
    }

    function handleCollision() {
      onGameOver(); // Trigger game over state
    }

    // Cleanup Phaser instance on unmount
    return () => {
      gameRef.current.destroy(true);
    };
  }, [onGameOver]);

  return <div id="phaser-game" style={{ width: '800px', height: '600px', margin: '0 auto' }} />;
};

export default Game;