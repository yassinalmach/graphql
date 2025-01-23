import { showLogin } from "../login.js";

const API_URL = 'https://learn.zone01oujda.ma/api/auth/signin';

export const setloginToken = async (credentials) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                }
        });
        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        localStorage.setItem('token', data);
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

export const logout = () => {
    localStorage.removeItem('token');
    showLogin();
}

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
}