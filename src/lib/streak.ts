export function calculateStreak(
    activities: { completedAt: Date }[], 
    timezone: string = "UTC",
    streakShields: number = 0
): { streak: number; shieldsConsumed: number } {
    if (activities.length === 0) return { streak: 0, shieldsConsumed: 0 };

    const completedDates = new Set<string>();
    // Sort activities by date descending
    const sortedActs = [...activities].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

    for (const act of sortedActs) {
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
            completedDates.add(act.completedAt.toISOString().split("T")[0]);
        }
    }

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

    let shieldsConsumed = 0;
    let startPoint: Date;

    // Check if streak is currently active
    if (completedDates.has(todayStr) || completedDates.has(yesterdayStr)) {
        startPoint = completedDates.has(todayStr) ? new Date() : (() => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            return d;
        })();
    } else {
        // Streak would be broken (0) normally
        if (streakShields > 0) {
            // Streak is saved by shield!
            // Start counting from the most recent completed activity date
            const lastAct = sortedActs[0];
            startPoint = new Date(lastAct.completedAt);
            shieldsConsumed = 1; // Consume one shield
        } else {
            return { streak: 0, shieldsConsumed: 0 };
        }
    }

    let currentStreak = 0;
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
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            // Check if we can use another shield to bypass a gap day
            if (streakShields > shieldsConsumed) {
                shieldsConsumed++;
                checkDate.setDate(checkDate.getDate() - 1); // Skip this gap day
            } else {
                break;
            }
        }
    }

    return { streak: currentStreak, shieldsConsumed };
}
