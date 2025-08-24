'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RetroGameCard from './RetroGameCard';
import RoomLoader from './RoomLoader';
import { PixelCloud, PixelStar, PixelTree, PixelMushroom } from './PixelElement';
import { GAMES_DATA } from '@/components/utils/gameData';
import WalletConnectButton from '../WalletConnectButton';
import { gameClient } from '@/service/gameClient';

const RetroHomePage = () => {
    const [selectedGame, setSelectedGame] = useState<any>(null);
    const [showLoader, setShowLoader] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [typewriterText, setTypewriterText] = useState('');
    const router = useRouter();

    const fullText = "Play. Earn. Repeat!";

    // Typewriter effect
    useEffect(() => {
        let index = 0;
        const typeInterval = setInterval(() => {
            setTypewriterText(fullText.slice(0, index));
            index++;
            if (index > fullText.length) {
                index = 0;
            }
        }, 200);

        return () => clearInterval(typeInterval);
    }, []);

    // Clock update
    useEffect(() => {
        const clockInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(clockInterval);
    }, []);

    const handleGameSelect = (game: any) => {
        setSelectedGame(game);
        setShowLoader(true);

        gameClient.waitingForGame(game.id);

        console.log(`🎮 [RETRO ARCADE] Player joining ${game.title}...`);
        console.log(`📟 [SYSTEM] Loading ROM: ${game.id}.bin`);
        console.log(`🕹️ [INPUT] Controllers detected: ${game.maxPlayers}`);
    };
    useEffect(() => {
        // Listen for match confirmation from server
        gameClient.on('game_matched', (data) => {
            console.log('🎯 Game matched!', data);
            // Make sure it's for the game we picked
            if (selectedGame && data.gameType === selectedGame.id) {
                handleLoadingComplete(); // triggers router.push
            }
        });
    
        return () => {
            gameClient.off('game_matched');
        };
    }, [selectedGame]);

    const handleLoadingComplete = () => {
        if (selectedGame) {
            console.log(`✅ [SUCCESS] Game loaded successfully!`);
            console.log(`🚀 [LAUNCH] Starting ${selectedGame.title}...`);
            router.push(selectedGame.route);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden" style={{
            background: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 50%, #DEB887 100%)',
            fontFamily: 'Courier New, monospace'
        }}>
            {/* Animated Pixel Background Elements */}
            <PixelCloud delay={0} speed={1} />
            <PixelCloud delay={3} speed={0.5} />
            <PixelCloud delay={6} speed={1.5} />

            <PixelStar x={10} y={15} delay={0} />
            <PixelStar x={85} y={20} delay={2} />
            <PixelStar x={70} y={10} delay={4} />
            <PixelStar x={30} y={25} delay={1} />
            <PixelStar x={50} y={12} delay={3} />

            <PixelTree x={5} />
            <PixelTree x={92} />
            <PixelMushroom x={15} delay={0} />
            <PixelMushroom x={75} delay={2} />
            <PixelMushroom x={40} delay={4} />

            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-6 py-8">
                {/* Retro Header */}
                <div className="text-center mb-12">
                    {/* System Info Bar */}
                    <div
                        className="bg-black text-green-400 p-2 rounded mb-6 font-mono text-sm border-2 border-green-400"
                        style={{ textShadow: '0 0 5px currentColor' }}
                    >
                        <div className="flex justify-between items-center">
                            <span>🕹️ RETRO ARCADE SYSTEM v2.0</span>
                            <span>📅 {currentTime.toLocaleDateString()} ⏰ {currentTime.toLocaleTimeString()}</span>
                            <WalletConnectButton />
                            
                        </div>
                    </div>

                    {/* Speech Bubble */}
                    <div className="relative inline-block mb-8">
                        <div
                            className="bg-white border-4 border-black px-8 py-4 rounded-3xl relative"
                            style={{
                                filter: 'drop-shadow(6px 6px 0px rgba(0,0,0,0.8))',
                            }}
                        >
                            <div className="text-2xl font-bold text-black tracking-wider">
                                {typewriterText}
                                <span className="animate-ping">|</span>
                            </div>
                            {/* Heart */}
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-2xl animate-pulse">
                                ❤️
                            </div>
                            {/* Speech bubble tail */}
                            <div
                                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0"
                                style={{
                                    borderLeft: '20px solid transparent',
                                    borderRight: '20px solid transparent',
                                    borderTop: '20px solid black'
                                }}
                            />
                            <div
                                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0"
                                style={{
                                    borderLeft: '16px solid transparent',
                                    borderRight: '16px solid transparent',
                                    borderTop: '16px solid white'
                                }}
                            />
                        </div>
                    </div>

                    {/* Main Title */}
                    <h1
                        className="text-8xl font-bold text-black mb-4 tracking-wider transform -skew-y-1"
                        style={{
                            textShadow: '6px 6px 0px rgba(255,255,255,0.8), 12px 12px 0px rgba(0,0,0,0.8)',
                            fontFamily: 'Impact, monospace',
                            letterSpacing: '0.1em'
                        }}
                    >
                        GAME BOX
                    </h1>

                    {/* Decorative Elements */}
                    <div className="flex justify-center items-center space-x-4 mb-8">
                        <span className="text-4xl animate-bounce">⚡</span>
                        <span className="text-2xl animate-pulse">✨</span>
                        <span className="text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>⭐</span>
                        <span className="text-2xl animate-pulse" style={{ animationDelay: '1s' }}>✨</span>
                        <span className="text-4xl animate-bounce" style={{ animationDelay: '1.5s' }}>⚡</span>
                    </div>
                </div>

                {/* Game Selection */}
                <div className="max-w-6xl mx-auto">
                    <div
                        className="bg-black bg-opacity-80 p-6 rounded-lg border-4 border-white mb-8"
                        style={{ boxShadow: '0 0 30px rgba(0,0,0,0.8)' }}
                    >
                        <h2 className="text-3xl font-bold text-center text-green-400 mb-4 tracking-wider" style={{ textShadow: '0 0 10px currentColor' }}>
                            &gt;&gt;&gt; SELECT YOUR GAME &lt;&lt;&lt;
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {Object.values(GAMES_DATA).map((game) => (
                                <RetroGameCard
                                    key={game.id}
                                    game={game}
                                    onGameSelect={handleGameSelect}
                                />
                            ))}
                        </div>
                    </div>

                        
                        {/* Retro Stats */}
                        <div
                            className="text-center grid md:grid-cols-4 gap-4 mb-16"
                        >
                            {[
                                { icon: '🎮', label: 'GAMES', value: '2' },
                                { icon: '👾', label: 'PLAYERS', value: 'UNLIMITED' },
                                { icon: '🏆', label: 'HIGH SCORE', value: '999999' },
                                { icon: '⚡', label: 'POWER LEVEL', value: 'MAXIMUM' }
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-black bg-opacity-60 p-4 rounded border-2 border-yellow-400 text-yellow-400"
                                    style={{
                                        fontFamily: 'monospace',
                                        textShadow: '0 0 5px currentColor'
                                    }}
                                >
                                    <div className="text-2xl mb-2">{stat.icon}</div>
                                    <div className="text-xs text-gray-400">{stat.label}</div>
                                    <div className="text-lg font-bold">{stat.value}</div>
                                </div>
                            ))}
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

            {/* Retro Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-green-400 p-4 text-center font-mono text-sm">
                <div className="animate-pulse">
                    🕹️ INSERT COIN TO CONTINUE • PRESS START TO BEGIN • GAME OVER = TRY AGAIN 🕹️
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
        @keyframes pixelate {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-pixelate {
          animation: pixelate 2s infinite;
        }
      `}</style>
        </div>
    );
};

export default RetroHomePage;