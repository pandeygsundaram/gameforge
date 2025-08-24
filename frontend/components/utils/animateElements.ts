import { ANIMATION_ELEMENTS } from '@/components/utils/cornpotConstants';

// Bird system
export const createBird = (canvasWidth: number, canvasHeight: number) => ({
  x: -50,
  y: Math.random() * (ANIMATION_ELEMENTS.BIRDS.HEIGHT.max - ANIMATION_ELEMENTS.BIRDS.HEIGHT.min) + ANIMATION_ELEMENTS.BIRDS.HEIGHT.min,
  speed: Math.random() * (ANIMATION_ELEMENTS.BIRDS.SPEED.max - ANIMATION_ELEMENTS.BIRDS.SPEED.min) + ANIMATION_ELEMENTS.BIRDS.SPEED.min,
  wingPhase: Math.random() * Math.PI * 2,
  wingSpeed: 8 + Math.random() * 4,
  size: ANIMATION_ELEMENTS.BIRDS.SIZE + Math.random() * 4
});

export const updateBird = (bird: any, deltaTime: number, canvasWidth: number) => {
  bird.x += bird.speed * deltaTime * 0.001;
  bird.wingPhase += bird.wingSpeed * deltaTime * 0.001;
  return bird.x < canvasWidth + 100; // Remove when off screen
};

export const drawBird = (ctx: any, bird: any) => {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  
  const wingFlap = Math.sin(bird.wingPhase) * 0.5 + 0.5;
  
  // Bird body
  ctx.fillStyle = '#333333';
  ctx.beginPath();
  ctx.ellipse(0, 0, bird.size * 0.8, bird.size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Wings
  ctx.fillStyle = '#555555';
  const wingSpread = wingFlap * 0.8 + 0.2;
  
  // Left wing
  ctx.beginPath();
  ctx.ellipse(-bird.size * 0.3, -bird.size * 0.2, bird.size * wingSpread, bird.size * 0.3, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Right wing
  ctx.beginPath();
  ctx.ellipse(bird.size * 0.3, -bird.size * 0.2, bird.size * wingSpread, bird.size * 0.3, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
};

// Cloud system
export const createCloud = (canvasWidth: number, canvasHeight: number) => ({
  x: -100,
  y: Math.random() * ANIMATION_ELEMENTS.CLOUDS.HEIGHT.max + ANIMATION_ELEMENTS.CLOUDS.HEIGHT.min,
  speed: Math.random() * (ANIMATION_ELEMENTS.CLOUDS.SPEED.max - ANIMATION_ELEMENTS.CLOUDS.SPEED.min) + ANIMATION_ELEMENTS.CLOUDS.SPEED.min,
  size: Math.random() * (ANIMATION_ELEMENTS.CLOUDS.SIZE.max - ANIMATION_ELEMENTS.CLOUDS.SIZE.min) + ANIMATION_ELEMENTS.CLOUDS.SIZE.min,
  opacity: 0.3 + Math.random() * 0.4
});

export const updateCloud = (cloud: any, deltaTime: number, canvasWidth: number) => {
  cloud.x += cloud.speed * deltaTime * 0.001;
  return cloud.x < canvasWidth + 200;
};

export const drawCloud = (ctx: any, cloud: any) => {
  ctx.save();
  ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
  
  // Draw fluffy cloud with multiple circles
  const positions = [
    { x: 0, y: 0, scale: 1 },
    { x: -cloud.size * 0.4, y: cloud.size * 0.1, scale: 0.8 },
    { x: cloud.size * 0.4, y: cloud.size * 0.1, scale: 0.7 },
    { x: -cloud.size * 0.2, y: -cloud.size * 0.3, scale: 0.6 },
    { x: cloud.size * 0.2, y: -cloud.size * 0.3, scale: 0.6 }
  ];
  
  positions.forEach(pos => {
    ctx.beginPath();
    ctx.arc(cloud.x + pos.x, cloud.y + pos.y, cloud.size * pos.scale, 0, Math.PI * 2);
    ctx.fill();
  });
  
  ctx.restore();
};

// Grass system
export const createGrassBlades = (canvasWidth: number, canvasHeight: number) => {
  const blades = [];
  for (let i = 0; i < ANIMATION_ELEMENTS.GRASS.COUNT; i++) {
    blades.push({
      x: Math.random() * canvasWidth,
      baseY: canvasHeight * 0.7 + Math.random() * 20,
      height: 15 + Math.random() * 25,
      phase: Math.random() * Math.PI * 2,
      swayAmount: Math.random() * ANIMATION_ELEMENTS.GRASS.SWAY_AMOUNT + 1
    });
  }
  return blades;
};

export const updateGrassBlades = (blades: any, deltaTime: number) => {
  blades.forEach((blade: any) => {
    blade.phase += ANIMATION_ELEMENTS.GRASS.SWAY_SPEED * deltaTime * 0.001;
  });
};

export const drawGrassBlades = (ctx: any, blades: any   ) => {
  ctx.strokeStyle = '#228b22';
  ctx.lineWidth = 2;
  
  blades.forEach((blade: any) => {
    const sway = Math.sin(blade.phase) * blade.swayAmount;
    
    ctx.beginPath();
    ctx.moveTo(blade.x, blade.baseY);
    ctx.quadraticCurveTo(
      blade.x + sway * 0.5, 
      blade.baseY - blade.height * 0.5, 
      blade.x + sway, 
      blade.baseY - blade.height
    );
    ctx.stroke();
  });
};