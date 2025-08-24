'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { CORNPOT_CONFIG, CORNPOT_COLORS, CORNPOT_PHYSICS, ANIMATION_ELEMENTS } from '@/components/utils/cornpotConstants';
import {
  createSack, updateSack, calculateTrajectory, predictTrajectory,
  checkPotCollision, createParticle, updateParticle, createTrajectoryDot, updateTrajectoryDot
} from '@/components/utils/cornpotPhysics';
import { createBird, createCloud, createGrassBlades, drawBird, drawCloud, drawGrassBlades, updateBird, updateCloud, updateGrassBlades } from '@/components/utils/animateElements';

const Cornpot = () => {
  // Game state
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [round, setRound] = useState(1);
  const [gameActive, setGameActive] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const gameStateRef = useRef({
    currentSack: null as any,
    particles: [] as any[],
    trajectoryDots: [] as any[],
    trails: [] as any[],
    charging: false,
    power: 0,
    trajectoryLine: null as any,
    lastTime: 0,
    launchPad: { x: 150, y: CORNPOT_CONFIG.CANVAS_HEIGHT - 150 },
    potTarget: { 
      x: CORNPOT_CONFIG.CANVAS_WIDTH - 250, 
      y: CORNPOT_CONFIG.CANVAS_HEIGHT - 200, 
      width: CORNPOT_CONFIG.POT_WIDTH, 
      height: CORNPOT_CONFIG.POT_HEIGHT 
    },
    animationElements: {
        birds: [] as any[],
        clouds: [] as any[],
        grassBlades: [] as any[],
        lastBirdSpawn: 0,
        lastCloudSpawn: 0
      }
  });

  // Score refs for consistent updates
  const score1Ref = useRef(0);
  const score2Ref = useRef(0);

  useEffect(() => {
    score1Ref.current = score1;
    score2Ref.current = score2;
  }, [score1, score2]);

  // Create new sack
  const createNewSack = useCallback(() => {
    gameStateRef.current.currentSack = createSack(gameStateRef.current.launchPad);
  }, []);

  // Handle mouse down
  const handleMouseDown = useCallback(() => {
    if (!gameActive) return;
    
    gameStateRef.current.charging = true;
    gameStateRef.current.power = 0;
    
    if (!gameStateRef.current.currentSack) {
      createNewSack();
    }
  }, [gameActive, createNewSack]);

  // Handle mouse move
  const handleMouseMove = useCallback((event: any) => {
    if (!gameStateRef.current.charging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Update trajectory line
    const dx = mouseX - gameStateRef.current.launchPad.x;
    const dy = gameStateRef.current.launchPad.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    gameStateRef.current.trajectoryLine = {
      startX: gameStateRef.current.launchPad.x,
      startY: gameStateRef.current.launchPad.y,
      length: Math.min(distance * 1.5, 400),
      angle,
      pulseTime: 0
    };
    
    // Update trajectory dots
    const { velocityX, velocityY } = calculateTrajectory(mouseX, mouseY, gameStateRef.current.launchPad, gameStateRef.current.power);
    const trajectoryPoints = predictTrajectory(
      gameStateRef.current.launchPad.x, 
      gameStateRef.current.launchPad.y, 
      velocityX, 
      velocityY, 
      CORNPOT_CONFIG.CANVAS_HEIGHT
    );
    
    gameStateRef.current.trajectoryDots = trajectoryPoints.map(point => 
      createTrajectoryDot(point.x, point.y, point.index)
    );
  }, []);

  // Handle mouse up
  const handleMouseUp = useCallback((event: any) => {
    if (!gameActive || !gameStateRef.current.charging) return;
    
    gameStateRef.current.charging = false;
    gameStateRef.current.trajectoryLine = null;
    gameStateRef.current.trajectoryDots = [];
    
    if (gameStateRef.current.currentSack) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      const { velocityX, velocityY } = calculateTrajectory(mouseX, mouseY, gameStateRef.current.launchPad, gameStateRef.current.power);
      
      gameStateRef.current.currentSack.vx = velocityX;
      gameStateRef.current.currentSack.vy = velocityY;
    }
  }, [gameActive]);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!canvasRef.current) return;
  
    const ctx = canvasRef.current.getContext('2d') as CanvasRenderingContext2D;
    const deltaTime = currentTime - gameStateRef.current.lastTime;
    gameStateRef.current.lastTime = currentTime;
  
    // Clear canvas
    ctx.clearRect(0, 0, CORNPOT_CONFIG.CANVAS_WIDTH, CORNPOT_CONFIG.CANVAS_HEIGHT);
  
    // Draw background
    drawBackground(ctx);
  
    // ALWAYS UPDATE AND DRAW ANIMATION ELEMENTS (MOVED UP HERE)
    const currentTime2 = Date.now();
  
    // Spawn birds periodically
    if (currentTime2 - gameStateRef.current.animationElements.lastBirdSpawn > ANIMATION_ELEMENTS.BIRDS.SPAWN_INTERVAL) {
      if (Math.random() < 0.7) {
        gameStateRef.current.animationElements.birds.push(createBird(CORNPOT_CONFIG.CANVAS_WIDTH, CORNPOT_CONFIG.CANVAS_HEIGHT));
        gameStateRef.current.animationElements.lastBirdSpawn = currentTime2;
      }
    }
  
    // Spawn clouds less frequently
    if (currentTime2 - gameStateRef.current.animationElements.lastCloudSpawn > 15000 && gameStateRef.current.animationElements.clouds.length < 3) {
      gameStateRef.current.animationElements.clouds.push(createCloud(CORNPOT_CONFIG.CANVAS_WIDTH, CORNPOT_CONFIG.CANVAS_HEIGHT));
      gameStateRef.current.animationElements.lastCloudSpawn = currentTime2;
    }
  
    // Update and draw clouds (behind everything)
    gameStateRef.current.animationElements.clouds = gameStateRef.current.animationElements.clouds.filter(cloud => {
      const alive = updateCloud(cloud, deltaTime, CORNPOT_CONFIG.CANVAS_WIDTH);
      if (alive) drawCloud(ctx, cloud);
      return alive;
    });
  
    // Update and draw birds
    gameStateRef.current.animationElements.birds = gameStateRef.current.animationElements.birds.filter(bird => {
      const alive = updateBird(bird, deltaTime, CORNPOT_CONFIG.CANVAS_WIDTH);
      if (alive) drawBird(ctx, bird);
      return alive;
    });
  
    // Draw game elements (platform, pot)
    drawGameElements(ctx);
  
    // Update and draw grass (on top of ground)
    updateGrassBlades(gameStateRef.current.animationElements.grassBlades, deltaTime);
    drawGrassBlades(ctx, gameStateRef.current.animationElements.grassBlades);
  
    // Draw UI
    drawUI(ctx);
  
    // Update power when charging
    if (gameStateRef.current.charging) {
      gameStateRef.current.power += deltaTime * 0.12;
      if (gameStateRef.current.power > 100) gameStateRef.current.power = 0;
    }
  
    // Update trajectory line
    if (gameStateRef.current.trajectoryLine) {
      gameStateRef.current.trajectoryLine.pulseTime += deltaTime * 0.001;
      drawTrajectoryLine(ctx, gameStateRef.current.trajectoryLine);
    }
  
    // Update and draw trajectory dots
    gameStateRef.current.trajectoryDots = gameStateRef.current.trajectoryDots.filter(dot => {
      const alive = updateTrajectoryDot(dot, deltaTime);
      if (alive) drawTrajectoryDot(ctx, dot);
      return alive;
    });
  
    // Update sack (only when it's moving)
    if (gameStateRef.current.currentSack && gameStateRef.current.currentSack.vx !== 0) {
      gameStateRef.current.currentSack = updateSack(gameStateRef.current.currentSack, deltaTime);
      
      // Create trail
      gameStateRef.current.currentSack.trailTimer += deltaTime * 0.001;
      if (gameStateRef.current.currentSack.trailTimer > CORNPOT_PHYSICS.TRAIL_INTERVAL) {
        gameStateRef.current.trails.push({
          x: gameStateRef.current.currentSack.x,
          y: gameStateRef.current.currentSack.y,
          life: CORNPOT_PHYSICS.TRAIL_LIFE,
          maxLife: CORNPOT_PHYSICS.TRAIL_LIFE
        });
        gameStateRef.current.currentSack.trailTimer = 0;
      }
      
      // Check collisions
      if (checkPotCollision(gameStateRef.current.currentSack, gameStateRef.current.potTarget)) {
        // Success!
        for (let i = 0; i < 15; i++) {
          gameStateRef.current.particles.push(createParticle(gameStateRef.current.currentSack.x, gameStateRef.current.currentSack.y, 'success'));
        }
        
        // Score point
        if (currentPlayer === 1) {
          const newScore = score1Ref.current + 1;
          setScore1(newScore);
          score1Ref.current = newScore;
        } else {
          const newScore = score2Ref.current + 1;
          setScore2(newScore);
          score2Ref.current = newScore;
        }
        
        gameStateRef.current.currentSack = null;
        nextTurn();
      } else if (
        gameStateRef.current.currentSack.y >= CORNPOT_CONFIG.CANVAS_HEIGHT - 60 ||
        gameStateRef.current.currentSack.x < -100 || 
        gameStateRef.current.currentSack.x > CORNPOT_CONFIG.CANVAS_WIDTH + 100
      ) {
        // Miss - ground or off-screen
        if (gameStateRef.current.currentSack.y >= CORNPOT_CONFIG.CANVAS_HEIGHT - 60) {
          for (let i = 0; i < 10; i++) {
            gameStateRef.current.particles.push(createParticle(gameStateRef.current.currentSack.x, gameStateRef.current.currentSack.y, 'ground'));
          }
        }
        
        gameStateRef.current.currentSack = null;
        nextTurn();
      }
    }
  
    // Draw sack (always draw if it exists)
    if (gameStateRef.current.currentSack) {
      drawSack(ctx, gameStateRef.current.currentSack);
    }
  
    // Update and draw trails
    gameStateRef.current.trails = gameStateRef.current.trails.filter(trail => {
      trail.life -= deltaTime * 0.001;
      if (trail.life > 0) {
        drawTrail(ctx, trail);
        return true;
      }
      return false;
    });
  
    // Update and draw particles
    gameStateRef.current.particles = gameStateRef.current.particles.filter(particle => {
      const alive = updateParticle(particle, deltaTime);
      if (alive) drawParticle(ctx, particle);
      return alive;
    });
  
    // Draw power meter when charging
    if (gameStateRef.current.charging) {
      drawPowerMeter(ctx);
    }
  
    // ALWAYS continue the animation loop regardless of game state
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameActive, currentPlayer]);

  // Next turn logic
  const nextTurn = () => {
    const nextPlayer = currentPlayer === 1 ? 2 : 1;
    setCurrentPlayer(nextPlayer);
    
    if (nextPlayer === 1) {
      const nextRound = round + 1;
      setRound(nextRound);
      
      if (nextRound > CORNPOT_CONFIG.MAX_ROUNDS) {
        endGame();
        return;
      }
    }
    
    gameStateRef.current.power = 0;
    createNewSack();
  };

  // End game
  const endGame = () => {
    setGameActive(false);
    
    let gameWinner;
    if (score1 > score2) {
      gameWinner = "Player 1";
    } else if (score2 > score1) {
      gameWinner = "Player 2";
    } else {
      gameWinner = "It's a Tie";
    }
    
    setWinner(gameWinner);
  };

  const drawBasketPlatform = (ctx: any) => {
    const { launchPad } = gameStateRef.current;
    const basketX = launchPad.x;
    const basketY = launchPad.y;
    const basketWidth = 120;
    const basketHeight = 35;
    
    ctx.save();
    
    // Basket rim (top edge)
    ctx.fillStyle = '#654321';
    ctx.fillRect(basketX - basketWidth/2 - 4, basketY - 4, basketWidth + 8, ANIMATION_ELEMENTS.BASKET.RIM_THICKNESS);
    
    // Basket body
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(basketX - basketWidth/2, basketY, basketWidth, basketHeight);
    
    // Weave pattern (horizontal lines)
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (let i = 1; i < ANIMATION_ELEMENTS.BASKET.WEAVE_LINES; i++) {
      const y = basketY + (basketHeight / ANIMATION_ELEMENTS.BASKET.WEAVE_LINES) * i;
      ctx.beginPath();
      ctx.moveTo(basketX - basketWidth/2, y);
      ctx.lineTo(basketX + basketWidth/2, y);
      ctx.stroke();
    }
    
    // Weave pattern (vertical lines)
    for (let i = 1; i < 8; i++) {
      const x = basketX - basketWidth/2 + (basketWidth / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, basketY);
      ctx.lineTo(x, basketY + basketHeight);
      ctx.stroke();
    }
    
    // Basket handles
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = ANIMATION_ELEMENTS.BASKET.HANDLE_WIDTH;
    ctx.lineCap = 'round';
    
    // Left handle
    ctx.beginPath();
    ctx.arc(basketX - basketWidth/2 - 15, basketY + basketHeight/2, 12, Math.PI * 0.7, Math.PI * 1.3);
    ctx.stroke();
    
    // Right handle
    ctx.beginPath();
    ctx.arc(basketX + basketWidth/2 + 15, basketY + basketHeight/2, 12, Math.PI * 1.7, Math.PI * 0.3);
    ctx.stroke();
    
    // Shadow under basket
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(basketX - basketWidth/2 + 5, basketY + basketHeight, basketWidth - 10, 8);
    
    ctx.restore();
  };

  // Restart game
  const restartGame = () => {
    setCurrentPlayer(1);
    setScore1(0);
    setScore2(0);
    setRound(1);
    setGameActive(true);
    setWinner(null);
    
    score1Ref.current = 0;
    score2Ref.current = 0;
    
    gameStateRef.current.currentSack = null;
    gameStateRef.current.particles = [];
    gameStateRef.current.trajectoryDots = [];
    gameStateRef.current.trails = [];
    gameStateRef.current.charging = false;
    gameStateRef.current.power = 0;
    gameStateRef.current.trajectoryLine = null;
    
    createNewSack();
  };

  // Drawing functions
  const drawBackground = (ctx: any) => {
    // Sky
    ctx.fillStyle = CORNPOT_COLORS.SKY;
    ctx.fillRect(0, 0, CORNPOT_CONFIG.CANVAS_WIDTH, CORNPOT_CONFIG.CANVAS_HEIGHT * 0.7);
    
    // Ground
    ctx.fillStyle = CORNPOT_COLORS.GROUND;
    ctx.fillRect(0, CORNPOT_CONFIG.CANVAS_HEIGHT * 0.7, CORNPOT_CONFIG.CANVAS_WIDTH, CORNPOT_CONFIG.CANVAS_HEIGHT * 0.3);
  };

  const drawGameElements = (ctx: any) => {
    const { launchPad, potTarget } = gameStateRef.current;

    // Draw basket platform instead of simple rectangle
    drawBasketPlatform(ctx);
    
    // Launch platform
    ctx.fillStyle = CORNPOT_COLORS.PLATFORM;
    ctx.fillRect(launchPad.x - 60, launchPad.y, 120, 25);
    
    // Pot
    ctx.fillStyle = CORNPOT_COLORS.POT;
    ctx.fillRect(potTarget.x - potTarget.width/2, potTarget.y - potTarget.height/2, potTarget.width, potTarget.height);
    
    // Pot rim
    ctx.fillStyle = CORNPOT_COLORS.POT_RIM;
    ctx.fillRect(potTarget.x - (potTarget.width + 20)/2, potTarget.y - potTarget.height/2 - 10, potTarget.width + 20, 20);
  };

  const drawSack = (ctx: any, sack: any) => {
    ctx.save();
    ctx.translate(sack.x, sack.y);
    ctx.rotate((sack.rotation * Math.PI) / 180);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(2, 2, CORNPOT_CONFIG.SACK_SIZE, 0, Math.PI * 2);
    ctx.fill();
    
    // Sack body
    ctx.fillStyle = CORNPOT_COLORS.SACK;
    ctx.beginPath();
    ctx.arc(0, 0, CORNPOT_CONFIG.SACK_SIZE, 0, Math.PI * 2);
    ctx.fill();
    
    // Tie
    ctx.fillStyle = CORNPOT_COLORS.SACK_TIE;
    ctx.fillRect(-5, -CORNPOT_CONFIG.SACK_SIZE - 6, 10, 6);
    
    ctx.restore();
  };

  const drawTrajectoryLine = (ctx: any, line: any   ) => {
    const alpha = 0.7 + Math.sin(line.pulseTime * 8) * 0.3;
    
    ctx.save();
    ctx.translate(line.startX, line.startY);
    ctx.rotate(line.angle);
    
    ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
    ctx.fillRect(0, -3, line.length, 6);
    
    ctx.restore();
  };

  const drawTrajectoryDot = (ctx: any, dot: any) => {
    ctx.fillStyle = `rgba(255, 255, 0, ${dot.opacity})`;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawTrail = (ctx: any, trail: any) => {
    const alpha = trail.life / trail.maxLife;
    const scale = alpha;
    
    ctx.fillStyle = `rgba(245, 222, 179, ${alpha * 0.7})`;
    ctx.beginPath();
    ctx.arc(trail.x, trail.y, 8 * scale, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawParticle = (ctx: any, particle: any) => {
    const alpha = particle.life / particle.maxLife;
    ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPowerMeter = (ctx: any) => {
    const x = CORNPOT_CONFIG.CANVAS_WIDTH / 2 - 125;
    const y = CORNPOT_CONFIG.CANVAS_HEIGHT - 80;
    const width = 250;
    const height = 25;
    
    // Background
    ctx.fillStyle = CORNPOT_COLORS.POWER_BG;
    ctx.fillRect(x, y, width, height);
    
    // Power bar
    const powerWidth = (gameStateRef.current.power / 100) * (width - 4);
    const hue = (gameStateRef.current.power / 100) * 120; // Green to red
    ctx.fillStyle = `hsl(${120 - hue}, 100%, 50%)`;
    ctx.fillRect(x + 2, y + 2, powerWidth, height - 4);
  };

  const drawUI = (ctx: any) => {
    // UI background
    ctx.fillStyle = CORNPOT_COLORS.UI_BG;
    ctx.fillRect(20, 20, 300, 150);
    
    ctx.fillStyle = 'white';
    ctx.font = '28px Arial';
    ctx.fillText(`Player ${currentPlayer}'s Turn`, 40, 50);
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`Player 1: ${score1}`, 40, 85);
    ctx.fillText(`Player 2: ${score2}`, 40, 115);
    ctx.fillText(`Round: ${round}/${CORNPOT_CONFIG.MAX_ROUNDS}`, 40, 145);
    
    // Instructions
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click and hold to aim, release to throw!', CORNPOT_CONFIG.CANVAS_WIDTH / 2, CORNPOT_CONFIG.CANVAS_HEIGHT - 40);
    ctx.textAlign = 'left';
  };

  // Initialize game
  useEffect(() => {

     // Initialize animation elements
  gameStateRef.current.animationElements.grassBlades = createGrassBlades(
    CORNPOT_CONFIG.CANVAS_WIDTH, 
    CORNPOT_CONFIG.CANVAS_HEIGHT
  );
  
  // Spawn initial clouds
  for (let i = 0; i < 2; i++) {
    const cloud = createCloud(CORNPOT_CONFIG.CANVAS_WIDTH, CORNPOT_CONFIG.CANVAS_HEIGHT);
    cloud.x = Math.random() * CORNPOT_CONFIG.CANVAS_WIDTH;
    gameStateRef.current.animationElements.clouds.push(cloud);
  }

    createNewSack();
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop, createNewSack]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <canvas
        ref={canvasRef}
        width={CORNPOT_CONFIG.CANVAS_WIDTH}
        height={CORNPOT_CONFIG.CANVAS_HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="border-2 border-gray-600 rounded-lg cursor-crosshair"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      {winner && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          style={{ display: 'flex' }}
        >
          <div className="text-center text-white bg-gray-800 p-8 rounded-xl border-4 border-yellow-400">
            <h1 className="text-6xl mb-4 text-yellow-400">🎉 {winner} Wins! 🎉</h1>
            <p className="text-3xl mb-6">Final Score: {score1} - {score2}</p>
            <button
              onClick={restartGame}
              className="px-12 py-6 text-2xl bg-green-500 hover:bg-green-600 rounded-lg font-bold transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cornpot;