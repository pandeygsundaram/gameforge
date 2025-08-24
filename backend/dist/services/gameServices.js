import { prisma } from '../config/database.js';
export class GameService {
    static async createGameSession(roomId, gameType, player1Wallet, player2Wallet) {
        try {
            const result = await prisma.gameSession.create({
                data: {
                    roomId,
                    gameType,
                    player1Wallet,
                    player2Wallet
                }
            });
            return result.id;
        }
        catch (error) {
            console.error('Error creating game session:', error);
            return null;
        }
    }
    static async updateGameScore(roomId, playerWallet, score) {
        try {
            const session = await prisma.gameSession.findFirst({
                where: {
                    roomId,
                    status: 'active'
                }
            });
            if (!session)
                return false;
            const updateData = session.player1Wallet === playerWallet
                ? { player1Score: score }
                : { player2Score: score };
            await prisma.gameSession.update({
                where: { id: session.id },
                data: updateData
            });
            return true;
        }
        catch (error) {
            console.error('Error updating game score:', error);
            return false;
        }
    }
    static async endGame(roomId, winnerWallet = null) {
        try {
            await prisma.gameSession.updateMany({
                where: { roomId },
                data: {
                    status: 'completed',
                    winnerWallet,
                    endedAt: new Date()
                }
            });
        }
        catch (error) {
            console.error('Error ending game:', error);
            throw error;
        }
    }
    static async getLeaderboard(gameType, limit = 10) {
        try {
            const leaderboard = await prisma.gameSession.groupBy({
                by: ['winnerWallet'],
                where: {
                    gameType,
                    winnerWallet: { not: null }
                },
                _count: { winnerWallet: true },
                _avg: {
                    player1Score: true,
                    player2Score: true
                },
                orderBy: [
                    { _count: { winnerWallet: 'desc' } }
                ],
                take: limit
            });
            return leaderboard.map(entry => ({
                winner_wallet: entry.winnerWallet,
                wins: entry._count.winnerWallet,
                avg_score: ((entry._avg.player1Score || 0) + (entry._avg.player2Score || 0)) / 2
            }));
        }
        catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    }
}
