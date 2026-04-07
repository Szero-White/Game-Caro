const BOARD_SIZE = 15;
const NEED_TO_WIN = 5;

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const modeSelect = document.getElementById("modeSelect");

let board = [];
let currentPlayer = "X";
let gameOver = false;
let gameMode = "pvp";
let aiThinking = false;

const HUMAN_PLAYER = "X";
const AI_PLAYER = "O";

function createBoard() {
  board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(""));
  boardElement.style.setProperty("--size", BOARD_SIZE.toString());
  boardElement.innerHTML = "";

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.type = "button";
      cell.dataset.row = row.toString();
      cell.dataset.col = col.toString();
      cell.setAttribute("aria-label", `o ${row + 1} cot ${col + 1}`);
      boardElement.appendChild(cell);
    }
  }

  currentPlayer = "X";
  gameOver = false;
  aiThinking = false;
  statusElement.textContent = "Luot: X";
}

function inBounds(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function countInDirection(row, col, dRow, dCol, player) {
  let r = row + dRow;
  let c = col + dCol;
  let count = 0;

  while (inBounds(r, c) && board[r][c] === player) {
    count += 1;
    r += dRow;
    c += dCol;
  }

  return count;
}

function hasWinAt(row, col, player) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dRow, dCol] of directions) {
    const connected =
      1 +
      countInDirection(row, col, dRow, dCol, player) +
      countInDirection(row, col, -dRow, -dCol, player);

    if (connected >= NEED_TO_WIN) {
      return true;
    }
  }

  return false;
}

function getWinningCells(row, col, player) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dRow, dCol] of directions) {
    const line = [[row, col]];

    let r = row + dRow;
    let c = col + dCol;
    while (inBounds(r, c) && board[r][c] === player) {
      line.push([r, c]);
      r += dRow;
      c += dCol;
    }

    r = row - dRow;
    c = col - dCol;
    while (inBounds(r, c) && board[r][c] === player) {
      line.unshift([r, c]);
      r -= dRow;
      c -= dCol;
    }

    if (line.length >= NEED_TO_WIN) {
      return line;
    }
  }

  return null;
}

function markWinningCells(cells) {
  for (const [row, col] of cells) {
    const index = row * BOARD_SIZE + col;
    const cell = boardElement.children[index];
    if (cell) {
      cell.classList.add("win");
    }
  }
}

function isBoardFull() {
  return board.every((row) => row.every((cell) => cell !== ""));
}

function getCellElement(row, col) {
  const index = row * BOARD_SIZE + col;
  return boardElement.children[index];
}

function placeMove(row, col, player) {
  board[row][col] = player;
  const cell = getCellElement(row, col);
  if (cell) {
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
  }
}

function wouldWin(row, col, player) {
  board[row][col] = player;
  const isWin = hasWinAt(row, col, player);
  board[row][col] = "";
  return isWin;
}

function hasNeighbor(row, col, distance = 2) {
  for (let dRow = -distance; dRow <= distance; dRow += 1) {
    for (let dCol = -distance; dCol <= distance; dCol += 1) {
      if (dRow === 0 && dCol === 0) {
        continue;
      }

      const r = row + dRow;
      const c = col + dCol;
      if (inBounds(r, c) && board[r][c] !== "") {
        return true;
      }
    }
  }

  return false;
}

function getCandidateMoves() {
  const moves = [];
  let hasAnyStone = false;

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (board[row][col] !== "") {
        hasAnyStone = true;
      }
    }
  }

  if (!hasAnyStone) {
    const center = Math.floor(BOARD_SIZE / 2);
    return [[center, center]];
  }

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (board[row][col] === "" && hasNeighbor(row, col)) {
        moves.push([row, col]);
      }
    }
  }

  return moves;
}

function evaluateDirection(row, col, dRow, dCol, player) {
  let forward = 0;
  let backward = 0;
  let openEnds = 0;

  let r = row + dRow;
  let c = col + dCol;
  while (inBounds(r, c) && board[r][c] === player) {
    forward += 1;
    r += dRow;
    c += dCol;
  }
  if (inBounds(r, c) && board[r][c] === "") {
    openEnds += 1;
  }

  r = row - dRow;
  c = col - dCol;
  while (inBounds(r, c) && board[r][c] === player) {
    backward += 1;
    r -= dRow;
    c -= dCol;
  }
  if (inBounds(r, c) && board[r][c] === "") {
    openEnds += 1;
  }

  const total = forward + backward;
  if (total >= 4) {
    return 100000;
  }
  if (total === 3 && openEnds === 2) {
    return 15000;
  }
  if (total === 3 && openEnds === 1) {
    return 3000;
  }
  if (total === 2 && openEnds === 2) {
    return 1200;
  }
  if (total === 2 && openEnds === 1) {
    return 300;
  }
  if (total === 1 && openEnds === 2) {
    return 80;
  }
  return 10;
}

function evaluateCell(row, col, player) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  let score = 0;
  for (const [dRow, dCol] of directions) {
    score += evaluateDirection(row, col, dRow, dCol, player);
  }
  return score;
}

function findBestMove() {
  const candidates = getCandidateMoves();
  if (candidates.length === 0) {
    return null;
  }

  for (const [row, col] of candidates) {
    if (wouldWin(row, col, AI_PLAYER)) {
      return [row, col];
    }
  }

  for (const [row, col] of candidates) {
    if (wouldWin(row, col, HUMAN_PLAYER)) {
      return [row, col];
    }
  }

  const center = Math.floor(BOARD_SIZE / 2);
  let best = candidates[0];
  let bestScore = -1;

  for (const [row, col] of candidates) {
    const attack = evaluateCell(row, col, AI_PLAYER);
    const defense = evaluateCell(row, col, HUMAN_PLAYER);
    const centerBonus = BOARD_SIZE - (Math.abs(row - center) + Math.abs(col - center));
    const score = attack * 1.2 + defense + centerBonus;

    if (score > bestScore) {
      bestScore = score;
      best = [row, col];
    }
  }

  return best;
}

function finishTurn(row, col, player) {
  const winningCells = getWinningCells(row, col, player);
  if (winningCells) {
    gameOver = true;
    markWinningCells(winningCells);
    statusElement.textContent = `Nguoi choi ${player} thang!`;
    return;
  }

  if (isBoardFull()) {
    gameOver = true;
    statusElement.textContent = "Hoa co!";
    return;
  }

  currentPlayer = player === "X" ? "O" : "X";

  if (gameMode === "ai" && currentPlayer === AI_PLAYER) {
    statusElement.textContent = "May dang danh...";
    queueAiMove();
    return;
  }

  statusElement.textContent = `Luot: ${currentPlayer}`;
}

function queueAiMove() {
  aiThinking = true;

  window.setTimeout(() => {
    if (gameOver) {
      aiThinking = false;
      return;
    }

    const bestMove = findBestMove();
    if (!bestMove) {
      aiThinking = false;
      return;
    }

    const [row, col] = bestMove;
    placeMove(row, col, AI_PLAYER);
    aiThinking = false;
    finishTurn(row, col, AI_PLAYER);
  }, 220);
}

function handleMove(event) {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  if (!target.classList.contains("cell") || gameOver || aiThinking) {
    return;
  }

  if (gameMode === "ai" && currentPlayer === AI_PLAYER) {
    return;
  }

  const row = Number(target.dataset.row);
  const col = Number(target.dataset.col);

  if (board[row][col] !== "") {
    return;
  }

  placeMove(row, col, currentPlayer);
  finishTurn(row, col, currentPlayer);
}

boardElement.addEventListener("click", handleMove);
resetBtn.addEventListener("click", createBoard);
modeSelect.addEventListener("change", (event) => {
  const target = event.target;
  if (target instanceof HTMLSelectElement) {
    gameMode = target.value;
    createBoard();
  }
});

createBoard();
