// Game state management
let gameState = {
  dailyCredits: 0,
  totalCredits: 40,
  lastPlayDate: null,
  maxDailyCredits: 10
};

// Load game state from localStorage
function loadGameState() {
  const saved = localStorage.getItem('skillswap_game_state');
  if (saved) {
    gameState = { ...gameState, ...JSON.parse(saved) };
  }
  
  // Reset daily credits if it's a new day
  const today = new Date().toDateString();
  if (gameState.lastPlayDate !== today) {
    gameState.dailyCredits = 0;
    gameState.lastPlayDate = today;
    saveGameState();
  }
  
  updateCreditsDisplay();
}

// Save game state to localStorage
function saveGameState() {
  localStorage.setItem('skillswap_game_state', JSON.stringify(gameState));
}

// Update credits display
function updateCreditsDisplay() {
  document.getElementById('dailyCredits').textContent = gameState.dailyCredits;
  document.getElementById('totalCredits').textContent = gameState.totalCredits;
}

// Add credits with daily limit check
function addCredits(amount) {
  if (gameState.dailyCredits >= gameState.maxDailyCredits) {
    alert('Daily credit limit reached! Come back tomorrow for more games.');
    return false;
  }
  
  gameState.dailyCredits += amount;
  gameState.totalCredits += amount;
  gameState.lastPlayDate = new Date().toDateString();
  
  saveGameState();
  updateCreditsDisplay();
  
  return true;
}

// Word Puzzle Game
let wordPuzzleState = {
  currentWord: '',
  letters: [],
  targetWords: ['SKILL', 'LEARN', 'TEACH', 'SHARE', 'GROW', 'CODE', 'HELP', 'WORK']
};

function startWordPuzzle() {
  document.getElementById('wordPuzzleGame').style.display = 'flex';
  generateWordPuzzle();
}

function generateWordPuzzle() {
  const word = wordPuzzleState.targetWords[Math.floor(Math.random() * wordPuzzleState.targetWords.length)];
  wordPuzzleState.currentWord = word;
  
  // Create letter grid with target word letters + random letters
  const letters = word.split('');
  const extraLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => !letters.includes(l));
  
  // Add some random letters
  for (let i = 0; i < 30 - letters.length; i++) {
    letters.push(extraLetters[Math.floor(Math.random() * extraLetters.length)]);
  }
  
  // Shuffle letters
  wordPuzzleState.letters = letters.sort(() => Math.random() - 0.5);
  
  document.getElementById('targetWord').textContent = word;
  
  const grid = document.getElementById('letterGrid');
  grid.innerHTML = '';
  
  wordPuzzleState.letters.forEach(letter => {
    const cell = document.createElement('div');
    cell.className = 'letter-cell';
    cell.textContent = letter;
    cell.onclick = () => selectLetter(cell, letter);
    grid.appendChild(cell);
  });
  
  document.getElementById('wordInput').value = '';
  document.getElementById('wordResult').innerHTML = '';
}

function selectLetter(cell, letter) {
  const input = document.getElementById('wordInput');
  input.value += letter;
  cell.classList.add('selected');
  cell.onclick = null;
}

function checkWord() {
  const input = document.getElementById('wordInput').value.toUpperCase();
  const result = document.getElementById('wordResult');
  
  if (input === wordPuzzleState.currentWord) {
    result.innerHTML = '<div class="success">Correct! You earned 2 credits!</div>';
    if (addCredits(2)) {
      setTimeout(() => {
        closeGame();
      }, 2000);
    }
  } else {
    result.innerHTML = '<div class="error">Try again!</div>';
    // Reset selection
    document.getElementById('wordInput').value = '';
    document.querySelectorAll('.letter-cell').forEach(cell => {
      cell.classList.remove('selected');
      cell.onclick = () => selectLetter(cell, cell.textContent);
    });
  }
}

// Sudoku Game
let sudokuState = {
  puzzle: [],
  solution: [],
  given: []
};

function startSudoku() {
  document.getElementById('sudokuGame').style.display = 'flex';
  generateNewSudoku();
}

function generateNewSudoku() {
  // Simple sudoku puzzle (4x4 for simplicity)
  const puzzles = [
    {
      puzzle: [
        [1, 0, 3, 0],
        [0, 3, 0, 1],
        [3, 0, 1, 0],
        [0, 1, 0, 3]
      ],
      solution: [
        [1, 2, 3, 4],
        [4, 3, 2, 1],
        [3, 4, 1, 2],
        [2, 1, 4, 3]
      ]
    },
    {
      puzzle: [
        [0, 2, 0, 4],
        [4, 0, 2, 0],
        [0, 4, 0, 2],
        [2, 0, 4, 0]
      ],
      solution: [
        [1, 2, 3, 4],
        [4, 3, 2, 1],
        [3, 4, 1, 2],
        [2, 1, 4, 3]
      ]
    }
  ];
  
  const selected = puzzles[Math.floor(Math.random() * puzzles.length)];
  sudokuState.puzzle = selected.puzzle.map(row => [...row]);
  sudokuState.solution = selected.solution.map(row => [...row]);
  sudokuState.given = selected.puzzle.map(row => row.map(cell => cell !== 0));
  
  renderSudoku();
}

function renderSudoku() {
  const grid = document.getElementById('sudokuGrid');
  grid.innerHTML = '';
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const cell = document.createElement('input');
      cell.className = 'sudoku-cell';
      cell.type = 'number';
      cell.min = '1';
      cell.max = '4';
      
      if (sudokuState.given[i][j]) {
        cell.value = sudokuState.puzzle[i][j];
        cell.disabled = true;
        cell.classList.add('given');
      } else {
        cell.value = sudokuState.puzzle[i][j] || '';
      }
      
      cell.oninput = (e) => {
        const value = parseInt(e.target.value) || 0;
        sudokuState.puzzle[i][j] = value;
      };
      
      grid.appendChild(cell);
    }
  }
  
  document.getElementById('sudokuResult').innerHTML = '';
}

function checkSudoku() {
  const result = document.getElementById('sudokuResult');
  let isCorrect = true;
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (sudokuState.puzzle[i][j] !== sudokuState.solution[i][j]) {
        isCorrect = false;
        break;
      }
    }
    if (!isCorrect) break;
  }
  
  if (isCorrect) {
    result.innerHTML = '<div class="success">Excellent! You earned 3 credits!</div>';
    if (addCredits(3)) {
      setTimeout(() => {
        closeGame();
      }, 2000);
    }
  } else {
    result.innerHTML = '<div class="error">Not quite right. Keep trying!</div>';
  }
}

// Riddle Game
let riddleState = {
  currentRiddle: null,
  riddles: [
    { question: "I have keys but no locks. I have space but no room. You can enter, but you can't go outside. What am I?", answer: "keyboard" },
    { question: "What has hands but cannot clap?", answer: "clock" },
    { question: "I'm tall when I'm young, and short when I'm old. What am I?", answer: "candle" },
    { question: "What gets wet while drying?", answer: "towel" },
    { question: "What can you break, even if you never pick it up or touch it?", answer: "promise" },
    { question: "What goes up but never comes down?", answer: "age" },
    { question: "I have branches, but no fruit, trunk, or leaves. What am I?", answer: "bank" },
    { question: "What has one eye but cannot see?", answer: "needle" },
    { question: "What has many teeth but cannot bite?", answer: "comb" },
    { question: "The more you take, the more you leave behind. What am I?", answer: "footsteps" }
  ]
};

function startRiddle() {
  document.getElementById('riddleGame').style.display = 'flex';
  generateNewRiddle();
}

function generateNewRiddle() {
  const riddle = riddleState.riddles[Math.floor(Math.random() * riddleState.riddles.length)];
  riddleState.currentRiddle = riddle;
  
  document.getElementById('riddleQuestion').textContent = riddle.question;
  document.getElementById('riddleInput').value = '';
  document.getElementById('riddleResult').innerHTML = '';
}

function checkRiddle() {
  const input = document.getElementById('riddleInput').value.toLowerCase().trim();
  const result = document.getElementById('riddleResult');
  
  if (input === riddleState.currentRiddle.answer.toLowerCase()) {
    result.innerHTML = '<div class="success">Correct! You earned 1 credit!</div>';
    if (addCredits(1)) {
      setTimeout(() => {
        generateNewRiddle();
      }, 2000);
    }
  } else {
    result.innerHTML = '<div class="error">Not quite right. Try again!</div>';
  }
}

function closeGame() {
  document.getElementById('wordPuzzleGame').style.display = 'none';
  document.getElementById('sudokuGame').style.display = 'none';
  document.getElementById('riddleGame').style.display = 'none';
}

// Initialize game state when page loads
document.addEventListener('DOMContentLoaded', loadGameState);