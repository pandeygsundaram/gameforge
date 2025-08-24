import { Router, type Request, type Response } from 'express';
import { UserService } from '../services/userService.js';
import { GameService } from '../services/gameServices.js';
import { SocketController } from '../controllers/socketController.js';

export function createApiRoutes(socketController: SocketController): Router {
  const router = Router();

  router.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  router.get('/stats', (req: Request, res: Response) => {
    const stats = socketController.getStats();
    res.json(stats);
  });

  router.get('/user/:wallet/games', async (req: Request, res: Response) => {
    const { wallet } = req.params;
    
    try {
      const games = await UserService.getUserGames(wallet as string);
      res.json({ games });
    } catch (error) {
      console.error('Error fetching user games:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/leaderboard/:gameType', async (req: Request, res: Response) => {
    const { gameType } = req.params;
    
    try {
      const leaderboard = await GameService.getLeaderboard(gameType as string);
      res.json({ leaderboard });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}