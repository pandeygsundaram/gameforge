// roomManager.js
import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const rooms = {}; // roomId -> { clients: [], scores: { score1, score2 } }

wss.on("connection", (ws) => {
  console.log("connection  established");
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      // 🔹 Joining a room
      if (data.type === "join") {
        if (!rooms[data.room]) {
          rooms[data.room] = { clients: [], scores: { score1: 0, score2: 0 } };
        }
        rooms[data.room].clients.push(ws);

        // Send current scores when someone joins
        ws.send(
          JSON.stringify({
            type: "scoreUpdate",
            score1: rooms[data.room].scores.score1,
            score2: rooms[data.room].scores.score2,
          })
        );
      }

      // 🔹 Score update event
      if (data.type === "scoreUpdate") {
        const room = rooms[data.room];
        if (!room) return;

        if (data.player === 1) {
          room.scores.score1 += 1;
        } else if (data.player === 2) {
          room.scores.score2 += 1;
        }

        // Broadcast new scores to all clients in room
        room.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "scoreUpdate",
                score1: room.scores.score1,
                score2: room.scores.score2,
              })
            );
          }
        });
      }
    } catch (err) {
      console.error("❌ Error handling message:", err);
    }
  });

  // 🔹 Cleanup when client disconnects
  ws.on("close", () => {
    for (const roomId in rooms) {
      rooms[roomId].clients = rooms[roomId].clients.filter((c) => c !== ws);
    }
  });
});

console.log("✅ Room Manager running on ws://localhost:8080");
