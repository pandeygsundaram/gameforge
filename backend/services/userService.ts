import { prisma } from '../config/database.js';

export class UserService {
  static async saveUser(walletAddress: string): Promise<void> {
    try {
      await prisma.user.upsert({
        where: { walletAddress },
        update: {},
        create: { walletAddress }
      });
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  static async getUserGames(wallet: string, limit = 50) {
    try {
      return await prisma.gameSession.findMany({
        where: {
          OR: [
            { player1Wallet: wallet },
            { player2Wallet: wallet }
          ]
        },
        orderBy: { startedAt: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('Error fetching user games:', error);
      throw error;
    }
  }
}