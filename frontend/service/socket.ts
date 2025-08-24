import { io } from 'socket.io-client';

const socket = io('http://52.91.171.165:3001', {
  autoConnect: false,
  transports: ['websocket'],
  reconnection: true,
});

export default socket;