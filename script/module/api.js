import { showLogin } from "./login.js";

const API_URL = 'https://learn.zone01oujda.ma/api/auth/signin';
const GRAPHQL_ENDPOINT = 'https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql';

export const getloginToken = async (credentials) => {
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
        return data
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

export const executeQuery = async (query) => {
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ query })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.errors) throw data.errors[0].message

        return data.data;
    } catch (error) {
        console.error(error);
        localStorage.removeItem('token')
        showLogin();
    }
}