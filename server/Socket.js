const socketIo = require('socket.io');

let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'user-login'],
        },
        transports: ['websocket'],
    });

    io.on('connection', (socket) => {
        console.log('A user connected:');


        socket.on('disconnect', () => {
            console.log('User disconnected:');
        });
    });
};

const getIo = () => io;

module.exports = {
    initializeSocket,
    getIo
};
