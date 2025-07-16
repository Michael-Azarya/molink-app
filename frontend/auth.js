document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const API_URL = 'http://localhost:3001';

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('signup-username').value;
            const password = document.getElementById('signup-password').value;
            try {
                const response = await fetch(`${API_URL}/api/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                if (!response.ok) {
                    alert(`Error: ${data.message}`);
                    return;
                }
                alert('Sign up successful! Please log in.');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Signup fetch error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            try {
                const response = await fetch(`${API_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                if (!response.ok) {
                    alert(`Error: ${data.message}`);
                    return;
                }
                localStorage.setItem('moLINK_token', data.token);
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Login fetch error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }
});
