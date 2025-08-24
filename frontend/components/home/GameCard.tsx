'use client';

import { useState } from 'react';

const GameCard = ({ game, onGameSelect }: { game: any, onGameSelect: (game: any) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onGameSelect(game);
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl transform transition-all duration-300 cursor-pointer ${
        isHovered ? 'scale-105 -translate-y-2' : 'scale-100'
      } ${isClicked ? 'scale-95' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        background: `linear-gradient(135deg, ${game.colors.primary}22, ${game.colors.secondary}22)`,
        border: `2px solid ${isHovered ? game.colors.primary : game.colors.secondary}44`
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className={`w-full h-full transition-transform duration-1000 ${
            isHovered ? 'scale-110 rotate-2' : 'scale-100'
          }`}
          style={{
            backgroundImage: game.id === 'fruitNinja' 
              ? `radial-gradient(circle at 20% 30%, ${game.colors.primary}40 2px, transparent 2px),
                 radial-gradient(circle at 80% 70%, ${game.colors.secondary}40 2px, transparent 2px),
                 radial-gradient(circle at 60% 40%, ${game.colors.accent}40 1px, transparent 1px)`
              : `linear-gradient(45deg, ${game.colors.primary}20 25%, transparent 25%),
                 linear-gradient(-45deg, ${game.colors.secondary}20 25%, transparent 25%),
                 linear-gradient(45deg, transparent 75%, ${game.colors.accent}20 75%)`,
            backgroundSize: game.id === 'fruitNinja' ? '100px 100px' : '30px 30px'
          }}
        />
      </div>

      {/* Game Image Placeholder */}
      <div className="relative h-48 flex items-center justify-center overflow-hidden">
        <div 
          className={`w-32 h-32 rounded-full flex items-center justify-center transform transition-all duration-500 ${
            isHovered ? 'scale-110 rotate-12' : 'scale-100'
          }`}
          style={{
            background: `linear-gradient(135deg, ${game.colors.primary}, ${game.colors.secondary})`,
            boxShadow: `0 10px 30px ${game.colors.primary}33`
          }}
        >
          <span className="text-6xl filter drop-shadow-lg">
            {game.id === 'fruitNinja' ? '🥷' : '🎯'}
          </span>
        </div>
        
        {/* Floating Elements */}
        <div className={`absolute transition-all duration-700 ${isHovered ? 'opacity-100' : 'opacity-70'}`}>
          {game.id === 'fruitNinja' ? (
            <>
              <span className={`absolute text-2xl transition-all duration-700 ${isHovered ? 'animate-bounce' : ''}`} 
                    style={{ top: '10%', left: '20%', animationDelay: '0s' }}>🍎</span>
              <span className={`absolute text-2xl transition-all duration-700 ${isHovered ? 'animate-bounce' : ''}`} 
                    style={{ top: '20%', right: '15%', animationDelay: '0.5s' }}>🍊</span>
              <span className={`absolute text-2xl transition-all duration-700 ${isHovered ? 'animate-bounce' : ''}`} 
                    style={{ bottom: '15%', left: '15%', animationDelay: '1s' }}>🍌</span>
              <span className={`absolute text-xl transition-all duration-700 ${isHovered ? 'animate-spin' : ''}`} 
                    style={{ bottom: '20%', right: '20%', animationDelay: '1.5s' }}>⚔️</span>
            </>
          ) : (
            <>
              <span className={`absolute text-2xl transition-all duration-700 ${isHovered ? 'animate-bounce' : ''}`} 
                    style={{ top: '15%', left: '15%', animationDelay: '0s' }}>🏺</span>
              <span className={`absolute text-xl transition-all duration-700 ${isHovered ? 'animate-pulse' : ''}`} 
                    style={{ top: '25%', right: '20%', animationDelay: '0.5s' }}>💨</span>
              <span className={`absolute text-2xl transition-all duration-700 ${isHovered ? 'animate-bounce' : ''}`} 
                    style={{ bottom: '20%', left: '20%', animationDelay: '1s' }}>🎒</span>
              <span className={`absolute text-xl transition-all duration-700 ${isHovered ? 'animate-pulse' : ''}`} 
                    style={{ bottom: '15%', right: '15%', animationDelay: '1.5s' }}>🌟</span>
            </>
          )}
        </div>
      </div>

      {/* Game Info */}
      <div className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-white">{game.title}</h3>
          <span 
            className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{ 
              backgroundColor: `${game.colors.accent}33`, 
              color: game.colors.accent,
              border: `1px solid ${game.colors.accent}66`
            }}
          >
            {game.category}
          </span>
        </div>
        
        <p className="text-lg font-semibold mb-3" style={{ color: game.colors.accent }}>
          {game.subtitle}
        </p>
        
        <p className="text-gray-300 mb-4 text-sm leading-relaxed">
          {game.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
              {game.maxPlayers} Players
            </span>
            <span>{game.estimatedTime}</span>
          </div>
          <span 
            className="font-semibold"
            style={{ color: game.colors.secondary }}
          >
            {game.difficulty}
          </span>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div 
        className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
          isHovered ? 'opacity-20' : 'opacity-0'
        }`}
        style={{
          background: `linear-gradient(135deg, ${game.colors.primary}44, ${game.colors.secondary}44)`,
          filter: 'blur(1px)'
        }}
      />
      
      {/* Click Ripple Effect */}
      {isClicked && (
        <div 
          className="absolute inset-0 rounded-2xl animate-ping"
          style={{
            background: `linear-gradient(135deg, ${game.colors.primary}66, ${game.colors.secondary}66)`
          }}
        />
      )}
    </div>
  );
};

export default GameCard;