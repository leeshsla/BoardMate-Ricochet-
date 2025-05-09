// === Firebase 초기화 ===
const firebaseConfig = {
  apiKey: "AIzaSyA1zNzJ3bIjW3RWUjtIfGMzq_DTyAlbb5U",
  authDomain: "ricochet-2206d.firebaseapp.com",
  databaseURL: "https://ricochet-2206d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ricochet-2206d",
  storageBucket: "ricochet-2206d.firebasestorage.app",
  messagingSenderId: "939751232472",
  appId: "1:939751232472:web:bc666402e20c35627e98ad"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// === 캔버스 및 상태 ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 16;
const cellSize = canvas.width / gridSize;
let moveCount = 0;
let selectedRobot = null;
let robots = {};
let target = {};
let walls = [];

// === 유틸리티 ===
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
  ctx.fillRect((gridSize/2 - 1) * cellSize, (gridSize/2 - 1) * cellSize, cellSize * 2, cellSize * 2);

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

  // 목표 지점
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

// === 이동 ===
function moveToDirection(dir) {
  if (!selectedRobot) return;
  let robot = robots[selectedRobot];
  while (true) {
    let nx = robot.x + (dir === "right" ? 1 : dir === "left" ? -1 : 0);
    let ny = robot.y + (dir === "down" ? 1 : dir === "up" ? -1 : 0);

    if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) break;
    if (Object.values(robots).some(r => r !== robot && r.x === nx && r.y === ny)) break;
    if (walls.some(w => (w[0][0] === robot.x && w[0][1] === robot.y && w[1][0] === nx && w[1][1] === ny) ||
                        (w[1][0] === robot.x && w[1][1] === robot.y && w[0][0] === nx && w[0][1] === ny))) break;
    robot.x = nx;
    robot.y = ny;
  }
  moveCount++;
  checkClear();
  drawBoard();
}

function checkClear() {
  if (robots[target.color].x === target.x && robots[target.color].y === target.y) {
    alert(`Clear! 총 ${moveCount}회 만에 성공했습니다.`);
    saveRecord(moveCount);
  }
}

function saveRecord(moves) {
  console.log("🔥 저장 시도됨:", moves);
  db.ref('records').push({
    date: new Date().toISOString(),
    moves: moves
  }).then(() => {
    console.log("✅ 저장 성공!");
  }).catch((err) => {
    console.error("❌ 저장 실패:", err);
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
      drawBoard();
    });
}

canvas.addEventListener("click", (e) => {
  const x = Math.floor(e.offsetX / cellSize);
  const y = Math.floor(e.offsetY / cellSize);
  for (let color in robots) {
    const r = robots[color];
    if (r.x === x && r.y === y) {
      selectedRobot = color;
      return;
    }
  }
});

// 시작
window.onload = initGame;
