import { showLogin } from "./module/login.js";
import { showProfile } from "./module/profile.js";
import { isAuthenticated } from "./module/utils.js";

document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        showProfile();
    } else {
        showLogin();
    }
});