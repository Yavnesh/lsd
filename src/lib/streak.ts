export function calculateStreak(activities: { completedAt: Date }[], timezone: string = "UTC"): number {
    if (activities.length === 0) return 0;

    // Convert completedAt dates to local date strings (YYYY-MM-DD) in the user's timezone
    const completedDates = new Set<string>();
    for (const act of activities) {
        try {
            const dateStr = new Intl.DateTimeFormat("en-US", {
                timeZone: timezone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).format(act.completedAt); // MM/DD/YYYY
            
            const [m, d, y] = dateStr.split("/");
            completedDates.add(`${y}-${m}-${d}`);
        } catch (e) {
            const dateStr = act.completedAt.toISOString().split("T")[0];
            completedDates.add(dateStr);
        }
    }

    // Get today's and yesterday's local date string in the user's timezone
    let todayStr = "";
    let yesterdayStr = "";
    try {
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
        
        const todayParts = formatter.format(new Date());
        const [m, d, y] = todayParts.split("/");
        todayStr = `${y}-${m}-${d}`;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayParts = formatter.format(yesterday);
        const [ym, yd, yy] = yesterdayParts.split("/");
        yesterdayStr = `${yy}-${ym}-${yd}`;
    } catch (e) {
        todayStr = new Date().toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterdayStr = yesterday.toISOString().split("T")[0];
    }

    // If they haven't completed today's or yesterday's quiz, the streak is broken (0)
    if (!completedDates.has(todayStr) && !completedDates.has(yesterdayStr)) {
        return 0;
    }

    // Start checking backward from today (or yesterday if today is not completed yet)
    let currentStreak = 0;
    const startPoint = completedDates.has(todayStr) ? new Date() : (() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d;
    })();

    let checkDate = new Date(startPoint);
    while (true) {
        let checkDateStr = "";
        try {
            const dateParts = new Intl.DateTimeFormat("en-US", {
                timeZone: timezone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).format(checkDate);
            const [m, d, y] = dateParts.split("/");
            checkDateStr = `${y}-${m}-${d}`;
        } catch (e) {
            checkDateStr = checkDate.toISOString().split("T")[0];
        }

        if (completedDates.has(checkDateStr)) {
            currentStreak++;
            // Move to previous day
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return currentStreak;
}
