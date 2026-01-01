import type { Message } from '../types';
import { parse, isValid } from 'date-fns';

export async function parseFile(file: File): Promise<Message[]> {
    const text = await file.text();

    if (file.name.endsWith('.json')) {
        return parseTelegram(text);
    } else {
        return parseWhatsApp(text);
    }
}

function parseWhatsApp(text: string): Message[] {
    const lines = text.split('\n');
    const messages: Message[] = [];

    // STRAIGHT REGEX (Date + Time)
    // Supports: "d/m/y, h:mm a - ..." and "[d/m/y, h:mm:ss a] ..."
    const strictRegex = /^(?:\[)?(\d{1,2}\/\d{1,2}\/\d{2,4})(?:,\s*|\s+)(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[aApP][mM])?)(?:\]\s|\s+-\s+)(.*?): (.*)/;

    // LOOSE REGEX (Original - Date Only)
    // Matches: "d/m/y ... - ..."
    // This is the fallback to ensure we don't return 0 messages if the time format is weird.
    const looseRegex = /^(?:\[)?(\d{1,2}\/\d{1,2}\/\d{2,4})(?:,|\s|\]).*? - (.*?): (.*)/;

    lines.forEach((line) => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        let date: Date | null = null;
        let author = '';
        let content = '';

        // 1. Try Strict Parsing (with Time)
        // Normalize: Replace non-breaking spaces (\u202f) with normal spaces
        // Uppercase AM/PM for easier parsing
        const normalizedLine = cleanLine.replace(/\u202f/g, ' ');
        const strictMatch = normalizedLine.match(strictRegex);

        if (strictMatch) {
            let [_, dateStr, timeStr, pAuthor, pContent] = strictMatch;

            // Normalize Time: "9:26 pm" -> "9:26 PM"
            timeStr = timeStr.toUpperCase();

            const fullDateStr = `${dateStr} ${timeStr}`;

            // Try explicit formatting first
            // Note: date-fns v2/v3 'a'/'aa' matches AM/PM. 
            // We use 'd/M/yy' covering both single and double digit days/months.
            const formatsToTry = [
                'd/M/yy h:mm a', 'd/M/yyyy h:mm a',
                'd/M/yy h:mm aa', 'd/M/yyyy h:mm aa',
                'd/M/yy HH:mm', 'd/M/yyyy HH:mm',
                'M/d/yy h:mm a', 'M/d/yyyy h:mm a', // US fallback
                'd/M/yy h:mm:ss a', 'd/M/yyyy h:mm:ss a',
            ];

            for (const fmt of formatsToTry) {
                const parsed = parse(fullDateStr, fmt, new Date());
                if (isValid(parsed)) {
                    date = parsed;
                    author = pAuthor;
                    content = pContent;
                    break;
                }
            }

            // Fallback: Date.parse() for very standard localized strings
            if (!date || !isValid(date)) {
                // Try replacing commas/dots just in case
                const fallbackDate = new Date(fullDateStr.replace(/,/g, ''));
                if (isValid(fallbackDate)) {
                    date = fallbackDate;
                    author = pAuthor;
                    content = pContent;
                }
            }
        }

        // 2. Fallback to Loose Parsing (Date Only)
        if (!date || !isValid(date)) {
            const looseMatch = cleanLine.match(looseRegex);
            if (looseMatch) {
                const [_, dateStr, pAuthor, pContent] = looseMatch;
                // Try basic date parsing (d/M/yy or d/M/yyyy)
                const parsed = parse(dateStr, 'd/M/yy', new Date());

                if (isValid(parsed)) {
                    date = parsed; // Time is 00:00:00
                    author = pAuthor;
                    content = pContent;
                } else {
                    // Try 4 digits year custom
                    const parsed4 = parse(dateStr, 'd/M/yyyy', new Date());
                    if (isValid(parsed4)) {
                        date = parsed4;
                        author = pAuthor;
                        content = pContent;
                    }
                }
            }
        }

        // 3. Push if valid
        if (date && isValid(date)) {
            messages.push({
                id: crypto.randomUUID(),
                date,
                author: author.trim(),
                content: content.trim(),
                source: 'whatsapp'
            });
        }
    });

    console.log(`Parsed ${messages.length} messages. (Source: WhatsApp)`);
    return messages;
}

function parseTelegram(jsonText: string): Message[] {
    try {
        const data = JSON.parse(jsonText);
        const msgs = data.messages || [];

        return msgs
            .filter((m: any) => m.type === 'message')
            .map((m: any) => ({
                id: m.id?.toString() || crypto.randomUUID(),
                date: new Date(m.date_unixtime * 1000), // Telegram usually uses unix timestamp
                author: m.from || 'Unknown',
                content: typeof m.text === 'string' ? m.text : (Array.isArray(m.text) ? m.text.map((t: any) => typeof t === 'string' ? t : t.text).join('') : ''),
                source: 'telegram'
            }));
    } catch (e) {
        console.error('Failed to parse (Telegram) JSON', e);
        return [];
    }
}
