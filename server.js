const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let players = [];
let gameState = Array(9).fill(null);
let currentPlayer = 'X';

const checkWinner = (board) => {
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return board.includes(null) ? null : 'Draw';
};

io.on('connection', (socket) => {
    if (players.length < 2) {
        players.push(socket);
        socket.emit('player', players.length === 1 ? 'X' : 'O');
        socket.emit('turn', currentPlayer);
    } else {
        socket.emit('full');
        socket.disconnect();
    }

    socket.on('disconnect', () => {
        players = players.filter(player => player !== socket);
        if (players.length === 1) {
            players[0].emit('playerLeft');
        } else {
            gameState = Array(9).fill(null);
            currentPlayer = 'X';
        }
    });

    socket.on('move', (index) => {
        if (gameState[index] === null && socket === players[0] && currentPlayer === 'X' ||
            gameState[index] === null && socket === players[1] && currentPlayer === 'O') {
            gameState[index] = currentPlayer;
            const winner = checkWinner(gameState);
            if (winner) {
                io.emit('gameOver', winner);
                gameState = Array(9).fill(null);
                currentPlayer = 'X';
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                io.emit('update', gameState);
                io.emit('turn', currentPlayer);
            }
        }
    });

    socket.on('reset', () => {
        gameState = Array(9).fill(null);
        currentPlayer = 'X';
        io.emit('update', gameState);
        io.emit('turn', currentPlayer);
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
