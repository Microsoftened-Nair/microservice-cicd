const AUTH_API = 'http://localhost:5001';
const PRODUCT_API = 'http://localhost:5002';

document.addEventListener('DOMContentLoaded', () => {
    updateNav();
});

function updateNav() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const authLinks = document.getElementById('auth-links');
    const guestLinks = document.getElementById('guest-links');
    const usernameDisplay = document.getElementById('username-display');

    if (token) {
        if (authLinks) authLinks.style.display = 'flex';
        if (guestLinks) guestLinks.style.display = 'none';
        if (usernameDisplay) usernameDisplay.textContent = `Hello, ${username}`;
    } else {
        if (authLinks) authLinks.style.display = 'none';
        if (guestLinks) guestLinks.style.display = 'flex';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}
