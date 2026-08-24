import { io } from 'socket.io-client';
import { SERVER_URL } from './api';

let socket = null;

/** Returns the shared Socket.IO connection, creating it once per page load if a token is present. Never fabricates a connection when unauthenticated. */
export const getSocket = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('sport_matrix_token');
    if (!token) return null;

    if (!socket) {
        socket = io(SERVER_URL, { auth: { token }, autoConnect: true, reconnection: true });
    } else if (!socket.connected) {
        socket.auth = { token };
        socket.connect();
    }
    return socket;
};

export const joinBranchRoom = (branchId) => {
    const s = getSocket();
    if (s && branchId) s.emit('join-branch', branchId);
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
