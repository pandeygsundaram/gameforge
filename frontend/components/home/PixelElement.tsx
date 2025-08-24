'use client';

import { useEffect, useState } from 'react';

// Floating Pixel Cloud Component
export const PixelCloud = ({ delay = 0, speed = 1 }: { delay?: number, speed?: number }) => {
  const [position, setPosition] = useState(-100);

  useEffect(() => {
    const animate = () => {
      setPosition(prev => {
        if (prev > window.innerWidth + 100) return -100;
        return prev + speed;
      });
    };

    const interval = setInterval(animate, 100);
    return () => clearInterval(interval);
  }, [speed]);

  return (
    <div 
      className="absolute text-4xl opacity-70 animate-bounce"
      style={{ 
        left: `${position}px`, 
        top: '10%',
        animationDelay: `${delay}s`,
        filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.3))'
      }}
    >
      ☁️
    </div>
  );
};

// Pixel Star Component
export const PixelStar = ({ x, y, delay = 0 }: { x: number, y: number, delay?: number }) => (
  <div 
    className="absolute text-2xl animate-ping"
    style={{ 
      left: `${x}%`, 
      top: `${y}%`,
      animationDelay: `${delay}s`,
      filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.5))'
    }}
  >
    ⭐
  </div>
);

// Pixel Tree Component
export const PixelTree = ({ x, size = 'text-6xl' }: { x: number, size?: string }) => (
  <div 
    className={`absolute bottom-0 ${size} animate-pulse`}
    style={{ 
      left: `${x}%`,
      filter: 'drop-shadow(3px 3px 0px rgba(0,0,0,0.4))'
    }}
  >
    🌲
  </div>
);

// Pixel Mushroom Component
export const PixelMushroom = ({ x, delay = 0 }: { x: number, delay?: number }) => (
  <div 
    className="absolute bottom-0 text-4xl animate-bounce"
    style={{ 
      left: `${x}%`,
      animationDelay: `${delay}s`,
      filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.4))'
    }}
  >
    🍄
  </div>
);