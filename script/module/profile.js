import { logout } from "./api/auth.js";
import { loadProfileData } from "./api/graphql.js";

export const showProfile = () => {
    const app = document.getElementById('app');
    app.innerHTML = /*HTML*/`
        <div class="profile-container">
            <header class="profile-header">
                <div class="profile-info"></div>
                <button id="logoutBtn">Logout</button>
            </header>
            <div class="profile-content"></div>
        </div>
    `;
    document.getElementById('logoutBtn').addEventListener('click', logout);

    loadProfileData();
}
