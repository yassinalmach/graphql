import { executeQuery } from "./api.js";
import { SkillBarChart, XPLineChart } from "./charts.js";
import { USER_INFO_QUERY } from "./queries.js";
import { formatXP, logout } from "./utils.js";

export const showProfile = async () => {
    const app = document.getElementById('app');
    app.innerHTML = /*HTML*/`
        <div class="profile-container">
            <header class="profile-header">
                <div class="full-name"></div>
                <button id="logoutBtn">Logout</button>
            </header>
            <div class="user-info">
                <div class="current-level"></div>
                <div class="total-xp"></div>
                <div class="audit-ratio"></div>
            </div>
            <div class="charts-container">
                <div class="chart-card">
                    <div class="chart-header">
                        <h2>XP Progress Over Time</h2>
                    </div>
                    <div class="xp-chart"></div>
                </div>
                <div class="chart-card">
                    <div class="chart-header">
                        <h2>Skills Distribution</h2>
                    </div>
                    <div class="skill-chart"></div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('logoutBtn').addEventListener('click', logout);

    await displayUserInfo();
    await initializeCharts();
}

const displayUserInfo = async () => {
    const fullNameElement = document.querySelector('.full-name');
    const userInfoElement = document.querySelector('.user-info');
    const data = await executeQuery(USER_INFO_QUERY, {"arg": "%module/checkpoint%"});

    // get current level
    const currentLevel = data.user[0].transactions[0].amount;

    // count total xp
    const totalXP = data.transaction.reduce((acc, currentValue) => acc + currentValue.amount, 0);

    // get audit info
    const ratio = data.user[0].auditRatio.toFixed(1);
    const totalDone = formatXP(data.user[0].totalUp);
    const totalReceived = formatXP(data.user[0].totalDown);

    fullNameElement.innerHTML = `
        <h2>Welcome, ${data.user[0].lastName} ${data.user[0].firstName}!</h2>
    `;

    userInfoElement.innerHTML = /*html*/`
        <div class="current-level">
            <h1>Current level</h1>
            <span>level: ${currentLevel}</span>
        </div>

        <div class="total-xp">
            <h1>Total XP</h1>
            <div class="xp-value">${formatXP(totalXP)}</div>
        </div>

        <div class="audit-ratio">
            <h1>Audit ratio</h1>
            <div>
                <span>Done: ${totalDone}</span>
            </div>
            <div>
                <span>Received: ${totalReceived}</span>
            </div>
            <div>
                <span>Ratio: ${ratio}</span>
            </div>
        </div>
    `;
}

const initializeCharts = async () => {
    try {
        // Initialize XP Chart
        const xpChartContainer = document.querySelector('.xp-chart');
        const xpChart = new XPLineChart(xpChartContainer);
        await xpChart.initialize();

        // Initialize Skills Chart
        const skillChartContainer = document.querySelector('.skill-chart');
        const skillChart = new SkillBarChart(skillChartContainer);
        await skillChart.initialize();
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}