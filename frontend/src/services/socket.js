import io from 'socket.io-client';

const url = process.env.REACT_APP_URL ? process.env.REACT_APP_URL : "http://localhost:5000";

const socket = io.connect(url, {query: {token: "teste"}})

export { socket };