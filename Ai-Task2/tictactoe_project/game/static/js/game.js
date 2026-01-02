/**
 * Tic Tac Toe Frontend Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // DOM Elements
    // -------------------------------------------------------------------------
    const boardEl = document.getElementById('board');
    const cells = Array.from(document.querySelectorAll('.cell'));
    const difficultySelect = document.getElementById('difficulty');
    const turnIndicator = document.getElementById('turn-indicator');
    const scoreValX = document.getElementById('score-x');
    const scoreValDraw = document.getElementById('score-draw');
    const scoreValO = document.getElementById('score-o');
    const restartBtn = document.getElementById('restart-btn');
    const resetScoresBtn = document.getElementById('reset-scores-btn');

    // Dynamically create AI Message element if it doesn't exist
    let aiMessageEl = document.getElementById('ai-message');
    if (!aiMessageEl) {
        aiMessageEl = document.createElement('div');
        aiMessageEl.id = 'ai-message';
        // Basic styling for the message
        aiMessageEl.style.marginTop = '20px';
        aiMessageEl.style.minHeight = '1.5em';
        aiMessageEl.style.fontStyle = 'italic';
        aiMessageEl.style.color = '#555';
        aiMessageEl.style.textAlign = 'center';
        aiMessageEl.style.fontWeight = '500';

        // Insert after the board
        boardEl.parentNode.insertBefore(aiMessageEl, boardEl.nextSibling);
    }

    // -------------------------------------------------------------------------
    // Constants & State
    // -------------------------------------------------------------------------
    const AI_MESSAGES = [
        "I saw that coming.",
        "Nice move! But not good enough.",
        "Think carefully... I always do.",
        "I'm calculating the perfect move.",
        "That was an interesting choice.",
        "You humans make this fun.",
        "Is that your best strategy?",
        "I am learning from your mistakes.",
        "Logic suggests you are in trouble.",
        "My algorithms are superior."
    ];

    let board = Array(9).fill(" ");
    let gameActive = true;
    let scores = {
        x: 0,
        draw: 0,
        o: 0
    };

    const MOVE_API_URL = "move/";

    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------
    function init() {
        updateUI();
        turnIndicator.textContent = "Your turn (X)";

        // Add event listeners
        cells.forEach(cell => cell.addEventListener('click', handleCellClick));
        restartBtn.addEventListener('click', restartGame);
        resetScoresBtn.addEventListener('click', resetScores);
        difficultySelect.addEventListener('change', () => {
            restartGame();
        });
    }

    // -------------------------------------------------------------------------
    // Core Logic
    // -------------------------------------------------------------------------
    async function handleCellClick(e) {
        const cell = e.target;
        const index = parseInt(cell.dataset.index);

        if (!gameActive || board[index] !== " ") {
            return;
        }

        // 1. Player Move
        makeMove(index, "X");

        // 2. Disable UI & Show Loading
        setBoardActive(false);
        turnIndicator.textContent = "AI thinking...";
        // Clear message while thinking (or keep previous?) - Prompt implies update AFTER play.
        // Let's keep it until new one arrives.

        // 3. Send to Server
        try {
            const data = await sendMoveToServer(board, difficultySelect.value);

            if (data.error) {
                console.error(data.error);
                alert("Error: " + data.error);
                setBoardActive(true);
                return;
            }

            // Apply AI Move
            if (data.aiMove !== null && data.aiMove !== undefined) {
                makeMove(data.aiMove, "O");
                updateAiPersonality(); // Show new message
            }

            // Check Game Over State
            if (data.gameOver) {
                handleGameOver(data);
            } else {
                turnIndicator.textContent = "Your turn (X)";
                setBoardActive(true);
            }

        } catch (err) {
            console.error(err);
            turnIndicator.textContent = "Connection Error!";
            setBoardActive(true);
        }
    }

    function makeMove(index, player) {
        board[index] = player;
        const cell = cells[index];
        cell.classList.add(player.toLowerCase());
        cell.classList.add('filled');
        cell.textContent = player;
    }

    function updateAiPersonality() {
        const randomIndex = Math.floor(Math.random() * AI_MESSAGES.length);
        aiMessageEl.textContent = AI_MESSAGES[randomIndex];
        // Add a subtle animation/transition class if desired, but keeping it simple as requested.
        aiMessageEl.style.opacity = 0;
        setTimeout(() => aiMessageEl.style.opacity = 1, 50); // Simple fade toggle
        aiMessageEl.style.transition = "opacity 0.5s ease";
    }

    async function sendMoveToServer(currentBoard, difficulty) {
        const csrftoken = getCookie('csrftoken');
        const response = await fetch(MOVE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                board: currentBoard,
                difficulty: difficulty
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return await response.json();
    }

    function handleGameOver(data) {
        gameActive = false;

        if (data.winningLine) {
            data.winningLine.forEach(idx => {
                cells[idx].classList.add('winner');
            });
        }

        if (data.winner === 'X') {
            turnIndicator.textContent = "You Win! 🎉";
            scores.x++;
            scoreValX.textContent = scores.x;
            aiMessageEl.textContent = "Impossible... errors in my calculations?";
        } else if (data.winner === 'O') {
            turnIndicator.textContent = "AI Wins! 🤖";
            scores.o++;
            scoreValO.textContent = scores.o;
            aiMessageEl.textContent = "As expected. Victory is mine.";
        } else {
            turnIndicator.textContent = "It's a Draw! 🤝";
            scores.draw++;
            scoreValDraw.textContent = scores.draw;
            aiMessageEl.textContent = "A stalemate. You are a worthy opponent.";
        }

        boardEl.classList.add('disabled');
    }

    function restartGame() {
        board = Array(9).fill(" ");
        gameActive = true;
        turnIndicator.textContent = "Your turn (X)";
        aiMessageEl.textContent = ""; // Clear message

        cells.forEach(cell => {
            cell.textContent = "";
            cell.className = "cell";
        });

        boardEl.classList.remove('disabled');
    }

    function resetScores() {
        scores = { x: 0, draw: 0, o: 0 };
        scoreValX.textContent = "0";
        scoreValDraw.textContent = "0";
        scoreValO.textContent = "0";
        restartGame();
    }

    function setBoardActive(active) {
        if (active) {
            boardEl.classList.remove('disabled');
        } else {
            boardEl.classList.add('disabled');
        }
    }

    function updateUI() {
        cells.forEach((cell, i) => {
            const val = board[i];
            cell.textContent = val === " " ? "" : val;
            if (val !== " ") {
                cell.classList.add(val.toLowerCase(), 'filled');
            }
        });
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    init();
});
