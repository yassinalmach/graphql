import { executeQuery } from "./api.js";
import { USER_INFO_QUERY } from "./queries.js";
import { logout } from "./utils.js";

export const showProfile = async () => {
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

    const data = await executeQuery(USER_INFO_QUERY);
    const profileInfo = document.querySelector('.profile-info');
    profileInfo.innerHTML = `
        <h2>Welcome, ${data.user[0].lastName} ${data.user[0].firstName}!</h2>
    `;
}