export const compareItemsWithAI = async (lostItem, foundItem) => {
    try {
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        const token = user?.token || '';

        const rawBaseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production-04b6.up.railway.app');
        const baseUrl = rawBaseUrl && !rawBaseUrl.startsWith('http') && process.env.NODE_ENV !== 'development' ? 'https://' + rawBaseUrl : rawBaseUrl;

        const response = await fetch(`${baseUrl}/items/compare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ lostItem, foundItem })
        });

        if (!response.ok) {
            throw new Error(`Failed to compare items. Server responded with ${response.status}`);
        }

        const data = await response.json();
        return data.data || data;

    } catch (error) {
        console.error("Error comparing items with backend AI:", error);
        // Fallback response if AI fails so the page doesn't break
        return {
            confidence: 0,
            reason: `AI matching system error: ${error.message || String(error)}`,
            matches: []
        };
    }
};
