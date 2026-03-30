import Groq from "groq-sdk";

// Initialize Groq with the api key from .env
// We tell it dangerouslyAllowBrowser: true because otherwise it blocks frontend usage for safety
const groq = new Groq({
    apiKey: process.env.REACT_APP_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

/**
 * 
 * @param {Object} lostItem - Object describing the lost item (e.g. { type: "Backpack", color: "Blue", brand: "Nike" })
 * @param {Object} foundItem - Object describing the found item (e.g. { type: "Bag", color: "Navy", brand: "Nike" })
 * @returns {Promise<{ confidence: number, reason: string, matches: Array<{field: string, isMatch: boolean, details: string}> }>}
 */
export const compareItemsWithAI = async (lostItem, foundItem) => {
    try {
        const prompt = `
        You are an expert AI matching assistant for a university lost-and-found system.
        I will give you details of a LOST item and a FOUND item. Your job is to analyze them and tell me if they are likely the same item.

        Lost Item Details:
        ${JSON.stringify(lostItem, null, 2)}

        Found Item Details:
        ${JSON.stringify(foundItem, null, 2)}

        Analyze them and return your results EXCLUSIVELY in valid JSON format with the following structure:
        {
            "confidence": <a number between 0 and 100 representing how likely these are the exact same item>,
            "reason": "<A very short 1-sentence human-readable summary of why you gave this score>",
            "matches": [
                {
                    "field": "Item Type",
                    "isMatch": true or false,
                    "details": "Explanation of the match/mismatch (e.g. 'Backpack vs Bag' or 'Perfect match')"
                },
                {
                    "field": "Brand",
                    "isMatch": true or false,
                    "details": "..."
                },
                {
                    "field": "Color",
                    "isMatch": true or false,
                    "details": "..."
                }
            ]
        }
        
        DO NOT include any text before or after the JSON. Only return the JSON.
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile", // Fast open-source model!
            temperature: 0.1, // Low temperature means it follows instructions strictly
            response_format: { type: "json_object" } // Force JSON output
        });

        const aiResponse = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
        return aiResponse;

    } catch (error) {
        console.error("Error asking Groq AI:", error);
        // Fallback response if AI fails so the page doesn't break
        return {
            confidence: 0,
            reason: "AI matching system is currently unavailable.",
            matches: []
        };
    }
};
