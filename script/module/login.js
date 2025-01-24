import { getloginToken } from "./api.js";
import { showProfile } from "./profile.js";
import { convertToBase64 } from "./utils.js";

export const showLogin = () => {
    const app = document.getElementById('app');
    app.innerHTML = /*html*/`
        <div class="login-container">
            <form id="loginForm"class="login-form">
                <h1>Login</h1>
                <input type="text" id="identifier" placeholder="Username or Email" required>
                <input type="password" id="password" placeholder="Password" required>
                <div id="errorMessage" class="error-message"></div>
                <button type="submit">Login</button>
            </form>
        </div>
    `;
    setupSubmitForm();

};

const setupSubmitForm = () => {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = document.getElementById('identifier').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        try {
            const credentials = convertToBase64(`${identifier}:${password}`)
            const token = await getloginToken(credentials);
            localStorage.setItem('token', token)
            showProfile();
        } catch (error) {
            errorMessage.textContent = 'Invalid credentials.';
        }
    });
};