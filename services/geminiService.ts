import { GoogleGenAI, Type } from "@google/genai";

// Ensure API key is present
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// 1. Fast Hints (Gemini 2.5 Flash Lite)
// Used when user specifically asks for a hint about the case
export const getFastHint = async (userQuery: string, currentContext: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite-latest',
            contents: `
                You are a senior detective's AI assistant. 
                Context: ${currentContext}
                User Question: ${userQuery}
                
                Provide a short, cryptic but helpful hint. Do not give the exact answer. 
                Keep it under 2 sentences.
            `,
            config: {
                systemInstruction: "You are a noir-style detective assistant.",
                temperature: 0.7,
            }
        });
        return response.text || "Connection to HQ interrupted...";
    } catch (error) {
        console.error("Gemini Hint Error", error);
        return "System offline. Consult your field manual.";
    }
};

// 2. Syntax/Knowledge Lookup (Search Grounding)
// Used when user asks about SQL syntax or general knowledge
export const getKnowledgeHelp = async (query: string): Promise<{text: string, sources: string[]}> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: query,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: "You are a database administrator helper. Explain SQL concepts clearly."
            }
        });

        const text = response.text || "No data found.";
        const sources: string[] = [];
        
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            response.candidates[0].groundingMetadata.groundingChunks.forEach(chunk => {
                if (chunk.web?.uri) {
                    sources.push(chunk.web.uri);
                }
            });
        }

        return { text, sources };
    } catch (error) {
        console.error("Gemini Search Error", error);
        return { text: "Network failure during knowledge retrieval.", sources: [] };
    }
};

// 3. Complex Reasoning / Chief of Police
// Switch to Flash model to avoid 429 Quota Exceeded errors on Free Tier.
// It is sufficient for roleplaying logic checks.
export const submitCaseReview = async (
    caseDetails: string, 
    userAnswer: string, 
    queryHistory: string[]
): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `
                The user is playing a detective game.
                Case Details: ${caseDetails}
                User Answer: ${userAnswer}
                User's Query History: ${JSON.stringify(queryHistory)}

                Role: You are the Chief of Police. 
                
                Task:
                1. Determine if the User Answer matches the case solution (or is logically correct based on the data).
                2. If correct, congratulate them with a stern but proud tone. Mention specifically how their queries helped.
                3. If incorrect, scold them gently and explain where the logic might have failed based on their queries.
            `,
            config: {
                // Thinking budget removed to save tokens and prevent quota exhaustion on flavor text generation
                temperature: 0.8
            }
        });

        return response.text || "Report generation failed.";
    } catch (error) {
        console.error("Gemini API Error", error);
        return "The Chief is currently in a meeting (API Quota Exceeded). Good work anyway, Detective.";
    }
};