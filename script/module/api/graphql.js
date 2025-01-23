const GRAPHQL_ENDPOINT = 'https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql';

export const loadProfileData = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `
                    {
                        user {
                            login
                            id
                        }
                    }
                `
            })
        });

        const data = await response.json();
        const profileInfo = document.querySelector('.profile-info');
        profileInfo.innerHTML = `
            <h2>Welcome, ${data.data.user[0].login}!</h2>
            <p>User ID: ${data.data.user[0].id}</p>
        `;
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}