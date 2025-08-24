export class MatchmakingService {
    gameQueues = {
        game1: [],
        game2: []
    };
    activeRooms = new Map();
    generateRoomId() {
        return 'room_' + Math.random().toString(36).substr(2, 9);
    }
    findMatch(gameType, excludeWallet) {
        const queue = this.gameQueues[gameType];
        if (!queue)
            return undefined;
        return queue.find(player => player.wallet !== excludeWallet);
    }
    addToQueue(gameType, player) {
        if (!this.gameQueues[gameType]) {
            this.gameQueues[gameType] = [];
        }
        this.gameQueues[gameType].push(player);
    }
    removeFromQueue(gameType, wallet) {
        if (this.gameQueues[gameType]) {
            this.gameQueues[gameType] = this.gameQueues[gameType].filter(p => p.wallet !== wallet);
        }
    }
    isPlayerInQueue(gameType, wallet) {
        return this.gameQueues[gameType]?.some(p => p.wallet === wallet) || false;
    }
    getQueuePosition(gameType, wallet) {
        const queue = this.gameQueues[gameType];
        if (!queue)
            return -1;
        return queue.findIndex(p => p.wallet === wallet) + 1;
    }
    createRoom(roomId, gameType, gameSessionId, players) {
        const roomData = {
            id: roomId,
            gameType,
            gameSessionId,
            players,
            status: 'active',
            createdAt: new Date()
        };
        this.activeRooms.set(roomId, roomData);
    }
    getRoom(roomId) {
        return this.activeRooms.get(roomId);
    }
    deleteRoom(roomId) {
        this.activeRooms.delete(roomId);
    }
    updatePlayerScore(roomId, playerWallet, score) {
        const room = this.activeRooms.get(roomId);
        if (!room)
            return false;
        const player = room.players.find(p => p.wallet === playerWallet);
        if (!player)
            return false;
        player.score = score;
        return true;
    }
    removePlayerFromAllQueues(wallet) {
        Object.keys(this.gameQueues).forEach(gameType => {
            this.removeFromQueue(gameType, wallet);
        });
    }
    getStats() {
        return {
            activeRooms: this.activeRooms.size,
            queues: Object.keys(this.gameQueues).reduce((acc, gameType) => {
                acc[gameType] = this.gameQueues[gameType]?.length || 0;
                return acc;
            }, {})
        };
    }
    getAllActiveRooms() {
        return this.activeRooms;
    }
}
