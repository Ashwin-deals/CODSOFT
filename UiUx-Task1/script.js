document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation System ---
    const screens = {
        welcome: document.getElementById('welcome-screen'),
        name: document.getElementById('name-email-screen'),
        password: document.getElementById('password-screen'),
        otp: document.getElementById('otp-screen'),
        personalization: document.getElementById('personalization-screen'),
        success: document.getElementById('success-screen')
    };

    function showScreen(screenName) {
        // Hide all screens
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
            setTimeout(() => {
                if (!screen.classList.contains('active')) {
                    screen.classList.add('hidden');
                }
            }, 300); // Wait for transition
        });

        // Show target screen
        const target = screens[screenName];
        target.classList.remove('hidden');
        // Small delay to allow CSS transition to catch the display change
        setTimeout(() => {
            target.classList.add('active');
        }, 10);
    }

    // Back Buttons
    document.getElementById('btn-back-name').addEventListener('click', () => showScreen('welcome'));
    document.getElementById('btn-back-pass').addEventListener('click', () => showScreen('name'));
    document.getElementById('btn-back-otp').addEventListener('click', () => showScreen('password'));

    // --- Screen 1: Welcome ---
    document.getElementById('btn-get-started').addEventListener('click', () => {
        showScreen('name');
    });

    // --- Screen 2: Name & Email ---
    const inputName = document.getElementById('input-name');
    const inputEmail = document.getElementById('input-email');
    const btnNextName = document.getElementById('btn-next-name');

    function validateNameEmail() {
        const nameValid = inputName.value.trim().length > 0;
        const emailValid = inputEmail.value.includes('@') && inputEmail.value.includes('.');

        if (nameValid && emailValid) {
            btnNextName.removeAttribute('disabled');
        } else {
            // Optional: Disable button visually or just do nothing on click
            // For this logic, we'll just check on click for simplicity 
            // but requirements say "Enable Next only when valid" implies disabled state.
            // Let's assume we can style :disabled in CSS or logic handles it to not proceed.
            // We'll proceed if valid.
        }
        return nameValid && emailValid;
    }

    btnNextName.addEventListener('click', () => {
        if (validateNameEmail()) {
            showScreen('password');
        } else {
            alert('Please enter a valid name and email.');
        }
    });

    // --- Screen 3: Password ---
    const inputPass = document.getElementById('input-password');
    const btnTogglePass = document.getElementById('btn-toggle-pass');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    const btnNextPass = document.getElementById('btn-next-pass');

    // Toggle Visibility
    btnTogglePass.addEventListener('click', () => {
        const type = inputPass.getAttribute('type') === 'password' ? 'text' : 'password';
        inputPass.setAttribute('type', type);
        btnTogglePass.textContent = type === 'password' ? '👁️' : '🙈';
    });

    // Strength Meter
    inputPass.addEventListener('input', () => {
        const val = inputPass.value;
        let strength = 0;
        let text = 'Weak';

        if (val.length > 0) strength = 1;
        if (val.length >= 6) strength = 2; // Medium
        if (val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val)) {
            strength = 3; // Strong
            text = 'Strong';
        } else if (strength === 2) {
            text = 'Medium';
        }

        strengthBar.setAttribute('data-strength', strength);
        strengthText.textContent = text;
    });

    btnNextPass.addEventListener('click', () => {
        if (inputPass.value.length >= 6) {
            showScreen('otp');
            startOtpTimer();
        } else {
            alert('Password must be at least 6 characters.');
        }
    });

    // --- Screen 4: OTP ---
    const otpInputs = document.querySelectorAll('.otp-input');
    const otpTimerDisplay = document.getElementById('otp-timer');
    const btnVerify = document.getElementById('btn-verify');
    const btnResend = document.getElementById('btn-resend');
    let timerInterval;

    // Auto-focus logic
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1) {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value) {
                if (index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });
    });

    // Timer Logic
    function startOtpTimer() {
        let timeLeft = 30;
        btnResend.disabled = true;
        btnResend.style.opacity = '0.5';

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            otpTimerDisplay.textContent = `00:${timeLeft < 10 ? '0' + timeLeft : timeLeft}`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                btnResend.disabled = false;
                btnResend.style.opacity = '1';
                otpTimerDisplay.textContent = "00:00";
            }
        }, 1000);
    }

    btnResend.addEventListener('click', () => {
        startOtpTimer();
        alert('Code resent!');
    });

    btnVerify.addEventListener('click', () => {
        // Mock verification: Check if all filled
        const otpCode = Array.from(otpInputs).map(i => i.value).join('');
        if (otpCode.length === 4) {
            showScreen('personalization');
        } else {
            alert('Please enter the 4-digit code.');
        }
    });

    // --- Screen 5: Personalization ---
    const interests = document.querySelectorAll('.interest-card');
    const btnContinue = document.getElementById('btn-continue-interests');
    let selectedInterests = new Set();

    interests.forEach(card => {
        card.addEventListener('click', () => {
            const id = card.id;
            if (selectedInterests.has(id)) {
                selectedInterests.delete(id);
                card.setAttribute('aria-pressed', 'false');
            } else {
                selectedInterests.add(id);
                card.setAttribute('aria-pressed', 'true');
            }
        });
    });

    btnContinue.addEventListener('click', () => {
        if (selectedInterests.size > 0) {
            showScreen('success');
        } else {
            alert('Please select at least one interest.');
        }
    });

    // --- Screen 6: Success ---
    document.getElementById('btn-dashboard').addEventListener('click', () => {
        alert('Demo Complete! Redirecting to dashboard...');
    });

});
