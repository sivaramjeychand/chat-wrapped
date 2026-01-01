export interface Message {
    id: string;
    date: Date;
    author: string;
    content: string;
    source: 'whatsapp' | 'telegram';
}

export interface ChatStats {
    totalMessages: number;
    participants: { [name: string]: number };
    activeDays: { [date: string]: number };
    hourlyActivity: { [hour: number]: number };
    dateRange: { start: Date | null; end: Date | null };
    // Advanced Stats
    topStreaks: { length: number; start: Date; end: Date }[];
    topGaps: { length: number; start: Date; end: Date }[];
    topWords: { word: string; count: number }[];
    avgLengthPerPerson: { [name: string]: number };
    longestMessages: { author: string; content: string; length: number; date: Date }[];
    busiestDay: { date: Date; count: number } | null;
    avgReplyTime: { [name: string]: number }; // In seconds
    totalActiveDays: number;
}
