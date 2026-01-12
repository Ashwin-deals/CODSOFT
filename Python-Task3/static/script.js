document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const lengthSlider = document.getElementById('length-slider');
    const lengthVal = document.getElementById('length-val');
    const uppercaseCb = document.getElementById('uppercase');
    const lowercaseCb = document.getElementById('lowercase');
    const numbersCb = document.getElementById('numbers');
    const symbolsCb = document.getElementById('symbols');
    const generateBtn = document.getElementById('generate-btn');
    const passwordDisplay = document.getElementById('password-display');
    const copyBtn = document.getElementById('copy-btn');
    const errorMessage = document.getElementById('error-message');

    // Update slider value display
    lengthSlider.addEventListener('input', () => {
        lengthVal.textContent = lengthSlider.value;
    });

    // Generate Password
    generateBtn.addEventListener('click', async () => {
        // Clear previous error
        errorMessage.textContent = '';

        const length = parseInt(lengthSlider.value);
        const upper = uppercaseCb.checked;
        const lower = lowercaseCb.checked;
        const digits = numbersCb.checked;
        const symbols = symbolsCb.checked;

        // Validation
        if (!upper && !lower && !digits && !symbols) {
            errorMessage.textContent = 'Please select at least one option.';
            return;
        }

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    length,
                    upper,
                    lower,
                    digits,
                    symbols
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            passwordDisplay.value = data.password;
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred while generating the password.';
        }
    });

    // Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        const password = passwordDisplay.value;
        if (!password) return;

        navigator.clipboard.writeText(password).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });
});
