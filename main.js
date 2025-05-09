const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const gridSize = 16;
const cellSize = canvas.width / gridSize;

// 격자판 그리기
function drawGrid() {
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            ctx.strokeStyle = '#aaa';
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

drawGrid();
