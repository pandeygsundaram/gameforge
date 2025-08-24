import { CORNPOT_CONFIG, CORNPOT_PHYSICS } from './cornpotConstants';

export const random = (min: number, max: number) => Math.random() * (max - min) + min;

export const createSack = (launchPad: any) => ({
  x: launchPad.x,
  y: launchPad.y,
  vx: 0,
  vy: 0,
  rotation: 0,
  trailTimer: 0,
  visible: true
});

export const updateSack = (sack: any, deltaTime: number) => {
  // Apply gravity
  sack.vy += CORNPOT_PHYSICS.GRAVITY * deltaTime * 0.001;
  
  // Update position
  sack.x += sack.vx * deltaTime * 0.001;
  sack.y += sack.vy * deltaTime * 0.001;
  
  // Update rotation
  sack.rotation += 180 * deltaTime * 0.001;
  
  return sack;
};

export const createTrajectoryDot = (x: number, y: number, index: number) => ({
  x,
  y,
  opacity: Math.max(0.2, 1 - index * 0.02),
  life: 0.2 + index * 0.01
});

export const updateTrajectoryDot = (dot: any, deltaTime: number) => {
  dot.life -= deltaTime * 0.001;
  return dot.life > 0;
};

export const calculateTrajectory = (mouseX: number, mouseY: number, launchPad: any, power: number) => {
  const dx = mouseX - launchPad.x;
  const dy = launchPad.y - mouseY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  const velocityMultiplier = (power / 100) * CORNPOT_PHYSICS.MAX_POWER + CORNPOT_PHYSICS.MIN_POWER;
  const velocityX = (dx / distance) * velocityMultiplier * CORNPOT_PHYSICS.VELOCITY_MULTIPLIER;
  const velocityY = (dy / distance) * velocityMultiplier * CORNPOT_PHYSICS.VELOCITY_MULTIPLIER;
  
  return { velocityX, velocityY };
};

export const predictTrajectory = (startX: number, startY: number, vx: number, vy: number, canvasHeight: number) => {
  const points = [];
  let x = startX;
  let y = startY;
  let velocityX = vx;
  let velocityY = vy;
  const gravity = CORNPOT_PHYSICS.GRAVITY;
  
  for (let i = 0; i < 50; i++) {
    if (i % 3 === 0 && y < canvasHeight - 50) {
      points.push({ x, y, index: i / 3 });
    }
    
    velocityY += gravity * 0.016; // Simulate 60fps
    x += velocityX * 0.016;
    y += velocityY * 0.016;
    
    if (y >= canvasHeight - 50 || x > canvasHeight + 100) break;
  }
  
  return points;
};

export const checkPotCollision = (sack: any, potTarget: any) => {
  return (
    sack.x >= potTarget.x - potTarget.width / 2 - 10 &&
    sack.x <= potTarget.x + potTarget.width / 2 + 10 &&
    sack.y >= potTarget.y - potTarget.height / 2 - 10 &&
    sack.y <= potTarget.y + potTarget.height / 2 + 10
  );
};

export const createParticle = (x: number, y: number, type = 'success') => {
  const colors = type === 'success' 
    ? { r: 0, g: 255, b: 0 }
    : { r: 139, g: 69, b: 19 };
    
  return {
    x: x + random(-20, 20),
    y: y + random(-20, 20),
    vx: random(-150, 150),
    vy: random(type === 'success' ? -200 : -50, type === 'success' ? -50 : 10),
    life: random(0.5, type === 'success' ? 1.2 : 0.8),
    maxLife: random(0.5, type === 'success' ? 1.2 : 0.8),
    size: random(type === 'success' ? 4 : 3, type === 'success' ? 8 : 6),
    color: colors,
    gravity: 200
  };
};

export const updateParticle = (particle: any, deltaTime: number) => {
  particle.x += particle.vx * deltaTime * 0.001;
  particle.y += particle.vy * deltaTime * 0.001;
  particle.vy += particle.gravity * deltaTime * 0.001;
  particle.life -= deltaTime * 0.001;
  return particle.life > 0;
};