import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDB, disconnectDB } from './config/database.js';
import { SocketController } from './controllers/socketController.js';
import { createApiRoutes } from './routes/apiRoutes.js';
dotenv.config();
class GameServer {
    app;
    server;
    io;
    socketController;
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        this.socketController = new SocketController(this.io);
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
        this.setupGracefulShutdown();
    }
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }
    setupRoutes() {
        this.app.use('/api', createApiRoutes(this.socketController));
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            this.socketController.handleConnection(socket);
        });
    }
    setupGracefulShutdown() {
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully');
            this.server.close(async () => {
                await disconnectDB();
                process.exit(0);
            });
        });
    }
    async start() {
        try {
            await initializeDB();
            const PORT = process.env.PORT || 3001;
            this.server.listen(PORT, () => {
                console.log(`🚀 Gaming server running on port ${PORT}`);
                console.log(`📊 Available endpoints:`);
                console.log(`   GET /api/health - Server health check`);
                console.log(`   GET /api/stats - Server statistics`);
                console.log(`   GET /api/user/:wallet/games - User game history`);
                console.log(`   GET /api/leaderboard/:gameType - Game leaderboard`);
                console.log(`🎮 Socket.IO events:`);
                console.log(`   connect_wallet - Connect user wallet`);
                console.log(`   join_game - Join game queue`);
                console.log(`   leave_queue - Leave game queue`);
                console.log(`   update_score - Update player score`);
                console.log(`   end_game - End current game`);
            });
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
}
// Start the server
const gameServer = new GameServer();
gameServer.start();
