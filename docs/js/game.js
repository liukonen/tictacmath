/**
 * TIC TAC MATH - Main Game Logic (ES6+, Vanilla JS)
 * A bright, playful math game with Microsoft Agents
 */

/* =====================================================================
   GameState Class - Central State Management
   ===================================================================== */

class GameState {
  constructor() {
    this.board = Array(9).fill(null);
    this.gameActive = true;
    this.currentPlayer = 'user'; // 'user' or 'agent'
    this.playerScore = 0;
    this.agentScore = 0;
    this.mathType = this.getFromStorage('mathType', '+');
    this.complexity = parseInt(this.getFromStorage('complexity', '1'));
    this.agentName = this.getFromStorage('agentName', 'Merlin');
    this.currentEquations = this.generateEquations();
    this.pendingCellIndex = null;
  }

  generateEquations() {
    const equations = [];
    for (let i = 0; i < 9; i++) {
      equations.push(this.generateEquation());
    }
    return equations;
  }

  generateEquation() {
    const max = Math.pow(10, this.complexity);
    let num1 = Math.floor(Math.random() * max) + 1;
    let num2 = Math.floor(Math.random() * max) + 1;

    // Adjust for subtraction and division
    if (this.mathType === '-' && num1 < num2) {
      [num1, num2] = [num2, num1]; // Ensure positive result
    }
    if (this.mathType === '÷') {
      num1 *= num2; // Ensure evenly divisible
    }

    return { num1, num2 };
  }

  calculateAnswer(equation) {
    const { num1, num2 } = equation;
    switch (this.mathType) {
      case '+':
        return num1 + num2;
      case '-':
        return num1 - num2;
      case 'x':
        return num1 * num2;
      case '÷':
        return num1 / num2;
      default:
        return 0;
    }
  }

  getOperatorSymbol() {
    return this.mathType === '÷' ? '÷' : this.mathType;
  }

  getOperatorText() {
    switch (this.mathType) {
      case '+':
        return 'plus';
      case '-':
        return 'minus';
      case 'x':
        return 'times';
      case '÷':
        return 'divided by';
      default:
        return '';
    }
  }

  checkForWinner() {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[b] === this.board[c]
      ) {
        return this.board[a]; // 'user' or 'agent'
      }
    }

    // Check for tie
    if (this.board.every((cell) => cell !== null)) {
      return 'tie';
    }

    return null; // Game ongoing
  }

  hasEmptyCells() {
    return this.board.some((cell) => cell === null);
  }

  getEmptyCells() {
    return this.board.reduce((empty, cell, index) => {
      if (cell === null) empty.push(index);
      return empty;
    }, []);
  }

  reset() {
    this.board = Array(9).fill(null);
    this.gameActive = true;
    this.currentPlayer = 'user';
    this.currentEquations = this.generateEquations();
    this.pendingCellIndex = null;
  }

  getFromStorage(key, defaultValue) {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored : defaultValue;
  }

  saveToStorage(key, value) {
    localStorage.setItem(key, value);
  }
}

/* =====================================================================
   GameUI Class - UI Rendering & Updates
   ===================================================================== */

class GameUI {
  constructor(gameState) {
    this.gameState = gameState;
    this.gameBoard = document.getElementById('gameBoard');
    this.speechBubble = document.getElementById('speechContent');
    this.agentNameEl = document.getElementById('agentName');
    this.playerScoreEl = document.getElementById('playerScore');
    this.agentScoreEl = document.getElementById('agentScore');
    this.agentPlaceholder = document.getElementById('agentPlaceholder');
    this.modalOverlay = document.getElementById('modalOverlay');
    this.inputDisplay = document.getElementById('inputDisplay');
    this.modalEquation = document.getElementById('modalEquation');
    this.numericKeypad = document.getElementById('numericKeypad');
    this.speechBubbleElement = document.getElementById('speechBubble');
    this.infoModal = document.getElementById('infoModal');
  }

  render() {
    this.renderBoard();
    this.updateScores();
    this.updateAgentInfo();
  }

  renderBoard() {
    this.gameBoard.innerHTML = '';
    this.gameState.board.forEach((player, index) => {
      const cell = this.createCell(index, player);
      this.gameBoard.appendChild(cell);
    });
  }

  createCell(index, player) {
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.dataset.index = index;

    const equation = this.gameState.currentEquations[index];
    const equationText = `${equation.num1} ${this.gameState.getOperatorSymbol()} ${equation.num2}`;

    if (player === null) {
      // Empty cell
      cell.innerHTML = `<span class="cell-equation">${equationText}</span>`;
      cell.onclick = () => this.handleCellClick(index);
    } else {
      // Taken cell
      cell.classList.add('cell-taken');
      if (player === 'user') {
        cell.classList.add('cell-player');
        cell.innerHTML = `<span class="cell-equation">${equationText}</span><span class="cell-token">✓</span>`;
      } else {
        cell.classList.add('cell-agent');
        cell.innerHTML = `<span class="cell-equation">${equationText}</span><span class="cell-token">✗</span>`;
      }
      cell.disabled = true;
    }

    return cell;
  }

  handleCellClick(index) {
    if (this.gameState.board[index] === null && this.gameState.gameActive) {
      this.gameState.pendingCellIndex = index;
      // Make agent fly to the clicked cell
      const cell = document.querySelector(`.cell[data-index="${index}"]`);
      if (cell && typeof agentManager !== 'undefined' && agentManager && agentManager.currentAgent) {
        agentManager.moveAgentToElement(cell);
      }
      this.showInputModal(index);
    }
  }

  showInputModal(cellIndex) {
    const equation = this.gameState.currentEquations[cellIndex];
    const equationText = `${equation.num1} ${this.gameState.getOperatorSymbol()} ${equation.num2} = ?`;
    this.modalEquation.textContent = equationText;
    this.inputDisplay.textContent = '0';
    this.modalOverlay.classList.remove('hidden');
    // Reset input display
    setTimeout(() => {
      this.inputDisplay.focus();
    }, 100);
    document.body.style.overflow = 'hidden';
  }

  hideInputModal() {
    this.modalOverlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
    this.inputDisplay.textContent = '0';
  }

  updateInputDisplay(value) {
    this.inputDisplay.textContent = value;
  }

  updateScores() {
    this.playerScoreEl.textContent = this.gameState.playerScore;
    this.agentScoreEl.textContent = this.gameState.agentScore;
  }

  updateAgentInfo() {
    this.agentNameEl.textContent = this.gameState.agentName;
  }

  speak(text) {
    this.speechBubble.textContent = text;
    this.speechBubbleElement.classList.remove('bubble-thinking');
    // Trigger text-to-speech via agent manager if available
    if (typeof agentManager !== 'undefined' && agentManager) {
      agentManager.speakTTS(text);
    }
  }

  showThinking() {
    this.speechBubble.textContent = 'Thinking';
    this.speechBubbleElement.classList.add('bubble-thinking');
  }

  agentCelebrate() {
    this.agentPlaceholder.classList.remove('agent-thinking');
    this.agentPlaceholder.classList.add('agent-celebrating');
    // Also trigger agent animation if available
    if (typeof agentManager !== 'undefined' && agentManager && agentManager.currentAgent) {
      agentManager.celebrateWin();
    }
    setTimeout(() => {
      this.agentPlaceholder.classList.remove('agent-celebrating');
    }, 2000);
  }

  agentThink() {
    this.agentPlaceholder.classList.add('agent-thinking');
    // Also trigger agent animation if available
    if (typeof agentManager !== 'undefined' && agentManager && agentManager.currentAgent) {
      agentManager.showThinkingAnimation();
    }
  }

  agentStopThinking() {
    this.agentPlaceholder.classList.remove('agent-thinking');
    // Stop agent animation if available
    if (typeof agentManager !== 'undefined' && agentManager && agentManager.currentAgent) {
      agentManager.stopAnimation();
    }
  }

  showGameOverMessage(winner) {
    if (winner === 'user') {
      this.speak('🎉 Congratulations! You won!');
      this.gameState.playerScore++;
      // Play celebration animation for player
      this.agentCelebrate();
    } else if (winner === 'agent') {
      this.speak('I won this round! Well played though!');
      this.gameState.agentScore++;
      // Play celebration animation for agent
      this.agentCelebrate();
    } else {
      this.speak('It\'s a tie! Great game!');
      // Play a neutral animation for tie
      this.agentThink();
      setTimeout(() => this.agentStopThinking(), 600);
    }
    this.updateScores();
  }

  showInfoModal() {
    this.infoModal.style.display = 'flex';
  }

  hideInfoModal() {
    this.infoModal.style.display = 'none';
  }
}

/* =====================================================================
   Game Logic Controller
   ===================================================================== */

class GameController {
  constructor() {
    this.gameState = new GameState();
    this.ui = new GameUI(this.gameState);
    this.inputBuffer = '0';
    this.initializeEventListeners();
    this.ui.render();
    // Give agent a moment to load, then speak
    setTimeout(() => {
      if (typeof agentManager !== 'undefined' && agentManager && agentManager.agentReady) {
        this.ui.speak(`Ready to play Tic Tac Math? I'm ${this.gameState.agentName}!`);
      } else {
        this.ui.speak(`Ready to play Tic Tac Math?`);
      }
    }, 500);
  }

  initializeEventListeners() {
    // Numeric keypad
    document.querySelectorAll('.keypad-btn[data-key]').forEach((btn) => {
      btn.addEventListener('click', (e) => this.handleKeypadInput(e.target.dataset.key));
    });

    // Modal buttons
    document.getElementById('deleteBtn').addEventListener('click', () => this.handleDelete());
    document.getElementById('clearBtn').addEventListener('click', () => this.handleClear());
    document.getElementById('modalSubmitBtn').addEventListener('click', () => this.handleSubmitAnswer());
    document.getElementById('modalCancelBtn').addEventListener('click', () => this.handleCancelAnswer());

    // Configuration selects
    document.getElementById('mathTypeSelect').addEventListener('change', (e) => this.handleMathTypeChange(e));
    document.getElementById('complexitySelect').addEventListener('change', (e) => this.handleComplexityChange(e));
    document.getElementById('agentSelect').addEventListener('change', (e) => this.handleAgentChange(e));

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => this.handleReset());

    // Info button
    document.getElementById('infoBtn').addEventListener('click', () => this.ui.showInfoModal());
    document.getElementById('closeInfoBtn').addEventListener('click', () => this.ui.hideInfoModal());

    // Close info modal on background click
    document.getElementById('infoModal').addEventListener('click', (e) => {
      if (e.target.id === 'infoModal') {
        this.ui.hideInfoModal();
      }
    });

    // Close input modal on background click
    this.ui.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.ui.modalOverlay) {
        this.handleCancelAnswer();
      }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
  }

  handleKeypadInput(key) {
    // If at initial '0', replace it; otherwise append
    if (this.inputBuffer === '0') {
      this.inputBuffer = key;
    } else if (this.inputBuffer.length < 10) {
      this.inputBuffer += key;
    }
    this.ui.updateInputDisplay(this.inputBuffer);
  }

  handleDelete() {
    if (this.inputBuffer.length > 1) {
      this.inputBuffer = this.inputBuffer.slice(0, -1);
    } else {
      this.inputBuffer = '0';
    }
    this.ui.updateInputDisplay(this.inputBuffer);
  }

  handleClear() {
    this.inputBuffer = '0';
    this.ui.updateInputDisplay(this.inputBuffer);
  }

  handleSubmitAnswer() {
    const cellIndex = this.gameState.pendingCellIndex;
    if (cellIndex === null || cellIndex === undefined) return;
    
    const userAnswer = parseInt(this.inputBuffer, 10);
    const equation = this.gameState.currentEquations[cellIndex];
    const correctAnswer = this.gameState.calculateAnswer(equation);

    this.ui.hideInputModal();
    this.inputBuffer = '0';

    if (userAnswer === correctAnswer) {
      this.gameState.board[cellIndex] = 'user';
      this.ui.speak(`✓ Correct! ${equation.num1} ${this.gameState.getOperatorText()} ${equation.num2} = ${correctAnswer}`);
    } else {
      this.gameState.board[cellIndex] = 'agent';
      this.ui.speak(`✗ Sorry! ${equation.num1} ${this.gameState.getOperatorText()} ${equation.num2} = ${correctAnswer}`);
    }

    this.ui.render();
    const winner = this.gameState.checkForWinner();

    if (winner) {
      this.gameState.gameActive = false;
      setTimeout(() => {
        this.ui.showGameOverMessage(winner);
        // Move agent to center for celebration
        if (typeof agentManager !== 'undefined' && agentManager && agentManager.currentAgent) {
          agentManager.currentAgent.moveTo(window.innerWidth / 2, 100);
        }
        setTimeout(() => this.handleReset(), 2500);
      }, 1500);
    } else {
      // Move agent away so it's not in the way for next turn
      if (typeof agentManager !== 'undefined' && agentManager && agentManager.currentAgent) {
        agentManager.currentAgent.moveTo(150, 50);
      }
      setTimeout(() => this.agentTurn(), 1500);
    }
  }

  handleCancelAnswer() {
    this.ui.hideInputModal();
    this.inputBuffer = '0';
    this.gameState.pendingCellIndex = null;
    this.ui.updateInputDisplay('0');
  }

  agentTurn() {
    const emptyCells = this.gameState.getEmptyCells();
    if (emptyCells.length === 0) return;

    this.ui.showThinking();
    this.ui.agentThink();

    // Simulate agent thinking
    const delay = Math.random() * 2000 + 1000;
    setTimeout(() => {
      const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const equation = this.gameState.currentEquations[randomIndex];
      const answer = this.gameState.calculateAnswer(equation);

      // Make agent fly to the cell it's choosing
      const cell = document.querySelector(`.cell[data-index="${randomIndex}"]`);
      if (cell && typeof agentManager !== 'undefined' && agentManager && agentManager.currentAgent) {
        agentManager.moveAgentToElement(cell);
      }

      this.gameState.board[randomIndex] = 'agent';
      this.ui.agentStopThinking();
      this.ui.speak(`I choose: ${equation.num1} ${this.gameState.getOperatorText()} ${equation.num2} = ${answer}`);
      this.ui.render();

      // Move agent away from the board after it picks
      setTimeout(() => {
        if (typeof agentManager !== 'undefined' && agentManager && agentManager.currentAgent) {
          // Move agent to top-left corner (out of the way)
          agentManager.currentAgent.moveTo(150, 50);
        }
      }, 1500);

      const winner = this.gameState.checkForWinner();
      if (winner) {
        this.gameState.gameActive = false;
        setTimeout(() => {
          this.ui.showGameOverMessage(winner);
          // Move agent to celebration position
          if (typeof agentManager !== 'undefined' && agentManager && agentManager.currentAgent) {
            agentManager.currentAgent.moveTo(window.innerWidth / 2, 100);
          }
          setTimeout(() => this.handleReset(), 2500);
        }, 1500);
      }
    }, delay);
  }

  handleMathTypeChange(e) {
    this.gameState.mathType = e.target.value;
    this.gameState.saveToStorage('mathType', e.target.value);
    this.handleReset();
  }

  handleComplexityChange(e) {
    this.gameState.complexity = parseInt(e.target.value, 10);
    this.gameState.saveToStorage('complexity', e.target.value);
    this.handleReset();
  }

  handleAgentChange(e) {
    this.gameState.agentName = e.target.value;
    this.gameState.saveToStorage('agentName', e.target.value);
    this.ui.updateAgentInfo();
    // Load the new agent if available
    if (typeof agentManager !== 'undefined' && agentManager) {
      agentManager.initializeAgent(e.target.value);
    }
    this.ui.speak(`Hello! I'm ${this.gameState.agentName}. Let's play!`);
  }

  handleReset() {
    this.gameState.reset();
    this.inputBuffer = '0';  // Reset input buffer
    this.ui.render();
    this.ui.speak(`Ready to play? Your turn!`);
    this.gameState.gameActive = true;
  }

  handleKeyboardInput(e) {
    if (this.ui.modalOverlay.classList.contains('hidden')) return;

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      this.handleKeypadInput(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      this.handleDelete();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.handleSubmitAnswer();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.handleCancelAnswer();
    }
  }
}

/* =====================================================================
   Initialize Game on DOM Ready
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  // Wait a moment for agent manager to initialize
  setTimeout(() => {
    console.log('Starting game controller...');
    console.log('Agent manager status:', typeof agentManager !== 'undefined' ? 'loaded' : 'not loaded');
    if (typeof agentManager !== 'undefined' && agentManager) {
      console.log('Agent ready:', agentManager.agentReady, 'Agent name:', agentManager.agentName);
    }
    new GameController();
  }, 1000);
});
