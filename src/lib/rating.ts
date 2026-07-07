/**
 * Utility functions for the Elo-based Knowledge Rating and Mastery Title systems.
 */

export const MASTERY_LEVELS = [
    { title: "Novice", minRating: 0, maxRating: 1099, color: "#4CAF50" }, // Green
    { title: "Explorer", minRating: 1100, maxRating: 1299, color: "#81C784" },
    { title: "Thinker", minRating: 1300, maxRating: 1499, color: "#29B6F6" }, // Blue
    { title: "Analyst", minRating: 1500, maxRating: 1699, color: "#0288D1" },
    { title: "Strategist", minRating: 1700, maxRating: 1899, color: "#AB47BC" }, // Purple
    { title: "Expert", minRating: 1900, maxRating: 2099, color: "#7B1FA2" },
    { title: "Master", minRating: 2100, maxRating: 2299, color: "#FF9800" }, // Gold
    { title: "Grandmaster", minRating: 2300, maxRating: 2499, color: "#E65100" },
    { title: "Sage", minRating: 2500, maxRating: 2699, color: "#E91E63" }, // Pink/Rose
    { title: "Legend", minRating: 2700, maxRating: 9999, color: "#FF1744" } // Red/Gold glow
];

export function getMasteryTitle(rating: number): string {
    const level = MASTERY_LEVELS.find(l => rating >= l.minRating && rating <= l.maxRating);
    return level ? level.title : "Novice";
}

export function getMasteryColor(rating: number): string {
    const level = MASTERY_LEVELS.find(l => rating >= l.minRating && rating <= l.maxRating);
    return level ? level.color : "#4CAF50";
}

/**
 * Calculates the expected score of a player battling a quest.
 * expectedScore = 1 / (1 + 10^((questRating - playerRating) / 400))
 */
export function getExpectedScore(playerRating: number, questRating: number): number {
    return 1 / (1 + Math.pow(10, (questRating - playerRating) / 400));
}

interface EloUpdates {
    playerChange: number;
    questChange: number;
}

/**
 * Calculates the rating updates for player and quest.
 * kFactor is adjusted based on user performance modifiers.
 */
export function calculateEloUpdate(
    playerRating: number,
    questRating: number,
    isCorrect: boolean,
    modifiers: {
        attempts: number; // number of quiz attempts (1 = perfect, >1 = retries)
        hintsUsed?: number;
        timeTakenSeconds?: number;
    } = { attempts: 1 }
): EloUpdates {
    const expected = getExpectedScore(playerRating, questRating);
    
    // Player score: 1.0 for first try correct, 0.7 for retry correct, 0.0 for incorrect
    let playerScore = 0.0;
    if (isCorrect) {
        if (modifiers.attempts === 1) playerScore = 1.0;
        else if (modifiers.attempts === 2) playerScore = 0.6;
        else playerScore = 0.3;
    }

    // Base K-factor
    const baseK = 32;

    const playerChange = Math.round(baseK * (playerScore - expected));
    // Quest rating updates opposite of player score, slightly dampened so content doesn't swing too wildly
    const questChange = Math.round(16 * (expected - playerScore));

    return {
        playerChange,
        questChange
    };
}
