const socket = io();
let player = null;

socket.on('player', (assignedPlayer) => {
    player = assignedPlayer;
    alert(`You are Player ${player}`);
});

const cells = document.querySelectorAll('.cell');
const resetButton = document.getElementById('reset');
const turnDisplay = document.createElement('div');
turnDisplay.id = 'turnDisplay';
document.body.insertBefore(turnDisplay, document.getElementById('game'));

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const index = cell.getAttribute('data-index');
        socket.emit('move', index);
    });
});

resetButton.addEventListener('click', () => {
    socket.emit('reset');
});

socket.on('update', (gameState) => {
    cells.forEach((cell, index) => {
        cell.textContent = gameState[index];
    });
});

socket.on('turn', (currentPlayer) => {
    turnDisplay.textContent = `${currentPlayer}'s turn`;
});

socket.on('gameOver', (winner) => {
    if (winner === 'Draw') {
        alert('The game is a draw!');
        turnDisplay.textContent = 'Game Over: Draw';
    } else {
        alert(`Player ${winner} wins!`);
        turnDisplay.textContent = `Game Over: Player ${winner} wins!`;
    }
    socket.emit('reset');
});

socket.on('playerLeft', () => {
    alert('Other player left. You win!');
    turnDisplay.textContent = 'Other player left. You win!';
    socket.emit('reset');
});

socket.on('full', () => {
    alert('The game is full. Please try again later.');
});
