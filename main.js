window.onload = function () {
  initGame();
};

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

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 16;
const cellSize = canvas.width / gridSize;
let moveCount = 0;
let selectedRobot = null;
let robots = {
  red: { x: 2, y: 2 },
  blue: { x: 5, y: 5 },
  green: { x: 8, y: 3 },
  yellow: { x: 12, y: 10 }
};
let target = { color: 'blue', x: 5, y: 5 };
let walls = []; // 벽은 추후 생성

function initGame() {
  drawBoard();
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 격자
  ctx.strokeStyle = '#aaa';
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

  // 로봇
  for (let color in robots) {
    const robot = robots[color];
    ctx.beginPath();
    ctx.arc(
      (robot.x + 0.5) * cellSize,
      (robot.y + 0.5) * cellSize,
      cellSize * 0.3,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = color;
    ctx.fill();
  }

  // 목표 위치
  ctx.beginPath();
  ctx.arc(
    (target.x + 0.5) * cellSize,
    (target.y + 0.5) * cellSize,
    cellSize * 0.3,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = target.color;
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', (target.x + 0.5) * cellSize, (target.y + 0.5) * cellSize);
}
