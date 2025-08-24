'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GameCard from './GameCard';
import RoomLoader from './RoomLoader';
import { GAMES_DATA } from '@/components/utils/gameData';

const HomePage = () => {
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();

  const handleGameSelect = (game: any) => {
    setSelectedGame(game);
    setShowLoader(true);
    
    // Log room joining
    console.log(`🎮 Player joining ${game.title} room...`);
    console.log(`📍 Room ID: ${game.id}-${Date.now()}`);
    console.log(`👥 Max players: ${game.maxPlayers}`);
    console.log(`⚡ Loading game assets...`);
  };

  const handleLoadingComplete = () => {
    if (selectedGame) {
      console.log(`✅ Successfully joined ${selectedGame.title} room!`);
      console.log(`🚀 Redirecting to ${selectedGame.route}...`);
      router.push(selectedGame.route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎮 Game Arena
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Choose your battlefield! Compete with friends in these exciting multiplayer games.
          </p>
          
          {/* Stats Bar */}
          <div className="flex justify-center space-x-8 text-sm text-gray-400 mb-8">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span>2 Games Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
              <span>Multiplayer Ready</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
              <span>Instant Play</span>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {Object.values(GAMES_DATA).map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onGameSelect={handleGameSelect}
            />
          ))}
        </div>

        {/* Additional Features */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">🚀 More Games Coming Soon</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700">
              <span className="text-3xl mb-3 block">🏓</span>
              <h4 className="text-lg font-semibold text-white mb-2">Pong Remix</h4>
              <p className="text-gray-400 text-sm">Classic arcade action with modern twists</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700">
              <span className="text-3xl mb-3 block">🐍</span>
              <h4 className="text-lg font-semibold text-white mb-2">Snake Battle</h4>
              <p className="text-gray-400 text-sm">Multiplayer snake with power-ups</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700">
              <span className="text-3xl mb-3 block">🎯</span>
              <h4 className="text-lg font-semibold text-white mb-2">Precision Shooter</h4>
              <p className="text-gray-400 text-sm">Test your accuracy and reflexes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Room Loader */}
      {showLoader && selectedGame && (
        <RoomLoader 
          game={selectedGame}
          onComplete={handleLoadingComplete}
        />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
};

export default HomePage;