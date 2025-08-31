import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  console.log("✅ Server B connected");
  ws.send(JSON.stringify({ type: "join", room: "room123", id: "ServerB" }));
});

ws.on("message", (data) => {
  console.log("📩 [ServerB] got:", data.toString());

  setTimeout(() => {
    ws.send(JSON.stringify({ type: "message", msg: "Hello from B" }));
  }, 1000);
});
