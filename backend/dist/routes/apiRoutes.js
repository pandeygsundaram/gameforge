import { Router } from 'express';
import { UserService } from '../services/userService.js';
import { GameService } from '../services/gameServices.js';
export function createApiRoutes(socketController) {
    const router = Router();
    router.get('/health', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    router.get('/stats', (req, res) => {
        const stats = socketController.getStats();
        res.json(stats);
    });
    router.get('/user/:wallet/games', async (req, res) => {
        const { wallet } = req.params;
        try {
            const games = await UserService.getUserGames(wallet);
            res.json({ games });
        }
        catch (error) {
            console.error('Error fetching user games:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.get('/leaderboard/:gameType', async (req, res) => {
        const { gameType } = req.params;
        try {
            const leaderboard = await GameService.getLeaderboard(gameType);
            res.json({ leaderboard });
        }
        catch (error) {
            console.error('Error fetching leaderboard:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    return router;
}
