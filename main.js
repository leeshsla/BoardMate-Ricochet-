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


// 게임 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 16;
const cellSize = canvas.width / gridSize;
let moveCount = 0;
let selectedRobot = null;
let robots = {};
let target = {};
let walls = [];

// 게임 초기화
function initGame() {
  // 벽, 로봇, 목표 생성 로직 구현
  // ...
  drawBoard();
}

// 게임 보드 그리기
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 격자 그리기
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
  // 벽, 로봇, 목표 그리기 로직 구현
  // ...
}

// 로봇 이동 처리
function moveRobot(direction) {
  // 이동 로직 구현
  // ...
  moveCount++;
  document.getElementById('moveCount').textContent = `이동 횟수: ${moveCount}`;
  checkClear();
}

// 클리어 조건 확인
function checkClear() {
  if (selectedRobot.x === target.x && selectedRobot.y === target.y) {
    document.getElementById('message').textContent = `Clear! 총 ${moveCount}회 만에 성공했습니다.`;
    saveRecord();
  }
}

// 기록 저장
function saveRecord() {
  const recordRef = database.ref('records').push();
  recordRef.set({
    date: new Date().toISOString(),
    moves: moveCount
  });
  // 퍼즐 성공 횟수 확인 및 새로운 퍼즐 생성 로직 구현
  // ...
}

// 이벤트 리스너 설정
canvas.addEventListener('click', (event) => {
  // 클릭 위치 계산 및 로봇 선택/이동 처리
  // ...
});

// 게임 시작
initGame();

function saveRecord(puzzleId, moves) {
  const ref = db.ref('records').push();
  ref.set({
    puzzleId: puzzleId,
    moves: moves,
    date: new Date().toISOString()
  });
}

function checkClear() {
  if (selectedRobot.x === target.x && selectedRobot.y === target.y) {
    alert(`Clear! 총 ${moveCount}회 만에 성공했습니다.`);
    saveRecord(currentPuzzleId, moveCount);  // 여기에 기록 저장
  }
}

