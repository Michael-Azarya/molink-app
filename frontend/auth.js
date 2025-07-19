document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const API_URL = 'http://localhost:3001';

    let captchaAnswer = 0;

    function generateCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        captchaAnswer = num1 + num2;

        const captchaQuestionElements = document.querySelectorAll('#captcha-question');
        captchaQuestionElements.forEach(el => {
            el.textContent = `What is ${num1} + ${num2}?`;
        });
    }

    generateCaptcha();

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const userAnswer = parseInt(document.querySelector('#signup-form #captcha-input').value, 10);
            if (userAnswer !== captchaAnswer) {
                alert('Wrong captcha answer!');
                generateCaptcha();
                return;
            }

            const username = document.getElementById('signup-username').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            try {
                const response = await fetch(`${API_URL}/api/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });
                const data = await response.json();
                if (!response.ok) {
                    alert(`Error: ${data.message}`);
                    generateCaptcha();
                    return;
                }
                alert('Sign up successful! Please log in.');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Signup fetch error:', error);
                alert('An error occurred. Please try again.');
                generateCaptcha();
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const userAnswer = parseInt(document.querySelector('#login-form #captcha-input').value, 10);
            if (userAnswer !== captchaAnswer) {
                alert('Wrong captcha answer!');
                generateCaptcha();
                return;
            }

            const identifier = document.getElementById('login-identifier').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(`${API_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier, password })
                });
                const data = await response.json();
                if (!response.ok) {
                    alert(`Error: ${data.message}`);
                    generateCaptcha();
                    return;
                }
                localStorage.setItem('moLINK_token', data.token);
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Login fetch error:', error);
                alert('An error occurred. Please try again.');
                generateCaptcha();
            }
        });
    }
});
