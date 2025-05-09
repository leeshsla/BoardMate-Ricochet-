const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const gridSize = 16;
const cellSize = canvas.width / gridSize;

const robots = {
    yellow: { x: 3, y: 5 }
};

const walls = {}; // 벽 데이터

let selectedRobot = null;
let validMoves = [];

// 👉 벽 추가 함수
function addWall(x, y, direction) {
    const key = `${x},${y}`;
    if (!walls[key]) walls[key] = {};
    walls[key][direction] = true;

    const dx = { left: -1, right: 1, top: 0, bottom: 0 };
    const dy = { left: 0, right: 0, top: -1, bottom: 1 };
    const opp = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' };

    const nx = x + dx[direction];
    const ny = y + dy[direction];
    const nkey = `${nx},${ny}`;
    if (!walls[nkey]) walls[nkey] = {};
    walls[nkey][opp[direction]] = true;
}

// 👉 벽 확인 함수
function hasWall(x, y, direction) {
    const key = `${x},${y}`;
    return walls[key] && walls[key][direction];
}

// 👉 격자판 그리기
function drawGrid() {
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            ctx.strokeStyle = '#ccc';
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

// 👉 벽 그리기
function drawWalls() {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const key = `${x},${y}`;
            if (!walls[key]) continue;

            const px = x * cellSize;
            const py = y * cellSize;

            if (walls[key].top) {
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + cellSize, py);
                ctx.stroke();
            }

            if (walls[key].right) {
                ctx.beginPath();
                ctx.moveTo(px + cellSize, py);
                ctx.lineTo(px + cellSize, py + cellSize);
                ctx.stroke();
            }

            if (walls[key].bottom) {
                ctx.beginPath();
                ctx.moveTo(px, py + cellSize);
                ctx.lineTo(px + cellSize, py + cellSize);
                ctx.stroke();
            }

            if (walls[key].left) {
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px, py + cellSize);
                ctx.stroke();
            }
        }
    }

    ctx.lineWidth = 1;
}

// 👉 로봇 그리기
function drawRobots() {
    for (const [color, pos] of Object.entries(robots)) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(
            pos.x * cellSize + cellSize / 2,
            pos.y * cellSize + cellSize / 2,
            cellSize / 3,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }
}

// 👉 이동 경로 하이라이트
function drawHighlights() {
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    for (const move of validMoves) {
        ctx.fillRect(move.x * cellSize, move.y * cellSize, cellSize, cellSize);
    }
}

// 👉 전체 그리기
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawWalls();
    drawHighlights();
    drawRobots();
}

// 👉 로봇 이동 가능한 경로 계산 (벽 포함)
function calculateMoves(x, y) {
    const moves = [];

    // 오른쪽
    for (let i = x + 1; i < gridSize; i++) {
        if (hasWall(i - 1, y, 'right') || hasWall(i, y, 'left') || isOccupied(i, y)) break;
        moves.push({ x: i, y });
    }

    // 왼쪽
    for (let i = x - 1; i >= 0; i--) {
        if (hasWall(i + 1, y, 'left') || hasWall(i, y, 'right') || isOccupied(i, y)) break;
        moves.push({ x: i, y });
    }

    // 아래
    for (let i = y + 1; i < gridSize; i++) {
        if (hasWall(x, i - 1, 'bottom') || hasWall(x, i, 'top') || isOccupied(x, i)) break;
        moves.push({ x: x, y: i });
    }

    // 위
    for (let i = y - 1; i >= 0; i--) {
        if (hasWall(x, i + 1, 'top') || hasWall(x, i, 'bottom') || isOccupied(x, i)) break;
        moves.push({ x: x, y: i });
    }

    return moves;
}

// 👉 다른 로봇과 충돌 확인
function isOccupied(x, y) {
    return Object.values(robots).some(r => r.x === x && r.y === y);
}

// 👉 마우스 클릭 이벤트
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (selectedRobot) {
        for (const move of validMoves) {
            if (move.x === x && move.y === y) {
                robots[selectedRobot] = { x, y };
                selectedRobot = null;
                validMoves = [];
                draw();
                return;
            }
        }
    }

    for (const [color, pos] of Object.entries(robots)) {
        if (pos.x === x && pos.y === y) {
            selectedRobot = color;
            validMoves = calculateMoves(x, y);
            draw();
            return;
        }
    }

    selectedRobot = null;
    validMoves = [];
    draw();
});

// 👉 테스트용 벽 몇 개 추가
addWall(5, 5, 'right');
addWall(5, 5, 'bottom');
addWall(8, 5, 'left');
addWall(3, 8, 'top');

// 👉 초기 그리기
draw();
