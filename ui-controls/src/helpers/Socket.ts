import { Manager } from 'socket.io-client';

const manager = new Manager('ws://localhost:3000/', {
  reconnectionDelayMax: 10000,
});
const socket = manager.socket('/');

socket.on('connect', () => {
  console.log('Connected to server');
});

export default socket;