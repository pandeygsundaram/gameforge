import { Socket } from 'socket.io';

export interface Player {
  wallet: string;
  socketId: string;
  socket: Socket & { walletAddress?: string };
  joinedAt: Date;
}

export interface RoomPlayer {
  wallet: string;
  socketId: string;
  score: number;
}

export interface RoomData {
  id: string;
  gameType: string;
  gameSessionId: number | null;
  players: RoomPlayer[];
  status: string;
  createdAt: Date;
}

export interface GameQueues {
  [key: string]: Player[];
}

declare module 'socket.io' {
  interface Socket {
    walletAddress?: string;
  }
}
