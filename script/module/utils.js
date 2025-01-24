import { showLogin } from "./login.js";

export const logout = () => {
    localStorage.removeItem('token');
    showLogin();
}

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
}

export const convertToBase64 = (credentials) => {
    return btoa(credentials)
}