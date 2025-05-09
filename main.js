// === Firebase 초기화 ===
const firebaseConfig = {
  apiKey: "AIzaSyA1zNzJ3bIjW3RWUjtIfGMzq_DTyAlbb5U",
  authDomain: "ricochet-2206d.firebaseapp.com",
  databaseURL: "https://ricochet-2206d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ricochet-2206d",
  storageBucket: "ricochet-2206d.appspot.com",
  messagingSenderId: "939751232472",
  appId: "1:939751232472:web:bc666402e20c35627e98ad"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// === 게임 상태 ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 16;
const cellSize = canvas.width / gridSize;
let moveCount = 0;
let selectedRobot = null;
let robots = {};
let target = {};
let walls = [];
let possibleMoves = [];


  function isWallBetween(x1, y1, x2, y2) {
  return isWallBetween(w => {
    const [[ax, ay], [bx, by]] = w;
    return (ax === x1 && ay === y1 && bx === x2 && by === y2) ||
           (ax === x2 && ay === y2 && bx === x1 && by === y1);
  });
}

function generatePuzzle() {
  const gridSize = 16;
  const walls = [];

  // === 1. 외벽 ===
  for (let i = 0; i < gridSize; i++) {
    walls.push([[i, 0], [i + 1, 0]]);
    walls.push([[i, gridSize], [i + 1, gridSize]]);
    walls.push([[0, i], [0, i + 1]]);
    walls.push([[gridSize, i], [gridSize, i + 1]]);
  }

  // === 2. 중앙 2x2 박스 ===
  const cx = 7, cy = 7;
  walls.push([[cx, cy], [cx + 1, cy]]);
  walls.push([[cx + 1, cy], [cx + 2, cy]]);
  walls.push([[cx, cy + 2], [cx + 1, cy + 2]]);
  walls.push([[cx + 1, cy + 2], [cx + 2, cy + 2]]);
  walls.push([[cx, cy], [cx, cy + 1]]);
  walls.push([[cx, cy + 1], [cx, cy + 2]]);
  walls.push([[cx + 2, cy], [cx + 2, cy + 1]]);
  walls.push([[cx + 2, cy + 1], [cx + 2, cy + 2]]);

  // === 3. 1칸짜리 내부 벽 (8개) ===
  const oneWalls = [
    [0, 2], [0, 5], [15, 3], [15, 6],
    [0, 10], [0, 13], [15, 11], [15, 14]
  ];
  oneWalls.forEach(([x, y]) => {
    const dx = x === 0 ? 1 : -1;
    walls.push([[x, y], [x + dx, y]]);
  });

  // === 4. ㄱ자 벽 (16개, 4개 * 4쿼드런트) ===
  const l_shapes = [];
  const used = new Set();

  function addL(x, y, key) {
    const wall1 = [[x, y], [x + 1, y]];
    const wall2 = [[x + 1, y], [x + 1, y + 1]];
    const overlap = l_shapes.some(w => JSON.stringify(w).includes(JSON.stringify(wall1)) || JSON.stringify(w).includes(JSON.stringify(wall2)));
    if (used.has(`${x},${y},${key}`) || overlap) return false;
    l_shapes.push([wall1, wall2]);
    used.add(`${x},${y},${key}`);
    walls.push(wall1, wall2);
    return true;
  }

  [[0,0],[8,0],[0,8],[8,8]].forEach(([qx,qy]) => {
    let count = 0, tries = 0;
    while (count < 4 && tries < 100) {
      const x = qx + 1 + Math.floor(Math.random() * 5);
      const y = qy + 1 + Math.floor(Math.random() * 5);
      if (addL(x, y, `${qx},${qy}`)) count++;
      tries++;
    }
  });

  // === 5. 로봇 ===
  const occupied = new Set();
  walls.flat().forEach(([x, y]) => occupied.add(`${x},${y}`));
  for (let x = 7; x <= 8; x++) for (let y = 7; y <= 8; y++) occupied.add(`${x},${y}`);

  const robots = {};
  const colors = ["red", "blue", "green", "yellow"];
  function randPos() {
    while (true) {
      const x = Math.floor(Math.random() * 16);
      const y = Math.floor(Math.random() * 16);
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        occupied.add(key);
        return { x, y };
      }
    }
  }
  colors.forEach(c => robots[c] = randPos());

  // === 6. 목표 지점: ㄱ자 벽의 내부 한 칸에 놓이게 ===
  const [_, [lx, ly]] = l_shapes[Math.floor(Math.random() * l_shapes.length)];
  const target = {
    color: colors[Math.floor(Math.random() * colors.length)],
    x: lx,
    y: ly + 1
  };

  return { walls, robots, target };
}


// === 그리기 ===
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#ccc";
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(canvas.width, i * cellSize);
    ctx.stroke();
  }

  // 중앙 2x2 검정 타일
  ctx.fillStyle = "black";
  ctx.fillRect((gridSize / 2 - 1) * cellSize, (gridSize / 2 - 1) * cellSize, cellSize * 2, cellSize * 2);

  // 벽
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  for (let wall of walls) {
    const [[x1, y1], [x2, y2]] = wall;
    ctx.beginPath();
    ctx.moveTo(x1 * cellSize, y1 * cellSize);
    ctx.lineTo(x2 * cellSize, y2 * cellSize);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  // 가능한 이동 위치 표시
  for (let move of possibleMoves) {
    ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
    ctx.fillRect(move.x * cellSize, move.y * cellSize, cellSize, cellSize);
  }

  // 목표
  ctx.fillStyle = target.color;
  ctx.beginPath();
  ctx.arc((target.x + 0.5) * cellSize, (target.y + 0.5) * cellSize, cellSize * 0.3, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("★", (target.x + 0.5) * cellSize, (target.y + 0.5) * cellSize);

  // 로봇
  for (let color in robots) {
    const r = robots[color];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc((r.x + 0.5) * cellSize, (r.y + 0.5) * cellSize, cellSize * 0.3, 0, 2 * Math.PI);
    ctx.fill();
  }

  document.getElementById("moveCount").textContent = `이동 횟수: ${moveCount}`;
}

// === 이동 가능한 위치 계산 ===
function getAllMoves(robot) {
  const directions = ["up", "down", "left", "right"];
  let moves = [];

  for (let dir of directions) {
    let { x, y } = robot;
    while (true) {
      let nx = x + (dir === "right" ? 1 : dir === "left" ? -1 : 0);
      let ny = y + (dir === "down" ? 1 : dir === "up" ? -1 : 0);

      if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) break;
      if (Object.values(robots).some(r => r.x === nx && r.y === ny)) break;
      if (isWallBetween(w =>
        (w[0][0] === x && w[0][1] === y && w[1][0] === nx && w[1][1] === ny) ||
        (w[1][0] === x && w[1][1] === y && w[0][0] === nx && w[0][1] === ny)
      )) break;

      x = nx;
      y = ny;
    }

    if (x !== robot.x || y !== robot.y) {
      moves.push({ x, y });
    }
  }
if (isWallBetween(x, y, nx, ny)) break;

  return moves;
}

// === 클릭 처리 ===
canvas.addEventListener("click", (e) => {
  const x = Math.floor(e.offsetX / cellSize);
  const y = Math.floor(e.offsetY / cellSize);

  if (selectedRobot && possibleMoves.some(m => m.x === x && m.y === y)) {
    robots[selectedRobot].x = x;
    robots[selectedRobot].y = y;
    selectedRobot = null;
    possibleMoves = [];
    moveCount++;
    checkClear();
    drawBoard();
    return;
  }

  for (let color in robots) {
    const r = robots[color];
    if (r.x === x && r.y === y) {
      selectedRobot = color;
      possibleMoves = getAllMoves(r);
      drawBoard();
      return;
    }
  }

  selectedRobot = null;
  possibleMoves = [];
  drawBoard();
});

// === 클리어 확인 ===
function checkClear() {
  if (robots[target.color].x === target.x && robots[target.color].y === target.y) {
    alert(`Clear! 총 ${moveCount}회 만에 성공했습니다.`);
    saveRecord(moveCount);
  }
}

// === 기록 저장 ===
function saveRecord(moves) {
  db.ref('records').push({
    date: new Date().toISOString(),
    moves: moves
  });
}

// === 초기화 ===
function initGame() {
  const data = generatePuzzle(); // ← 랜덤 퍼즐 생성
  walls = data.walls;
  robots = data.robots;
  target = data.target;
  moveCount = 0;
  selectedRobot = null;
  possibleMoves = [];
  drawBoard();
}


window.onload = initGame;
