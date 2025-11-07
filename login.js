document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const loginBox = document.querySelector('.login-box');

    // For this demo, we'll use a dummy username and password.
    // In a real application, you'd validate this against a server.
    const DUMMY_USER = "Ajju";
    const DUMMY_PASS = "Ajju123";

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === DUMMY_USER && password === DUMMY_PASS) {
            // On successful login, store a session token/flag and the username
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            
            // Redirect to the chat page
            window.location.href = 'index.html';
        } else {
            errorMessage.textContent = 'Invalid credentials. (Hint: Ajju / Ajju123)';
            loginBox.classList.add('shake');
            setTimeout(() => {
                loginBox.classList.remove('shake');
            }, 500);
        }
    });
});