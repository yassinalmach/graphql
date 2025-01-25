import { executeQuery } from "./api.js";
import { AUDIT_RATIO_QUERY, TOTAL_XP_QUERY, USER_INFO_QUERY } from "./queries.js";
import { formatXP, logout } from "./utils.js";

export const showProfile = async () => {
    const app = document.getElementById('app');
    app.innerHTML = /*HTML*/`
        <div class="profile-container">
            <header class="profile-header">
                <div class="profile-info"></div>
                <button id="logoutBtn">Logout</button>
            </header>
            <div class="profile-content">
                <div class="total-xp">
                </div>
                <div class="audit-ratio">
                </div>
            </div>
        </div>
    `;
    document.getElementById('logoutBtn').addEventListener('click', logout);

    const data = await executeQuery(USER_INFO_QUERY);
    const profileInfo = document.querySelector('.profile-info');
    profileInfo.innerHTML = `
        <h2>Welcome, ${data.user[0].lastName} ${data.user[0].firstName}!</h2>
    `;

    displayTotalXP();
    displayAuditRatio();
}

const displayTotalXP = async () => {
    const element = document.querySelector('.total-xp')
    const data = await executeQuery(TOTAL_XP_QUERY);

    // calculate total xp
    const totalXP = data.transaction.reduce((acc, currentValue) => acc + currentValue.amount, 0);
    
    element.innerHTML = `
    <h1>Total XP</h1>
    <div class="xp-value">${formatXP(totalXP)}</div>
  `
}
