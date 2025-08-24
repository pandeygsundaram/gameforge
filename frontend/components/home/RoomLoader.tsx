'use client';

import { useState, useEffect } from 'react';
// import { ROOM_MESSAGES } from '@/components/utils/gameData';  // TODO: Add ROOM_MESSAGES 

const RoomLoader = ({ game, onComplete }: { game: any, onComplete: () => void }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // Message cycling
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % 10);
    }, 1000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="text-center max-w-md mx-auto p-8">
        {/* Game Icon */}
        <div 
          className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center animate-pulse"
          style={{
            background: `linear-gradient(135deg, ${game.colors.primary}, ${game.colors.secondary})`,
            boxShadow: `0 0 40px ${game.colors.primary}66`
          }}
        >
          <span className="text-4xl animate-bounce">
            {game.id === 'fruitNinja' ? '🗡️' : '🏺'}
          </span>
        </div>

        {/* Game Title */}
        <h2 
          className="text-3xl font-bold mb-4"
          style={{ color: game.colors.primary }}
        >
          {game.title}
        </h2>

        {/* Loading Message */}
        <p className="text-xl text-white mb-8 h-8">
          {currentMessage}{dots}
        </p>

        {/* Progress Bar */}
        <div 
          className="w-full h-3 bg-gray-800 rounded-full mb-4 overflow-hidden"
          style={{ border: `1px solid ${game.colors.secondary}44` }}
        >
          <div 
            className="h-full rounded-full transition-all duration-100 ease-out relative"
            style={{ 
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${game.colors.primary}, ${game.colors.secondary})`,
              boxShadow: `0 0 20px ${game.colors.primary}66`
            }}
          >
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse rounded-full"></div>
          </div>
        </div>

        {/* Progress Percentage */}
        <p className="text-gray-400 text-lg font-mono">
          {progress}%
        </p>

        {/* Spinning Loader */}
        <div className="mt-8">
          <div 
            className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ 
              borderColor: `${game.colors.secondary} transparent ${game.colors.secondary} ${game.colors.secondary}` 
            }}
          ></div>
        </div>

        {/* Room Info */}
        <div className="mt-8 text-sm text-gray-500">
          <p>🌐 Connecting to game server...</p>
          <p>👥 Room capacity: {game.maxPlayers} players</p>
          <p>⏱️ Est. game time: {game.estimatedTime}</p>
        </div>
      </div>
    </div>
  );
};

export default RoomLoader;