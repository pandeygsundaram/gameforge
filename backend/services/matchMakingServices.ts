import type { Player, GameQueues, RoomData, RoomPlayer } from '../types/index.js';

export class MatchmakingService {
  private gameQueues: GameQueues = {
    game1: [],
    game2: []
  };

  private activeRooms = new Map<string, RoomData>();

  generateRoomId(): string {
    return 'room_' + Math.random().toString(36).substr(2, 9);
  }

  findMatch(gameType: string, excludeWallet: string): Player | undefined {
    const queue = this.gameQueues[gameType];
    if (!queue) return undefined;
    return queue.find(player => player.wallet !== excludeWallet);
  }

  addToQueue(gameType: string, player: Player): void {
    if (!this.gameQueues[gameType]) {
      this.gameQueues[gameType] = [];
    }
    this.gameQueues[gameType].push(player);
  }

  removeFromQueue(gameType: string, wallet: string): void {
    if (this.gameQueues[gameType]) {
      this.gameQueues[gameType] = this.gameQueues[gameType].filter(p => p.wallet !== wallet);
    }
  }

  isPlayerInQueue(gameType: string, wallet: string): boolean {
    return this.gameQueues[gameType]?.some(p => p.wallet === wallet) || false;
  }

  getQueuePosition(gameType: string, wallet: string): number {
    const queue = this.gameQueues[gameType];
    if (!queue) return -1;
    return queue.findIndex(p => p.wallet === wallet) + 1;
  }

  createRoom(roomId: string, gameType: string, gameSessionId: number | null, players: RoomPlayer[]): void {
    const roomData: RoomData = {
      id: roomId,
      gameType,
      gameSessionId,
      players,
      status: 'active',
      createdAt: new Date()
    };
    this.activeRooms.set(roomId, roomData);
  }

  getRoom(roomId: string): RoomData | undefined {
    return this.activeRooms.get(roomId);
  }

  deleteRoom(roomId: string): void {
    this.activeRooms.delete(roomId);
  }

  updatePlayerScore(roomId: string, playerWallet: string, score: number): boolean {
    const room = this.activeRooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.wallet === playerWallet);
    if (!player) return false;

    player.score = score;
    return true;
  }

  removePlayerFromAllQueues(wallet: string): void {
    Object.keys(this.gameQueues).forEach(gameType => {
      this.removeFromQueue(gameType, wallet);
    });
  }

  getStats() {
    return {
      activeRooms: this.activeRooms.size,
      queues: Object.keys(this.gameQueues).reduce((acc: Record<string, number>, gameType) => {
        acc[gameType] = this.gameQueues[gameType]?.length || 0;
        return acc;
      }, {})
    };
  }

  getAllActiveRooms(): Map<string, RoomData> {
    return this.activeRooms;
  }
}