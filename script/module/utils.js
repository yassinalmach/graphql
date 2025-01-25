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

export const formatXP = (xp) => {
    if (xp >= 1000000) {
        return `${(xp / 1000000).toFixed(2)} MB`;
    } else if (xp >= 1000) {
        return `${(xp / 1000).toFixed(1)} kB`;
    }
    return xp.toString();
};