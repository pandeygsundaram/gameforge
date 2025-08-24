import { io, Socket } from "socket.io-client";
import socket from "./socket";

class GameClient {
  private socket: Socket;
  public currentRoom: string | null = null;

  constructor() {
    this.socket = socket;

    // Connect only if not already connected
    if (!this.socket.connected) {
      this.socket.connect();
    }    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.on('connect', () => console.log('Connected to game server'));
    this.socket.on('wallet_connected', this.onWalletConnected.bind(this));
    this.socket.on('queued', this.onQueued.bind(this));
    this.socket.on('game_matched', this.onGameMatched.bind(this));
    this.socket.on('score_updated', this.onScoreUpdated.bind(this));
    this.socket.on('game_ended', this.onGameEnded.bind(this));
    this.socket.on('error', this.onError.bind(this));
  }

  connectWallet(walletAddress: string) {
    this.socket.emit('connect_wallet', { walletAddress });
  }

  joinGame(gameType: string) {
    this.socket.emit('join_game', { gameType });
  }

  updateScore(roomId: string, score: number) {
    this.socket.emit('update_score', { roomId, score });
  }

  endGame(roomId: string, winnerWallet: string) {
    this.socket.emit('end_game', { roomId, winnerWallet });
  }

  waitingForGame(gameId: string) {
    this.socket.emit('waiting_for_game', { gameId });
  }

  on(event: string, callback: (data: any) => void) {
    this.socket.on(event, callback);
  }

  off(event: string) {
    this.socket.off(event);
  }

  private onWalletConnected(data: any) {
    console.log('Wallet connected:', data.walletAddress);
  }

  private onQueued(data: any) {
    console.log(`Queued for ${data.gameType}, position: ${data.position}`);
  }

  private onGameMatched(data: any) {
    console.log('Game matched! Room:', data.roomId);
    this.currentRoom = data.roomId;
  }

  private onScoreUpdated(data: any) {
    console.log('Score updated:', data);
  }

  private onGameEnded(data: any) {
    console.log('Game ended. Winner:', data.winnerWallet);
    this.currentRoom = null;
  }

  private onError(data: any) {
    console.error('Error:', data.message);
  }
}

export const gameClient = new GameClient();
