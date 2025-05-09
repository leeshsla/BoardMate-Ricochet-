const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const gridSize = 16;
const cellSize = canvas.width / gridSize;

// 로봇 상태 저장
const robots = {
    yellow: { x: 3, y: 5 }
};

let selectedRobot = null;
let validMoves = [];

// 격자판 그리기
function drawGrid() {
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            ctx.strokeStyle = '#aaa';
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

// 로봇 그리기
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

// 이동 경로 하이라이트
function drawHighlights() {
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    for (const move of validMoves) {
        ctx.fillRect(move.x * cellSize, move.y * cellSize, cellSize, cellSize);
    }
}

// 전체 그리기
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawHighlights();
    drawRobots();
}

// 가능한 이동 경로 계산 (벽 없음 가정)
function calculateMoves(x, y) {
    const moves = [];

    // 오른쪽
    for (let i = x + 1; i < gridSize; i++) {
        if (isOccupied(i, y)) break;
        moves.push({ x: i, y });
    }

    // 왼쪽
    for (let i = x - 1; i >= 0; i--) {
        if (isOccupied(i, y)) break;
        moves.push({ x: i, y });
    }

    // 아래
    for (let i = y + 1; i < gridSize; i++) {
        if (isOccupied(x, i)) break;
        moves.push({ x, y: i });
    }

    // 위
    for (let i = y - 1; i >= 0; i--) {
        if (isOccupied(x, i)) break;
        moves.push({ x, y: i });
    }

    return moves;
}

// 로봇 있는지 확인
function isOccupied(x, y) {
    return Object.values(robots).some(r => r.x === x && r.y === y);
}

// 마우스 클릭 이벤트 처리
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (selectedRobot) {
        // 경로 중 하나를 클릭했다면 로봇 이동
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

    // 클릭한 칸에 로봇이 있는지 확인
    for (const [color, pos] of Object.entries(robots)) {
        if (pos.x === x && pos.y === y) {
            selectedRobot = color;
            validMoves = calculateMoves(x, y);
            draw();
            return;
        }
    }

    // 그 외 클릭 시 선택 해제
    selectedRobot = null;
    validMoves = [];
    draw();
});

// 시작 시 보드 그리기
draw();
