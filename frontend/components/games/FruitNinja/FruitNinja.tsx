'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { GAME_CONFIG, COLORS, FRUITS } from '@/components/utils/gameConstants';
import { createFruit, updateFruit, createParticle, updateParticle, checkCollision } from '@/components/utils/gamePhysics';

const FruitNinja = () => {
    // Game state
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);
    const [round, setRound] = useState(1);
    const [gameActive, setGameActive] = useState(true);
    const [winner, setWinner] = useState<string | null>(null);

    // Refs
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const gameStateRef = useRef({
        currentFruit: null as any,
        particles: [] as any[],
        slashEffect: null as any,
        swords: {
            player1: { x: 200, y: 350, swinging: false, angle: 0, scale: 1 },
            player2: { x: 1000, y: 350, swinging: false, angle: 0, scale: 1 }
        },
        lastTime: 0
    });

    // Initialize fruit
    const spawnFruit = useCallback(() => {
        if (!gameActive) return;
        gameStateRef.current.currentFruit = createFruit(GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    }, [gameActive]);

    // Handle click
    const handleCanvasClick = useCallback((event: any) => {
        if (!gameActive || !gameStateRef.current.currentFruit) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const fruit = gameStateRef.current.currentFruit;

        if (checkCollision(mouseX, mouseY, fruit, GAME_CONFIG.FRUIT_SIZE)) {
            const centerX = GAME_CONFIG.CANVAS_WIDTH / 2;
            const player = mouseX < centerX ? 1 : 2;

            // Create slash effect
            gameStateRef.current.slashEffect = {
                x: fruit.x,
                y: fruit.y,
                angle: player === 1 ? 45 : -45,
                life: 0.6,
                maxLife: 0.6
            };

            // Create particles
            for (let i = 0; i < 12; i++) {
                gameStateRef.current.particles.push(createParticle(fruit.x, fruit.y));
            }

            // Animate sword
            const sword = gameStateRef.current.swords[`player${player}`];
            sword.swinging = true;
            sword.angle = player === 1 ? 30 : -30; // Larger swing
            sword.scale = 1.5; // Bigger scale

            // Reset sword after delay
            setTimeout(() => {
                sword.angle = 0;
                sword.scale = 1;
                sword.swinging = false;
            }, 500);

            // Score point - FIXED: Update state immediately
            let newScore1 = score1;
            let newScore2 = score2;

            if (player === 1) {
                newScore1 = score1 + 1;
                setScore1(newScore1);
            } else {
                newScore2 = score2 + 1;
                setScore2(newScore2);
            }

            // Remove fruit
            gameStateRef.current.currentFruit = null;

            // Check winner - FIXED: Use the new scores
            if (newScore1 >= GAME_CONFIG.WINNING_SCORE || newScore2 >= GAME_CONFIG.WINNING_SCORE) {
                setTimeout(() => {
                    setGameActive(false);
                    setWinner(newScore1 >= GAME_CONFIG.WINNING_SCORE ? 'Player 1' : 'Player 2');
                }, 100);
                return;
            }

            // Next round
            setRound(prev => prev + 1);
            setTimeout(spawnFruit, 1000);
        }
    }, [gameActive, score1, score2, spawnFruit]);

    // Game loop
    const gameLoop = useCallback((currentTime: number) => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d') as CanvasRenderingContext2D;
        const deltaTime = currentTime - gameStateRef.current.lastTime;
        gameStateRef.current.lastTime = currentTime;

        // Clear canvas
        if (ctx) {
            ctx.clearRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
        }

        // Draw background
        drawBackground(ctx);
        drawSwords(ctx);
        drawUI(ctx);

        // Update and draw fruit
        if (gameStateRef.current.currentFruit) {
            gameStateRef.current.currentFruit = updateFruit(gameStateRef.current.currentFruit, deltaTime);
            drawFruit(ctx, gameStateRef.current.currentFruit);
        }

        // Update and draw particles
        gameStateRef.current.particles = gameStateRef.current.particles.filter(particle => {
            const alive = updateParticle(particle, deltaTime);
            if (alive) drawParticle(ctx, particle);
            return alive;
        });

        // Update and draw slash effect
        if (gameStateRef.current.slashEffect) {
            gameStateRef.current.slashEffect.life -= deltaTime * 0.001;
            if (gameStateRef.current.slashEffect.life > 0) {
                drawSlashEffect(ctx, gameStateRef.current.slashEffect);
            } else {
                gameStateRef.current.slashEffect = null;
            }
        }

        if (gameActive) {
            animationRef.current = requestAnimationFrame(gameLoop);
        }
    }, [gameActive]);

    // Drawing functions
    const drawBackground = (ctx: any) => {
        // Player 1 side
        ctx.fillStyle = COLORS.PLAYER1_SIDE;
        ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT);

        // Player 2 side
        ctx.fillStyle = COLORS.PLAYER2_SIDE;
        ctx.fillRect(GAME_CONFIG.CANVAS_WIDTH / 2, 0, GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT);

        // Center line
        ctx.fillStyle = COLORS.CENTER_LINE;
        ctx.fillRect(GAME_CONFIG.CANVAS_WIDTH / 2 - 2, 0, 4, GAME_CONFIG.CANVAS_HEIGHT);
    };

    const drawSwords = (ctx: any) => {
        const { player1, player2 } = gameStateRef.current.swords;

        // Draw Player 1 sword
        ctx.save();
        ctx.translate(player1.x, player1.y);
        ctx.rotate((player1.angle * Math.PI) / 180);
        ctx.scale(player1.scale, player1.scale);

        // Sword blade (longer and more realistic)
        const gradient = ctx.createLinearGradient(-6, 0, 6, 0);
        gradient.addColorStop(0, '#c0c0c0');
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(1, '#a0a0a0');

        ctx.fillStyle = gradient;
        ctx.fillRect(-GAME_CONFIG.SWORD_WIDTH / 2, -GAME_CONFIG.SWORD_HEIGHT / 2,
            GAME_CONFIG.SWORD_WIDTH, GAME_CONFIG.SWORD_HEIGHT);

        // Sword tip (pointed)
        ctx.beginPath();
        ctx.moveTo(-GAME_CONFIG.SWORD_WIDTH / 2, -GAME_CONFIG.SWORD_HEIGHT / 2);
        ctx.lineTo(0, -GAME_CONFIG.SWORD_HEIGHT / 2 - 15);
        ctx.lineTo(GAME_CONFIG.SWORD_WIDTH / 2, -GAME_CONFIG.SWORD_HEIGHT / 2);
        ctx.fill();

        // Cross guard
        ctx.fillStyle = '#666666';
        ctx.fillRect(-20, GAME_CONFIG.SWORD_HEIGHT / 2 - 5, 40, 10);

        // Handle/Grip
        const handleGradient = ctx.createLinearGradient(-8, 0, 8, 0);
        handleGradient.addColorStop(0, '#8b4513');
        handleGradient.addColorStop(0.5, '#a0522d');
        handleGradient.addColorStop(1, '#654321');

        ctx.fillStyle = handleGradient;
        ctx.fillRect(-8, GAME_CONFIG.SWORD_HEIGHT / 2, 16, GAME_CONFIG.SWORD_HANDLE);

        // Pommel
        ctx.fillStyle = '#4a4a4a';
        ctx.beginPath();
        ctx.arc(0, GAME_CONFIG.SWORD_HEIGHT / 2 + GAME_CONFIG.SWORD_HANDLE + 8, 10, 0, Math.PI * 2);
        ctx.fill();

        // Blade shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-2, -GAME_CONFIG.SWORD_HEIGHT / 2, 4, GAME_CONFIG.SWORD_HEIGHT);

        ctx.restore();

        // Draw Player 2 sword (same logic)
        ctx.save();
        ctx.translate(player2.x, player2.y);
        ctx.rotate((player2.angle * Math.PI) / 180);
        ctx.scale(player2.scale, player2.scale);

        // Repeat same sword drawing code for player 2
        ctx.fillStyle = gradient;
        ctx.fillRect(-GAME_CONFIG.SWORD_WIDTH / 2, -GAME_CONFIG.SWORD_HEIGHT / 2,
            GAME_CONFIG.SWORD_WIDTH, GAME_CONFIG.SWORD_HEIGHT);

        ctx.beginPath();
        ctx.moveTo(-GAME_CONFIG.SWORD_WIDTH / 2, -GAME_CONFIG.SWORD_HEIGHT / 2);
        ctx.lineTo(0, -GAME_CONFIG.SWORD_HEIGHT / 2 - 15);
        ctx.lineTo(GAME_CONFIG.SWORD_WIDTH / 2, -GAME_CONFIG.SWORD_HEIGHT / 2);
        ctx.fill();

        ctx.fillStyle = '#666666';
        ctx.fillRect(-20, GAME_CONFIG.SWORD_HEIGHT / 2 - 5, 40, 10);

        ctx.fillStyle = handleGradient;
        ctx.fillRect(-8, GAME_CONFIG.SWORD_HEIGHT / 2, 16, GAME_CONFIG.SWORD_HANDLE);

        ctx.fillStyle = '#4a4a4a';
        ctx.beginPath();
        ctx.arc(0, GAME_CONFIG.SWORD_HEIGHT / 2 + GAME_CONFIG.SWORD_HANDLE + 8, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-2, -GAME_CONFIG.SWORD_HEIGHT / 2, 4, GAME_CONFIG.SWORD_HEIGHT);

        ctx.restore();
    };

    const drawFruit = (ctx: any, fruit: any) => {
        ctx.save();
        ctx.translate(fruit.x, fruit.y);
        ctx.rotate(fruit.rotation);
        ctx.scale(fruit.scale, fruit.scale);

        // Draw fruit with emoji-like appearance
        const fruitData = {
            apple: { color: '#ff4444', size: 30, shadow: '#cc3333' },
            orange: { color: '#ff8800', size: 30, shadow: '#dd6600' },
            banana: { color: '#ffdd00', size: 35, shadow: '#ccaa00' },
            grapes: { color: '#8844ff', size: 25, shadow: '#6633cc' },
            strawberry: { color: '#ff1166', size: 28, shadow: '#cc0044' },
            kiwi: { color: '#88dd44', size: 30, shadow: '#66aa22' },
            peach: { color: '#ffaa66', size: 32, shadow: '#cc8844' },
            cherries: { color: '#dd0000', size: 20, shadow: '#aa0000' },
            mango: { color: '#ffcc00', size: 35, shadow: '#cc9900' },
            pineapple: { color: '#ffdd88', size: 40, shadow: '#ccaa66' }
        };

        const fruitInfo = fruitData[fruit.type as keyof typeof fruitData] || fruitData.apple;

        // Draw shadow
        ctx.fillStyle = fruitInfo.shadow;
        ctx.beginPath();
        ctx.arc(2, 2, fruitInfo.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw main fruit
        ctx.fillStyle = fruitInfo.color;
        ctx.beginPath();
        ctx.arc(0, 0, fruitInfo.size, 0, Math.PI * 2);
        ctx.fill();

        // Add highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-8, -8, fruitInfo.size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    };

    const drawParticle = (ctx: any, particle: any) => {
        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    };

    const drawSlashEffect = (ctx: any, slash: any) => {
        const alpha = slash.life / slash.maxLife;
        const scale = 1 + (slash.maxLife - slash.life) * 2;

        ctx.save();
        ctx.translate(slash.x, slash.y);
        ctx.rotate((slash.angle * Math.PI) / 180);
        ctx.scale(scale, 1);

        ctx.fillStyle = `rgba(255, 255, 100, ${alpha})`;
        ctx.fillRect(-60, -3, 120, 6);

        ctx.restore();
    };

    const drawUI = (ctx: any) => {
        ctx.fillStyle = 'white';
        ctx.font = '64px Arial';
        ctx.textAlign = 'center';

        // Scores
        ctx.fillText(score1.toString(), 100, 70);
        ctx.fillText(score2.toString(), GAME_CONFIG.CANVAS_WIDTH - 100, 70);

        // Player names
        ctx.font = '24px Arial';
        ctx.fillText('Player 1', 100, 140);
        ctx.fillText('Player 2', GAME_CONFIG.CANVAS_WIDTH - 100, 140);

        // Round info
        ctx.font = '20px Arial';
        ctx.fillText(`Round ${round} | First to ${GAME_CONFIG.WINNING_SCORE} wins!`, GAME_CONFIG.CANVAS_WIDTH / 2, 50);
    };

    // Restart game
    const restartGame = () => {
        setScore1(0);
        setScore2(0);
        setRound(1);
        setGameActive(true);
        setWinner(null);
        gameStateRef.current.currentFruit = null;
        gameStateRef.current.particles = [];
        gameStateRef.current.slashEffect = null;
        spawnFruit();
    };

    // Initialize game
    useEffect(() => {
        spawnFruit();
        animationRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [gameLoop, spawnFruit]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyPress = (event: any) => {
            if (!gameActive || !gameStateRef.current.currentFruit) return;

            if (event.key.toLowerCase() === 'a') {
                // Player 1 action
                const rect = canvasRef.current?.getBoundingClientRect();
                if (rect) {
                    handleCanvasClick({
                        clientX: rect.left + 100,
                        clientY: rect.top + 350
                    });
                }
            } else if (event.key.toLowerCase() === 'l') {
                // Player 2 action
                const rect = canvasRef.current?.getBoundingClientRect();
                if (rect) {
                    handleCanvasClick({
                        clientX: rect.left + 1100,
                        clientY: rect.top + 350
                    });
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameActive, handleCanvasClick]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black">
            <canvas
                ref={canvasRef}
                width={GAME_CONFIG.CANVAS_WIDTH}
                height={GAME_CONFIG.CANVAS_HEIGHT}
                onClick={handleCanvasClick}
                className="border-2 border-gray-600 rounded-lg cursor-crosshair"
                style={{ maxWidth: '100%', height: 'auto' }}
            />

            {winner && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
                    style={{ display: 'flex' }} // Force display
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

export default FruitNinja;