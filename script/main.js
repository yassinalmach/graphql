import { isAuthenticated } from "./module/api/auth.js";
import { showLogin } from "./module/login.js";
import { showProfile } from "./module/profile.js";

document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        showProfile();
    } else {
        showLogin();
    }
});