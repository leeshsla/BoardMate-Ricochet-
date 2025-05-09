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
      if (walls.some(w =>
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
  fetch("gameData.json")
    .then(res => res.json())
    .then(data => {
      walls = data.walls;
      robots = data.robots;
      target = data.target;
      moveCount = 0;
      selectedRobot = null;
      possibleMoves = [];
      drawBoard();
    });
}

window.onload = initGame;
