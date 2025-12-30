// test_api.js
const API_KEY = "AIzaSyBaeI85q4c8L7yXuAy8dH4cs4-2d4KGAzU";

async function fetchModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("✅ Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (Supported)`);
                } else {
                    console.log(`- ${m.name} (Not supported for generateContent)`);
                }
            });
        } else {
            console.error("❌ No models found or error:", data);
        }
    } catch (error) {
        console.error("❌ Network or API Error:", error.message);
    }
}

fetchModels();
