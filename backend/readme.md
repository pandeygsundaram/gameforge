# Gaming Server API Documentation

## Overview
Real-time multiplayer gaming server with wallet-based authentication, matchmaking, and score tracking.

**Base URL:** `http://localhost:3001`  
**WebSocket URL:** `ws://localhost:3001`

---

## REST API Endpoints

### Health Check
**GET** `/api/health`

Check server status and uptime.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-08-24T10:30:00.000Z"
}
```

---

### Server Statistics
**GET** `/api/stats`

Get current server statistics including active rooms, queue sizes, and connected users.

**Response:**
```json
{
  "activeRooms": 5,
  "queues": {
    "game1": 3,
    "game2": 1
  },
  "connectedUsers": 25
}
```

---

### User Game History
**GET** `/api/user/{wallet}/games`

Get game history for a specific wallet address.

**Parameters:**
- `wallet` (path, required): User's wallet address

**Response:**
```json
{
  "games": [
    {
      "id": 123,
      "roomId": "room_abc123def",
      "gameType": "game1",
      "player1Wallet": "0x1234...5678",
      "player2Wallet": "0x9876...5432", 
      "player1Score": 150,
      "player2Score": 120,
      "winnerWallet": "0x1234...5678",
      "status": "completed",
      "startedAt": "2025-08-24T10:00:00.000Z",
      "endedAt": "2025-08-24T10:15:00.000Z"
    }
  ]
}
```

---

### Game Leaderboard
**GET** `/api/leaderboard/{gameType}`

Get top players leaderboard for a specific game type.

**Parameters:**
- `gameType` (path, required): Type of game ("game1" or "game2")

**Response:**
```json
{
  "leaderboard": [
    {
      "winner_wallet": "0x1234...5678",
      "wins": 15,
      "avg_score": 145.5
    },
    {
      "winner_wallet": "0x9876...5432",
      "wins": 12,
      "avg_score": 132.8
    }
  ]
}
```

---

## Socket.IO Events

### Client → Server Events

#### Connect Wallet
**Event:** `connect_wallet`

Connect user's wallet to establish gaming session.

**Payload:**
```json
{
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

**Success Response:** `wallet_connected`
```json
{
  "message": "Wallet connected successfully",
  "walletAddress": "0x1234...5678"
}
```

**Error Response:** `error`
```json
{
  "message": "Wallet address is required"
}
```

---

#### Join Game Queue
**Event:** `join_game`

Join matchmaking queue for a specific game type.

**Prerequisites:** Wallet must be connected first

**Payload:**
```json
{
  "gameType": "game1"
}
```

**Possible Responses:**

**Queued (waiting for opponent):** `queued`
```json
{
  "gameType": "game1",
  "position": 2,
  "message": "Looking for opponent..."
}
```

**Match Found:** `game_matched`
```json
{
  "roomId": "room_abc123def",
  "gameType": "game1",
  "players": [
    {
      "wallet": "0x1234...5678",
      "score": 0
    },
    {
      "wallet": "0x9876...5432", 
      "score": 0
    }
  ],
  "message": "Game match found! Get ready to play!"
}
```

**Error Response:** `error`
```json
{
  "message": "Please connect your wallet first"
}
```

---

#### Leave Queue
**Event:** `leave_queue`

Leave the matchmaking queue.

**Payload:**
```json
{
  "gameType": "game1"
}
```

**Response:** `left_queue`
```json
{
  "gameType": "game1",
  "message": "Left the queue"
}
```

---

#### Update Score
**Event:** `update_score`

Update player's score during active game.

**Prerequisites:** Must be in an active game room

**Payload:**
```json
{
  "roomId": "room_abc123def",
  "score": 150
}
```

**Response:** `score_updated` (broadcast to all players in room)
```json
{
  "playerWallet": "0x1234...5678",
  "score": 150,
  "gameState": {
    "players": [
      {
        "wallet": "0x1234...5678",
        "score": 150
      },
      {
        "wallet": "0x9876...5432",
        "score": 120
      }
    ]
  }
}
```

---

#### End Game
**Event:** `end_game`

End the current game and declare winner.

**Payload:**
```json
{
  "roomId": "room_abc123def",
  "winnerWallet": "0x1234567890123456789012345678901234567890"
}
```

**Response:** `game_ended` (broadcast to all players in room)
```json
{
  "roomId": "room_abc123def",
  "winnerWallet": "0x1234...5678",
  "finalScores": [
    {
      "wallet": "0x1234...5678",
      "score": 150
    },
    {
      "wallet": "0x9876...5432",
      "score": 120
    }
  ],
  "message": "Game completed!"
}
```

---

### Server → Client Events

#### Player Disconnected
**Event:** `player_disconnected`

Notifies when opponent disconnects during active game.

**Payload:**
```json
{
  "disconnectedPlayer": "0x9876...5432",
  "message": "Your opponent has disconnected"
}
```

#### Error
**Event:** `error`

General error event for various failure scenarios.

**Payload:**
```json
{
  "message": "Error description"
}
```

---

## Data Models

### User
```json
{
  "id": 1,
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "createdAt": "2025-08-24T09:00:00.000Z"
}
```

### Game Session
```json
{
  "id": 123,
  "roomId": "room_abc123def",
  "gameType": "game1",
  "player1Wallet": "0x1234...5678",
  "player2Wallet": "0x9876...5432",
  "player1Score": 150,
  "player2Score": 120,
  "winnerWallet": "0x1234...5678",
  "status": "completed",
  "startedAt": "2025-08-24T10:00:00.000Z",
  "endedAt": "2025-08-24T10:15:00.000Z"
}
```

### Room Data (In-Memory)
```json
{
  "id": "room_abc123def",
  "gameType": "game1", 
  "gameSessionId": 123,
  "players": [
    {
      "wallet": "0x1234...5678",
      "socketId": "socket_xyz789",
      "score": 150
    }
  ],
  "status": "active",
  "createdAt": "2025-08-24T10:00:00.000Z"
}
```

---

## Connection Flow

### 1. Initial Connection
```javascript
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

### 2. Wallet Authentication
```javascript
socket.emit('connect_wallet', {
  walletAddress: '0x1234567890123456789012345678901234567890'
});

socket.on('wallet_connected', (data) => {
  console.log('Wallet connected:', data.walletAddress);
});
```

### 3. Join Game
```javascript
socket.emit('join_game', {
  gameType: 'game1'
});

// Either queued or matched
socket.on('queued', (data) => {
  console.log('In queue, position:', data.position);
});

socket.on('game_matched', (data) => {
  console.log('Game found! Room:', data.roomId);
});
```

### 4. Game Play
```javascript
// Update score during game
socket.emit('update_score', {
  roomId: 'room_abc123def',
  score: 150
});

// Listen for score updates
socket.on('score_updated', (data) => {
  console.log('Score update:', data);
});

// End game
socket.emit('end_game', {
  roomId: 'room_abc123def',
  winnerWallet: '0x1234...5678'
});
```

---

## Error Codes

| Error Message | Cause | Solution |
|---------------|--------|----------|
| "Wallet address is required" | Missing walletAddress in connect_wallet | Provide valid wallet address |
| "Please connect your wallet first" | Attempting game actions without wallet | Call connect_wallet first |
| "Invalid game type" | Unsupported gameType | Use "game1" or "game2" |
| "Already in queue for this game" | Duplicate join_game request | Leave queue first or wait for match |
| "Room not found" | Invalid roomId | Ensure you're in an active game |
| "Player not in this room" | Score update from non-participant | Only game participants can update scores |

---

## Rate Limits

- **Connection**: No limit
- **Wallet Connect**: 1 per socket connection
- **Join Game**: 5 requests per minute per wallet
- **Score Updates**: 10 per second per game room
- **API Endpoints**: 100 requests per minute per IP

---

## Example Client Implementation

```javascript
class GameClient {
  constructor() {
    this.socket = io('http://localhost:3001');
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => console.log('Connected'));
    this.socket.on('wallet_connected', this.onWalletConnected.bind(this));
    this.socket.on('queued', this.onQueued.bind(this));
    this.socket.on('game_matched', this.onGameMatched.bind(this));
    this.socket.on('score_updated', this.onScoreUpdated.bind(this));
    this.socket.on('game_ended', this.onGameEnded.bind(this));
    this.socket.on('error', this.onError.bind(this));
  }

  connectWallet(walletAddress) {
    this.socket.emit('connect_wallet', { walletAddress });
  }

  joinGame(gameType) {
    this.socket.emit('join_game', { gameType });
  }

  updateScore(roomId, score) {
    this.socket.emit('update_score', { roomId, score });
  }

  endGame(roomId, winnerWallet) {
    this.socket.emit('end_game', { roomId, winnerWallet });
  }

  onWalletConnected(data) {
    console.log('Wallet connected:', data.walletAddress);
  }

  onQueued(data) {
    console.log(`Queued for ${data.gameType}, position: ${data.position}`);
  }

  onGameMatched(data) {
    console.log('Game matched! Room:', data.roomId);
    this.currentRoom = data.roomId;
  }

  onScoreUpdated(data) {
    console.log('Score updated:', data);
  }

  onGameEnded(data) {
    console.log('Game ended. Winner:', data.winnerWallet);
    this.currentRoom = null;
  }

  onError(data) {
    console.error('Error:', data.message);
  }
}

// Usage
const client = new GameClient();
client.connectWallet('0x1234567890123456789012345678901234567890');
client.joinGame('game1');
```

---

## Environment Variables

```env
PORT=3001
DATABASE_URL="postgresql://username:password@localhost:5432/gaming_db"
NODE_ENV=production
```

---

## Testing Endpoints

### Using curl:
```bash
# Health check
curl http://localhost:3001/api/health

# Server stats
curl http://localhost:3001/api/stats

# User games
curl http://localhost:3001/api/user/0x1234567890123456789012345678901234567890/games

# Leaderboard
curl http://localhost:3001/api/leaderboard/game1
```

### Using WebSocket test client:
```bash
npm install -g wscat
wscat -c ws://localhost:3001
```

This documentation provides a complete reference for integrating with your gaming server backend.