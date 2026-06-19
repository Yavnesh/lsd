export function getScheduledSeasonAndDay() {
    const now = new Date();
    
    // getDay() is 0 (Sunday) to 6 (Saturday). We map to 1 (Monday) to 7 (Sunday)
    let dayOfWeek = now.getDay();
    if (dayOfWeek === 0) {
        dayOfWeek = 7;
    }

    // Reference starting point: June 1, 2026 (a Monday)
    const startEpoch = new Date("2026-06-01T00:00:00Z").getTime();
    const currentMillis = now.getTime();
    const diffMillis = Math.max(0, currentMillis - startEpoch);
    
    const oneWeekMillis = 1000 * 60 * 60 * 24 * 7;
    const weeksElapsed = Math.floor(diffMillis / oneWeekMillis);

    const seasons = [
        "Understand Yourself",
        "Surviving The Internet",
        "Your Body Explained",
        "Think Better",
        "Money Without The Boring Stuff"
    ];

    const seasonIndex = weeksElapsed % seasons.length;
    const activeSeason = seasons[seasonIndex];

    return {
        season: activeSeason,
        dayOfWeek
    };
}
