import type { Message, ChatStats } from '../types';
import { getHours, format, addDays, differenceInDays } from 'date-fns';

const STOP_WORDS = new Set([
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her",
    "she", "or", "an", "will", "my", "one", "all", "would", "there",
    "their", "what", "so", "up", "out", "if", "about", "who", "get",
    "which", "go", "me", "when", "make", "can", "like", "time", "no",
    "just", "him", "know", "take", "people", "into", "year", "your",
    "good", "some", "could", "them", "see", "other", "than", "then",
    "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first",
    "well", "way", "even", "new", "want", "because", "any", "these",
    "give", "day", "most", "us", "is", "are", "was", "were", "omitted",
    "image", "video", "sticker", "gif", "attached", "edited"
]);

export function analyzeChat(messages: Message[], targetYear: number = 2025): ChatStats {
    const filteredMessages = messages.filter(m => m.date.getFullYear() === targetYear);

    const participants: { [name: string]: number } = {};
    const userActiveDays: { [user: string]: Set<string> } = {};

    const hourlyActivity: { [hour: number]: number } = {};
    const dailyVolume: { [date: string]: number } = {};

    let rangeStart: Date | null = null;
    let rangeEnd: Date | null = null;

    // New Stats Containers
    const userCharCounts: { [user: string]: number } = {};
    const userMsgCounts: { [user: string]: number } = {};
    const wordCounts: { [word: string]: number } = {};
    const longestMessageList: { author: string; content: string; length: number; date: Date }[] = [];

    const uniqueDatesSet = new Set<number>(); // Store timestamps for streak calc

    filteredMessages.forEach(msg => {
        // Basic Volume
        participants[msg.author] = (participants[msg.author] || 0) + 1;

        const dayKey = format(msg.date, 'yyyy-MM-dd');
        dailyVolume[dayKey] = (dailyVolume[dayKey] || 0) + 1;
        uniqueDatesSet.add(new Date(dayKey).getTime());

        // User Active Days
        if (!userActiveDays[msg.author]) userActiveDays[msg.author] = new Set();
        userActiveDays[msg.author].add(dayKey);

        // Hourly
        const hour = getHours(msg.date);
        hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;

        // Range
        if (!rangeStart || msg.date < rangeStart) rangeStart = msg.date;
        if (!rangeEnd || msg.date > rangeEnd) rangeEnd = msg.date;

        // --- NEW ANALYTICS ---
        const len = msg.content.length;
        userCharCounts[msg.author] = (userCharCounts[msg.author] || 0) + len;
        userMsgCounts[msg.author] = (userMsgCounts[msg.author] || 0) + 1;

        // Longest Message (Filter out Meta AI and non-clean text)
        if (msg.author !== 'Meta AI' && len > 0 && isCleanText(msg.content)) {
            longestMessageList.push({ author: msg.author, content: msg.content, length: len, date: msg.date });
        }

        // Word Freq
        if (!msg.content.includes("omitted") && !msg.content.includes("Media omitted")) {
            const words = cleanAndTokenize(msg.content);
            words.forEach(w => {
                wordCounts[w] = (wordCounts[w] || 0) + 1;
            });
        }
    });

    // Post-Process: Top Lists

    // 1. Longest Messages
    longestMessageList.sort((a, b) => b.length - a.length);
    const topLongestMessages = longestMessageList.slice(0, 20);

    // 2. Word Freq
    const sortedWords = Object.entries(wordCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15)
        .map(([word, count]) => ({ word, count }));

    // 3. Avg Length
    const avgLengthPerPerson: { [name: string]: number } = {};
    // Only calculate for users who actually sent messages
    for (const user in userMsgCounts) {
        avgLengthPerPerson[user] = userCharCounts[user] / userMsgCounts[user];
    }

    // 4. Streaks & Gaps
    const sortedUniqueDates = Array.from(uniqueDatesSet).sort((a, b) => a - b).map(ts => new Date(ts));
    const { streaks, gaps } = calculateStreaksAndGaps(sortedUniqueDates);

    // 5. Active Days per person (Consistency)
    const finalActiveDays: { [name: string]: number } = {};
    for (const [p, set] of Object.entries(userActiveDays)) {
        finalActiveDays[p] = set.size;
    }

    // 6. Busiest Day
    const busiestDayEntry = Object.entries(dailyVolume).sort(([, a], [, b]) => b - a)[0];
    const busiestDay = busiestDayEntry ? { date: new Date(busiestDayEntry[0]), count: busiestDayEntry[1] } : null;

    // 7. Average Reply Time
    // Logic: If msg B follows msg A, and A.author != B.author, time diff is response time.
    const replyTimes: { [user: string]: number[] } = {};

    // Ensure messages are sorted by date
    // (filteredMessages usually already sorted if source was, but let's be safe or assume sorted)
    // filteredMessages is derived from 'messages' which we parsed linearly, so likely sorted. 
    // If not, we should sort: filteredMessages.sort((a,b) => a.date.getTime() - b.date.getTime());

    for (let i = 1; i < filteredMessages.length; i++) {
        const prev = filteredMessages[i - 1];
        const curr = filteredMessages[i];

        // Check if it's a reply (different author)
        // Also ignore huge gaps (e.g. > 6 hours) as that's likely just a new conversation, not a reply
        if (prev.author !== curr.author) {
            const diffSeconds = (curr.date.getTime() - prev.date.getTime()) / 1000;

            // Filter out self-replies or crossed streams? No, different author check handles self.
            // Filter out "new convo" starts (arbitrary threshold: 2 hours = 7200s)
            if (diffSeconds < 7200) {
                if (!replyTimes[curr.author]) replyTimes[curr.author] = [];
                replyTimes[curr.author].push(diffSeconds);
            }
        }
    }

    const avgReplyTime: { [name: string]: number } = {};
    for (const [user, times] of Object.entries(replyTimes)) {
        if (times.length > 0) {
            const sum = times.reduce((a, b) => a + b, 0);
            avgReplyTime[user] = sum / times.length;
        }
    }

    return {
        totalMessages: filteredMessages.length,
        participants,
        activeDays: finalActiveDays,
        hourlyActivity,
        dateRange: { start: rangeStart, end: rangeEnd },
        topStreaks: streaks.slice(0, 5),
        topGaps: gaps.slice(0, 5),
        topWords: sortedWords,
        avgLengthPerPerson,
        longestMessages: topLongestMessages,
        busiestDay,
        avgReplyTime,
        totalActiveDays: Object.keys(dailyVolume).length
    };
}

function cleanAndTokenize(text: string): string[] {
    const cleaned = text.toLowerCase().replace(/[^\w\s]|_/g, "");
    const words = cleaned.split(/\s+/);
    return words.filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function isCleanText(text: string): boolean {
    if (!text) return false;

    // Count characters that are NOT letters, numbers, or spaces
    // Regex [^a-zA-Z0-9\s] matches symbols/punctuation
    const junkMatches = text.match(/[^a-zA-Z0-9\s]/g);
    const junkChars = junkMatches ? junkMatches.length : 0;
    const totalChars = text.length;

    if (totalChars === 0) return false;

    const ratio = junkChars / totalChars;
    return ratio <= 0.10; // Pass if junk is 10% or less
}

function calculateStreaksAndGaps(dates: Date[]) {
    if (dates.length === 0) return { streaks: [], gaps: [] };

    const streaks: { length: number; start: Date; end: Date }[] = [];
    const gaps: { length: number; start: Date; end: Date }[] = [];

    let currentStreakStart = dates[0];
    let currentStreakLen = 1;

    for (let i = 1; i < dates.length; i++) {
        const prev = dates[i - 1];
        const curr = dates[i];

        // Difference in days. 
        const diff = differenceInDays(curr, prev);

        if (diff === 1) {
            currentStreakLen++;
        } else {
            // End of streak
            streaks.push({ length: currentStreakLen, start: currentStreakStart, end: prev });

            // Gap found
            if (diff > 1) {
                // Gap is between prev+1 and curr-1
                const gapStart = addDays(prev, 1);
                const gapEnd = addDays(curr, -1);
                const gapLen = diff - 1;
                gaps.push({ length: gapLen, start: gapStart, end: gapEnd });
            }

            // Reset streak
            currentStreakStart = curr;
            currentStreakLen = 1;
        }
    }
    // Push final streak
    streaks.push({ length: currentStreakLen, start: currentStreakStart, end: dates[dates.length - 1] });

    return {
        streaks: streaks.sort((a, b) => b.length - a.length),
        gaps: gaps.sort((a, b) => b.length - a.length)
    };
}

export function getTopChatter(stats: ChatStats) {
    return Object.entries(stats.participants).sort((a, b) => b[1] - a[1])[0];
}
