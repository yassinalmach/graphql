const GRAPHQL_ENDPOINT = 'https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql';

export const executeQuery = async (query) => {
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({query})
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.errors) throw data.errors[0].message

        return data.data;
    } catch (error) {
        console.error(error);
    }
}

export const USER_INFO_QUERY = `
{
    user {
        lastName
        firstName
    }
}
`;