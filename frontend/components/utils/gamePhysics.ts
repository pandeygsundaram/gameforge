import { FRUITS, GAME_CONFIG, PHYSICS } from "./gameConstants";

export const random = (min: number, max: number) => Math.random() * (max - min) + min;

export const createFruit = (canvasWidth: number, canvasHeight: number) => ({
  x: canvasWidth / 2,
  y: canvasHeight / 2,
  originalY: canvasHeight / 2, 
  rotation: 0,
  spinSpeed: random(PHYSICS.SPIN_MIN, PHYSICS.SPIN_MAX),
  bounceHeight: random(PHYSICS.BOUNCE_MIN, PHYSICS.BOUNCE_MAX),
  bounceSpeed: random(2, 4),
  type: FRUITS[Math.floor(Math.random() * FRUITS.length)],
  scale: 1.5,
  time: 0
});

export const updateFruit = (fruit: any, deltaTime: number) => {
  fruit.time += deltaTime * 0.001; // Convert to seconds
  fruit.rotation += fruit.spinSpeed * deltaTime * 0.001;
  fruit.y = fruit.originalY + Math.sin(fruit.time * fruit.bounceSpeed) * fruit.bounceHeight;
  return fruit;
};

export const createParticle = (x: number, y: number) => ({
  x,
  y,
  vx: random(-200, 200),
  vy: random(-200, 200),
  life: random(0.3, 0.8),
  maxLife: random(0.3, 0.8),
  size: random(3, 6),
  color: {
    r: random(200, 255),
    g: random(150, 255),
    b: random(0, 100)
  }
});

export const updateParticle = (particle: any, deltaTime: number) => {
  particle.x += particle.vx * deltaTime * 0.001;
  particle.y += particle.vy * deltaTime * 0.001;
  particle.vy += PHYSICS.GRAVITY * deltaTime;
  particle.life -= deltaTime * 0.001;
  return particle.life > 0;
};

export const checkCollision = (mouseX: number, mouseY: number, fruit: any, fruitSize: number) => {
  const dx = mouseX - fruit.x;
  const dy = mouseY - fruit.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < fruitSize / 2;
};