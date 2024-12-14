// src/utils/auth.js
export const checkAuth = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
};