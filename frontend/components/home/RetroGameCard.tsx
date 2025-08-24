'use client';

import { useState, useEffect } from 'react';

const RetroGameCard = ({ game, onGameSelect }: { game: any, onGameSelect: (game: any) => void } ) => {
  const [isHovered, setIsHovered] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [scanLines, setScanLines] = useState(true);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every second
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 150);
      }
    }, 1000);

    return () => clearInterval(glitchInterval);
  }, []);

  const handleClick = () => {
    setGlitchEffect(true);
    setTimeout(() => {
      onGameSelect(game);
    }, 300);
  };

  return (
    <div 
      className={`relative bg-black border-4 border-white rounded-lg overflow-hidden cursor-pointer transform transition-all duration-200 ${
        isHovered ? 'scale-105 shadow-2xl' : 'scale-100'
      } ${glitchEffect ? 'animate-pulse' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        fontFamily: 'monospace',
        imageRendering: 'pixelated',
        boxShadow: isHovered ? `0 0 30px ${game.colors.primary}66` : '0 0 10px rgba(0,0,0,0.5)'
      }}
    >
      {/* CRT Scan Lines Effect */}
      {scanLines && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 z-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
          }}
        />
      )}

      {/* Glitch Effect Overlay */}
      {glitchEffect && (
        <>
          <div 
            className="absolute inset-0 bg-red-500 opacity-20 z-20"
            style={{ clipPath: 'polygon(0 20%, 100% 20%, 100% 40%, 0 40%)' }}
          />
          <div 
            className="absolute inset-0 bg-green-500 opacity-20 z-20"
            style={{ clipPath: 'polygon(0 60%, 100% 60%, 100% 80%, 0 80%)' }}
          />
        </>
      )}

      {/* Game Display Screen */}
      <div 
        className="relative h-64 flex flex-col items-center justify-center p-6"
        style={{
          background: `linear-gradient(145deg, #1a1a2e, #16213e, #0f3460)`,
          border: '2px inset #333'
        }}
      >
        {/* Game Icon */}
        <div 
          className={`text-8xl mb-4 transform transition-all duration-300 ${
            isHovered ? 'scale-110 animate-bounce' : 'scale-100'
          }`}
          style={{ 
            filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.8))',
            textShadow: `0 0 20px ${game.colors.primary}`
          }}
        >
          {game.pixelIcon}
        </div>

        {/* Pixel Art Border */}
        <div 
          className="absolute inset-4 border-2 border-dashed opacity-30"
          style={{ borderColor: game.colors.primary }}
        />

        {/* Status Indicators */}
        <div className="absolute top-2 right-2 flex space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Game Info Panel */}
      <div 
        className="p-4 text-green-400 bg-black"
        style={{
          fontFamily: 'Courier New, monospace',
          fontSize: '14px',
          textShadow: '0 0 5px currentColor'
        }}
      >
        {/* Title */}
        <div className="text-center mb-3">
          <h3 className="text-lg font-bold tracking-wider text-white mb-1">
            {game.title}
          </h3>
          <p 
            className="text-sm tracking-wide"
            style={{ color: game.colors.accent }}
          >
            {game.subtitle}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">PLAYERS:</span>
            <span className="text-white">{game.maxPlayers}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">TIME:</span>
            <span className="text-white">{game.estimatedTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">LEVEL:</span>
            <span 
              style={{ color: game.colors.primary }}
              className="font-bold"
            >
              {game.difficulty}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">TYPE:</span>
            <span 
              style={{ color: game.colors.secondary }}
              className="font-bold"
            >
              {game.category}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full h-2 bg-gray-800 border border-gray-600">
            <div 
              className="h-full transition-all duration-1000"
              style={{
                width: isHovered ? '100%' : '0%',
                backgroundColor: game.colors.primary,
                boxShadow: `0 0 10px ${game.colors.primary}`
              }}
            />
          </div>
          <p className="text-center text-xs mt-1 text-gray-500">
            {isHovered ? '>>> READY TO PLAY <<<' : '>>> HOVER TO LOAD <<<'}
          </p>
        </div>
      </div>

      {/* Retro Click Animation */}
      {glitchEffect && (
        <div 
          className="absolute inset-0 bg-white opacity-50 animate-ping"
          style={{ animationDuration: '0.3s' }}
        />
      )}
    </div>
  );
};

export default RetroGameCard;