import { Socket, Server } from 'socket.io';
import { MatchmakingService } from '../services/matchMakingServices.js';
import { GameService } from '../services/gameServices.js';
import { UserService } from '../services/userService.js';

export class SocketController {
  private matchmaking: MatchmakingService;
  private userSockets = new Map<string, Socket>();

  constructor(private io: Server) {
    this.matchmaking = new MatchmakingService();
  }

  handleConnection(socket: Socket): void {
    console.log('New client connected:', socket.id);
    socket.onAny((event, payload) => {
        console.log(`Received event: ${event}`, payload);
    });

    socket.emit('message', { msg: 'You are connected to the game server!' });

    socket.on('connect_wallet', (data) => this.handleConnectWallet(socket, data));
    socket.on('join_game', (data) => this.handleJoinGame(socket, data));
    socket.on('leave_queue', (data) => this.handleLeaveQueue(socket, data));
    socket.on('update_score', (data) => this.handleUpdateScore(socket, data));
    socket.on('end_game', (data) => this.handleEndGame(socket, data));
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  private async handleConnectWallet(socket: Socket, data: any): Promise<void> {
    const payload = typeof data === 'string' ? JSON.parse(data) : data;
    const { walletAddress } = payload;

    if (!walletAddress) {
      socket.emit('error', { message: 'Wallet address is required' });
      return;
    }

    try {
      await UserService.saveUser(walletAddress);
      this.userSockets.set(walletAddress, socket);
      socket.walletAddress = walletAddress;

      socket.emit('wallet_connected', { 
        message: 'Wallet connected successfully',
        walletAddress 
      });

      console.log(`Wallet ${walletAddress} connected with socket ${socket.id}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to connect wallet' });
    }
  }

  private async handleJoinGame(socket: Socket, data: any): Promise<void> {
    const payload = typeof data === 'string' ? JSON.parse(data) : data;
    const { gameType } = payload;
    
    if (!socket.walletAddress) {
      socket.emit('error', { message: 'Please connect your wallet first' });
      return;
    }

    if (!['game1', 'game2'].includes(gameType)) {
      socket.emit('error', { message: 'Invalid game type' });
      return;
    }

    if (this.matchmaking.isPlayerInQueue(gameType, socket.walletAddress)) {
      socket.emit('error', { message: 'Already in queue for this game' });
      return;
    }

    const opponent = this.matchmaking.findMatch(gameType, socket.walletAddress);
    
    if (opponent) {
      await this.createGameMatch(socket, opponent, gameType);
    } else {
      this.addPlayerToQueue(socket, gameType);
    }
  }

  private async createGameMatch(socket: Socket, opponent: any, gameType: string): Promise<void> {
    const roomId = this.matchmaking.generateRoomId();
    const gameSessionId = await GameService.createGameSession(
      roomId, 
      gameType, 
      socket.walletAddress!, 
      opponent.wallet
    );
    
    this.matchmaking.removeFromQueue(gameType, socket.walletAddress!);
    this.matchmaking.removeFromQueue(gameType, opponent.wallet);
    
    const players = [
      { wallet: socket.walletAddress!, socketId: socket.id, score: 0 },
      { wallet: opponent.wallet, socketId: opponent.socketId, score: 0 }
    ];
    
    this.matchmaking.createRoom(roomId, gameType, gameSessionId, players);
    
    socket.join(roomId);
    opponent.socket.join(roomId);
    
    this.io.to(roomId).emit('game_matched', {
      roomId,
      gameType,
      players: players.map(p => ({ wallet: p.wallet, score: p.score })),
      message: 'Game match found! Get ready to play!'
    });
    
    console.log(`Match created: ${socket.walletAddress} vs ${opponent.wallet} in room ${roomId}`);
  }

  private addPlayerToQueue(socket: Socket, gameType: string): void {
    const player = {
      wallet: socket.walletAddress!,
      socketId: socket.id,
      socket: socket,
      joinedAt: new Date()
    };

    this.matchmaking.addToQueue(gameType, player);
    
    socket.emit('queued', { 
      gameType,
      position: this.matchmaking.getQueuePosition(gameType, socket.walletAddress!),
      message: 'Looking for opponent...'
    });
    
    console.log(`${socket.walletAddress} joined ${gameType} queue`);
  }

  private handleLeaveQueue(socket: Socket, data: any): void {
    const { gameType } = data;
    
    if (socket.walletAddress) {
      this.matchmaking.removeFromQueue(gameType, socket.walletAddress);
      socket.emit('left_queue', { gameType, message: 'Left the queue' });
    }
  }

  private async handleUpdateScore(socket: Socket, data: any): Promise<void> {
    const { roomId, score } = data;
    
    const room = this.matchmaking.getRoom(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    if (!this.matchmaking.updatePlayerScore(roomId, socket.walletAddress!, score)) {
      socket.emit('error', { message: 'Player not in this room' });
      return;
    }
    
    await GameService.updateGameScore(roomId, socket.walletAddress!, score);
    
    this.io.to(roomId).emit('score_updated', {
      playerWallet: socket.walletAddress,
      score,
      gameState: {
        players: room.players.map(p => ({ wallet: p.wallet, score: p.score }))
      }
    });
    
    console.log(`Score updated: ${socket.walletAddress} - ${score} in room ${roomId}`);
  }

  private async handleEndGame(socket: Socket, data: any): Promise<void> {
    const { roomId, winnerWallet } = data;
    
    const room = this.matchmaking.getRoom(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    try {
      await GameService.endGame(roomId, winnerWallet);
      
      this.io.to(roomId).emit('game_ended', {
        roomId,
        winnerWallet,
        finalScores: room.players.map(p => ({ wallet: p.wallet, score: p.score })),
        message: 'Game completed!'
      });
      
      this.matchmaking.deleteRoom(roomId);
      console.log(`Game ended in room ${roomId}. Winner: ${winnerWallet || 'Draw'}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to end game' });
    }
  }

  private handleDisconnect(socket: Socket): void {
    console.log('Client disconnected:', socket.id);
    
    if (socket.walletAddress) {
      this.matchmaking.removePlayerFromAllQueues(socket.walletAddress);
      this.userSockets.delete(socket.walletAddress);
      
      // Handle active games
      for (const [roomId, room] of this.matchmaking.getAllActiveRooms().entries()) {
        const playerInRoom = room.players.find(p => p.wallet === socket.walletAddress);
        if (playerInRoom) {
          this.io.to(roomId).emit('player_disconnected', {
            disconnectedPlayer: socket.walletAddress,
            message: 'Your opponent has disconnected'
          });
        }
      }
    }
  }

  getStats() {
    return {
      ...this.matchmaking.getStats(),
      connectedUsers: this.userSockets.size
    };
  }
}