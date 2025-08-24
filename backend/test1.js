import { io } from "socket.io-client";

// Adjust to your backend URL/port
const socket = io("http://localhost:3001", {
  transports: ["websocket"],
});

// Log any event we didn't explicitly handle
socket.onAny((event, data) => {
  console.log(`>>> Server event: ${event}`, data);
});

// Step 1: Connect
socket.on("connect", () => {
  console.log("Connected to server as", socket.id);

  // Step 2: Connect wallet
  socket.emit("connect_wallet", {
    walletAddress: "0x1234567890123456789012345678901234567890",
  });

  // Step 3: Join game after a short delay
  setTimeout(() => {
    socket.emit("join_game", { gameType: "game1" });
  }, 1000);

  // Step 4: Fake score update after another delay
  setTimeout(() => {
    // Replace this with an actual roomId after join_game response
    const testRoomId = "room-123"; 
    socket.emit("update_score", { roomId: testRoomId, score: 42 });
  }, 3000);

  // Step 5: End game after another delay
  setTimeout(() => {
    const testRoomId = "room-123"; 
    socket.emit("end_game", { roomId: testRoomId, winnerWallet: "0x1234567890123456789012345678901234567890" });
  }, 5000);

  // Step 6: Leave queue (in case no match found)
  setTimeout(() => {
    socket.emit("leave_queue", { gameType: "game1" });
  }, 7000);
});

// Handle disconnects
socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

// Handle errors
socket.on("error", (err) => {
  console.error("Server error:", err);
});