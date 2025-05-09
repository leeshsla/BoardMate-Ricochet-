// Firebase 초기화
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

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
