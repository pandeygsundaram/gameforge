import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  console.log("✅ Server A connected");
  ws.send(JSON.stringify({ type: "join", room: "room123", id: "ServerA" }));

  setTimeout(() => {
    ws.send(JSON.stringify({ type: "message", msg: "Hello from A" }));
  }, 1000);
});

ws.on("message", (data) => {
  console.log("📩 [ServerA] got:", data.toString());
});
