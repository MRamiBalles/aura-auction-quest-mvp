/**
 * ALGORITHM #1: "WESTWORLD" PROCEDURAL QUEST ENGINE
 * 
 * Generates unique narrative quests based on:
 * 1. Real World Location Context (OSM Tags)
 * 2. Time of Day / Weather
 * 3. User History
 */

interface GeoContext {
    lat: number;
    lng: number;
    tags: string[]; // e.g., ["park", "water", "statue", "library"]
    weather: string; // "rain", "clear"
    timeOfDay: "day" | "night";
}

interface Quest {
    id: string;
    title: string;
    description: string; // The "Generated Story"
    objective: string;
    reward: string;
}

export class WestworldQuestGenerator {

    // Templates for simple procedural generation (Pre-LLM fallback)
    private templates = {
        "water_night": {
            title: "Whispers from the Deep",
            desc: "The reflection of the moon on the water reveals a spectral form. The spirit seems lost.",
            obj: "Walk 500m along the water edge to guide the spirit."
        },
        "park_day": {
            title: "Nature's Guardian",
            desc: "The ancient trees in this park are withering. A solar flare has weakened the aura here.",
            obj: "Collect 3 Solar Motes near the largest tree."
        },
        "default": {
            title: "Scanning the Perimeter",
            desc: "This area has high background radiation. We need more data.",
            obj: "Visit 2 unique landmarks."
        }
    };

    /**
     * Generates a quest on-the-fly based on context
     */
    public generateQuest(context: GeoContext): Quest {
        let templateKey = "default";

        // Simple tag matching logic
        if (context.tags.includes("water") && context.timeOfDay === "night") {
            templateKey = "water_night";
        } else if (context.tags.includes("park") && context.timeOfDay === "day") {
            templateKey = "park_day";
        }

        const tpl = this.templates[templateKey as keyof typeof this.templates] || this.templates["default"];

        return {
            id: `quest_${Date.now()}_${templateKey}`,
            title: tpl.title,
            description: tpl.desc,
            objective: tpl.obj,
            reward: "50 AURA"
        };
    }

    /**
     * Future Integration: Call OpenAI/LLM for infinite variety
     */
    public async generateAIQuest(context: GeoContext): Promise<Quest> {
        // Mocking the LLM implementation
        // const prompt = `Create a fantasy quest for a user located at a ${context.tags.join(', ')} during ${context.weather} weather...`;
        return this.generateQuest(context);
    }
}
