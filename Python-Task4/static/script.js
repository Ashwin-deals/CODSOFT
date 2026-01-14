document.addEventListener('DOMContentLoaded', () => {
    const choices = document.querySelectorAll('.choice-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const userChoiceEl = document.getElementById('user-choice');
    const computerChoiceEl = document.getElementById('computer-choice');
    const resultMessageEl = document.getElementById('result-message');
    const userScoreEl = document.getElementById('user-score');
    const computerScoreEl = document.getElementById('computer-score');
    const drawsScoreEl = document.getElementById('draws-score');
    const historyList = document.getElementById('round-history-list');

    const emojiMap = {
        rock: '🪨',
        paper: '📄',
        scissors: '✂️'
    };

    choices.forEach(button => {
        button.addEventListener('click', async () => {
            const userChoice = button.getAttribute('data-choice');
            toggleButtons(false);

            try {
                const response = await fetch('/play', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ choice: userChoice })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                updateUI(data);

            } catch (error) {
                console.error('Error:', error);
                resultMessageEl.textContent = "Error! Try again.";
                toggleButtons(true);
            }
        });
    });

    playAgainBtn.addEventListener('click', resetRound);

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/reset', { method: 'POST' });
                if (!response.ok) throw new Error('Reset failed');

                const data = await response.json();

                userScoreEl.textContent = data.user_score;
                computerScoreEl.textContent = data.computer_score;
                drawsScoreEl.textContent = data.draws;

                historyList.innerHTML = '';
                resetRound();
                resultMessageEl.textContent = "Scores reset. Play again!";

            } catch (error) {
                console.error('Error resetting:', error);
            }
        });
    }

    function updateUI(data) {
        userChoiceEl.textContent = emojiMap[data.user_choice];
        computerChoiceEl.textContent = emojiMap[data.computer_choice];

        userChoiceEl.classList.remove('pop-in');
        computerChoiceEl.classList.remove('pop-in');
        void userChoiceEl.offsetWidth;
        void computerChoiceEl.offsetWidth;
        userChoiceEl.classList.add('pop-in');
        computerChoiceEl.classList.add('pop-in');

        if (data.result === 'win') {
            resultMessageEl.textContent = "You Win!";
        } else if (data.result === 'draw') {
            resultMessageEl.textContent = "It's a Draw!";
        } else {
            resultMessageEl.textContent = "You Lose!";
        }

        resultMessageEl.classList.remove('win', 'lose', 'draw');

        if (data.result === 'win') resultMessageEl.classList.add('win');
        else if (data.result === 'draw') resultMessageEl.classList.add('draw');
        else resultMessageEl.classList.add('lose');

        userScoreEl.textContent = data.user_score;
        computerScoreEl.textContent = data.computer_score;
        drawsScoreEl.textContent = data.draws;

        addToHistory(data);

        document.querySelector('.buttons-container').style.display = 'none';
        playAgainBtn.style.display = 'inline-block';
    }

    function addToHistory(data) {
        const li = document.createElement('li');
        li.className = `history-item ${data.result}`;

        const resultText = data.result === 'draw' ? 'Draw' :
            data.result === 'win' ? 'Win' : 'Loss';

        li.innerHTML = `
            <span>Round ${historyList.children.length + 1}</span>
            <span>${emojiMap[data.user_choice]} vs ${emojiMap[data.computer_choice]}</span>
            <strong>${resultText}</strong>
        `;

        historyList.prepend(li);

        if (historyList.children.length > 5) {
            historyList.removeChild(historyList.lastChild);
        }
    }

    function resetRound() {
        resultMessageEl.textContent = "Let's Play!";
        resultMessageEl.classList.remove('win', 'lose', 'draw');
        userChoiceEl.textContent = '❔';
        computerChoiceEl.textContent = '❔';

        document.querySelector('.buttons-container').style.display = 'flex';
        playAgainBtn.style.display = 'none';

        toggleButtons(true);
    }

    function toggleButtons(enable) {
        choices.forEach(btn => {
            btn.disabled = !enable;
            btn.style.opacity = enable ? '1' : '0.5';
            btn.style.cursor = enable ? 'pointer' : 'not-allowed';
        });
    }
});
