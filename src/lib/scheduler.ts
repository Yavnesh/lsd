export function getScheduledSeasonAndDay(timezone?: string) {
    let now = new Date();
    
    if (timezone) {
        try {
            // Find the local date representation for the given timezone
            const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone: timezone,
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: false
            });
            const parts = formatter.formatToParts(now);
            const partObj = Object.fromEntries(parts.map(p => [p.type, p.value]));
            
            // Build the local date string (YYYY-MM-DDTHH:mm:ss)
            const localString = `${partObj.year}-${partObj.month.padStart(2, '0')}-${partObj.day.padStart(2, '0')}T${partObj.hour.replace('24', '00').padStart(2, '0')}:${partObj.minute.padStart(2, '0')}:${partObj.second.padStart(2, '0')}`;
            now = new Date(localString);
        } catch (e) {
            console.error("Failed to parse timezone, falling back to UTC/Server time", e);
        }
    }

    // getDay() is 0 (Sunday) to 6 (Saturday). We map to 1 (Monday) to 7 (Sunday)
    let dayOfWeek = now.getDay();
    if (dayOfWeek === 0) {
        dayOfWeek = 7;
    }

    // Reference starting point: June 1, 2026 (a Monday)
    const startEpoch = new Date("2026-06-01T00:00:00").getTime();
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
