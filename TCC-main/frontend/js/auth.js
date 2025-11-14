// auth.js
class Auth {
    static isLoggedIn() {
        return localStorage.getItem('user') !== null;
    }

    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static logout() {
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    }

    static requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = '../index.html';
            return false;
        }
        return true;
    }
}

// Logout button handler
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            Auth.logout();
        });
    }
});