import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toBlob } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Download, X, Layers } from 'lucide-react';
import type { ChatStats } from '../types';
import { MessageCircle, Flame, Quote, TrendingUp, Type, Calendar, Zap, Moon } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';

interface StoryViewerProps {
    stats: ChatStats;
    onReset: () => void;
    messages: any[];
}

export function StoryViewer({ stats, onReset }: StoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slideRef = useRef<HTMLDivElement>(null);
    const hiddenRef = useRef<HTMLDivElement>(null); // For batch export
    const [isDownloading, setIsDownloading] = useState(false);

    // Prepare Top 5 Lists
    const topChatters = Object.entries(stats.participants)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const fastestRepliers = stats.avgReplyTime
        ? Object.entries(stats.avgReplyTime)
            .sort(([, a], [, b]) => a - b) // Ascending (lower is faster)
            .slice(0, 5)
        : [];

    const topEssayists = Object.entries(stats.avgLengthPerPerson)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const busiestDay = stats.busiestDay;
    const longestStreak = stats.topStreaks.length > 0 ? stats.topStreaks[0] : null;
    const novelist = stats.longestMessages.length > 0 ? stats.longestMessages[0] : null;

    // --- NIGHT OWL DATA PREP ---
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: stats.hourlyActivity[i] || 0,
        label: format(new Date().setHours(i, 0, 0, 0), 'ha') // e.g. "1am"
    }));

    const peakHourEntry = hourlyData.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), hourlyData[0]);
    const peakHour = peakHourEntry ? peakHourEntry.hour : 0;

    let vibe = "Early Bird 🌅";
    if (peakHour >= 22 || peakHour < 4) vibe = "Night Owl 🦉";
    else if (peakHour >= 4 && peakHour < 12) vibe = "Morning Person ☕";
    else if (peakHour >= 12 && peakHour < 17) vibe = "Afternoon Chatter ☀️";
    else vibe = "Evening Socialite 🌆";


    const downloadSlide = async () => {
        if (!hiddenRef.current) return;
        setIsDownloading(true);
        try {
            // Force a small delay to ensure rendering is stable
            await new Promise(resolve => setTimeout(resolve, 100));

            // Get the specific slide from the hidden container (Massive version)
            const children = Array.from(hiddenRef.current.children) as HTMLElement[];

            // Safety check for index
            if (currentIndex < 0 || currentIndex >= children.length) {
                console.error("Index out of bounds for hidden slides");
                return;
            }

            const targetSlide = children[currentIndex];

            if (!targetSlide) {
                console.error("Target slide not found in hidden container");
                return;
            }

            const blob = await toBlob(targetSlide, {
                cacheBust: true,
                backgroundColor: '#000000',
                filter: (node) => {
                    // Defensive check for exclusion class
                    if (node && node.nodeType === 1) { // 1 = Element
                        const el = node as HTMLElement;
                        if (el.classList && el.classList.contains('exclude-from-capture')) {
                            return false;
                        }
                    }
                    return true;
                }
            });

            if (blob) {
                saveAs(blob, `chat-wrapped-slide-${currentIndex + 1}.png`);
            } else {
                alert("Failed to create image blob.");
            }
        } catch (err) {
            console.error("Failed to download slide", err);
            alert(`Download failed: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsDownloading(false);
        }
    };

    const downloadAllSlides = async () => {
        if (!hiddenRef.current) return;
        setIsDownloading(true);
        try {
            const zip = new JSZip();
            const children = Array.from(hiddenRef.current.children) as HTMLElement[];

            if (children.length === 0) {
                alert("No slides found to export.");
                return;
            }

            for (let i = 0; i < children.length; i++) {
                const blob = await toBlob(children[i], {
                    cacheBust: true,
                    backgroundColor: '#000000'
                });

                if (blob) {
                    zip.file(`slide-${i + 1}.png`, blob);
                }
            }

            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, "chat-wrapped-stories.zip");

        } catch (err) {
            console.error("Batch download failed", err);
            alert(`Batch export failed: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsDownloading(false);
        }
    }

    const ListItem = ({ rank, label, value, sub, isExport }: { rank: number; label: string; value: string | number; sub?: string; isExport?: boolean }) => (
        <div
            className={`flex items-center justify-between w-full ${isExport ? 'max-w-lg mb-4 px-6 py-4 rounded-2xl' : 'max-w-xs mb-2 px-4 py-2 rounded-lg'}`}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
        >
            <div className={`flex items-center ${isExport ? 'gap-4' : 'gap-3'}`}>
                <span className={`font-bold ${isExport ? 'text-3xl' : 'text-base'}`} style={{ color: 'rgba(255, 255, 255, 0.7)' }}>#{rank}</span>
                <span className={`font-bold truncate ${isExport ? 'text-2xl max-w-[200px]' : 'text-sm max-w-[120px]'}`} style={{ color: '#ffffff' }}>{label}</span>
            </div>
            <div className="text-right">
                <div className={`font-black ${isExport ? 'text-3xl' : 'text-base'}`} style={{ color: '#ffffff' }}>{value}</div>
                {sub && <div className={`font-semibold ${isExport ? 'text-sm' : 'text-[10px]'}`} style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{sub}</div>}
            </div>
        </div>
    );

    const slides = [
        {
            id: 'intro',
            style: { background: 'linear-gradient(to bottom right, #6366f1, #9333ea)' }, // indigo-500 to purple-600
            render: ({ isExport }: { isExport?: boolean } = {}) => (
                <div className={`flex flex-col items-center justify-center h-full text-center ${isExport ? 'p-12' : 'p-6'}`}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`${isExport ? 'text-[150px] mb-12' : 'text-8xl mb-6'}`}>🎁</motion.div>
                    <h1 className={`${isExport ? 'text-8xl mb-6' : 'text-5xl mb-2'} font-black tracking-tighter uppercase`} style={{ color: '#ffffff' }}>2025<br />WRAPPED</h1>
                    <p className={`${isExport ? 'text-4xl' : 'text-xl'} font-light tracking-wide`} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Your Chat Personality</p>
                </div>
            )
        },
        {
            id: 'volume',
            style: { background: 'linear-gradient(to bottom right, #10b981, #0d9488)' }, // emerald-500 to teal-600
            render: ({ isExport }: { isExport?: boolean } = {}) => (
                <div className={`flex flex-col items-center justify-center h-full text-center ${isExport ? 'p-12' : 'p-6'}`}>
                    <MessageCircle className={`${isExport ? 'w-48 h-48 mb-12' : 'w-24 h-24 mb-8'}`} style={{ color: '#ffffff' }} />
                    <p className={`${isExport ? 'text-4xl mb-4' : 'text-2xl mb-2'} font-medium`} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Total Messages</p>
                    <h2 className={`${isExport ? 'text-9xl mb-12' : 'text-7xl mb-8'} font-black`} style={{ color: '#ffffff' }}>
                        {stats.totalMessages.toLocaleString()}
                    </h2>
                    <div className={`w-full ${isExport ? 'max-w-md h-[2px] mb-12' : 'max-w-xs h-[1px] mb-8'}`} style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
                    <p className={`${isExport ? 'text-3xl' : 'text-lg'} italic font-light`} style={{ color: 'rgba(255, 255, 255, 0.95)' }}>That's a lot of yapping!</p>
                </div>
            )
        },
        {
            id: 'active_days', // NEW STAT
            style: { background: 'linear-gradient(to bottom right, #8b5cf6, #6d28d9)' }, // violet-500 to violet-700
            render: ({ isExport }: { isExport?: boolean } = {}) => (
                <div className={`flex flex-col items-center justify-center h-full text-center ${isExport ? 'p-12' : 'p-6'}`}>
                    <Calendar className={`${isExport ? 'w-48 h-48 mb-12' : 'w-24 h-24 mb-8'}`} style={{ color: '#ffffff' }} />
                    <p className={`${isExport ? 'text-4xl mb-4' : 'text-2xl mb-2'} font-medium`} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Days Active</p>
                    <h2 className={`${isExport ? 'text-9xl mb-8' : 'text-7xl mb-6'} font-black`} style={{ color: '#ffffff' }}>
                        {stats.totalActiveDays || 0}
                    </h2>
                    <p className={`${isExport ? 'text-3xl' : 'text-xl'}`} style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        out of 365
                    </p>
                </div>
            )
        },
        {
            id: 'chatterbox',
            style: { background: 'linear-gradient(to bottom right, #ec4899, #e11d48)' }, // pink-500 to rose-600
            render: ({ isExport }: { isExport?: boolean } = {}) => (
                <div className={`flex flex-col items-center justify-center h-full text-center ${isExport ? 'p-12' : 'p-6'}`}>
                    <div className={`${isExport ? 'text-9xl mb-12' : 'text-6xl mb-4'}`}>📢</div>
                    <h2 className={`${isExport ? 'text-6xl mb-12' : 'text-3xl mb-6'} font-black uppercase`} style={{ color: '#ffffff' }}>Top Chatters</h2>
                    <div className="w-full flex flex-col items-center gap-2">
                        {topChatters.map(([name, count], i) => (
                            <ListItem key={name} rank={i + 1} label={name} value={count.toLocaleString()} isExport={isExport} />
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'nightOwl',
            style: { background: 'linear-gradient(to bottom right, #0f172a, #312e81)' }, // slate-900 to indigo-900
            render: ({ isExport }: { isExport?: boolean } = {}) => (
                <div className={`flex flex-col items-center justify-center h-full text-center ${isExport ? 'p-12' : 'p-6'}`}>
                    <Moon className={`${isExport ? 'w-48 h-48 mb-12' : 'w-24 h-24 mb-8'}`} style={{ color: '#ffeb3b' }} />
                    <p className={`${isExport ? 'text-4xl mb-4' : 'text-2xl mb-2'} font-medium`} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Peak Activity</p>
                    <h2 className={`${isExport ? 'text-8xl mb-8' : 'text-5xl mb-6'} font-black`} style={{ color: '#ffffff' }}>
                        {peakHourEntry ? peakHourEntry.label : 'N/A'}
                    </h2>
                    <p className={`${isExport ? 'text-4xl mb-12' : 'text-2xl mb-8'} font-semibold`} style={{ color: '#a5b4fc' }}>{vibe}</p>

                    <div className={`${isExport ? 'w-[800px] h-[400px]' : 'w-full max-w-xs h-32'}`}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyData}>
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {hourlyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.hour === peakHour ? '#fbbf24' : 'rgba(255, 255, 255, 0.3)'} />
                                    ))}
                                </Bar>
                                <XAxis dataKey="hour" hide />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )
        },
        {
            id: 'streak',
            style: { background: 'linear-gradient(to bottom right, #fb923c, #ef4444)' }, // orange-400 to red-500
            render: ({ isExport }: { isExport?: boolean } = {}) => (
                <div className={`flex flex-col items-center justify-center h-full text-center ${isExport ? 'p-12' : 'p-6'}`}>
                    <TrendingUp className={`${isExport ? 'w-48 h-48 mb-12' : 'w-24 h-24 mb-8'}`} style={{ color: '#ffffff' }} />
                    <p className={`${isExport ? 'text-4xl mb-6' : 'text-2xl mb-4'} font-medium`} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Longest Streak</p>
                    <h2 className={`${isExport ? 'text-[140px]' : 'text-8xl'} leading-none font-black mb-4`} style={{ color: '#ffffff' }}>
                        {longestStreak ? longestStreak.length : 0}
                    </h2>
                    <p className={`${isExport ? 'text-6xl mb-8' : 'text-3xl mb-4'} font-black uppercase tracking-widest`} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>DAYS</p>
                    <p className={`${isExport ? 'text-3xl' : 'text-lg'} font-medium`} style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {longestStreak ? `${format(longestStreak.start, 'd MMM')} - ${format(longestStreak.end, 'd MMM')}` : ''}
                    </p>
                </div>
            )
        },
        {
            id: 'replyTime',
            style: { background: 'linear-gradient(to bottom right, #06b6d4, #2563eb)' }, // cyan-500 to blue-600
            render: ({ isExport }: { isExport?: boolean } = {}) => (
                <div className={`flex flex-col items-center justify-center h-full text-center ${isExport ? 'p-12' : 'p-6'}`}>
                    <Zap className={`${isExport ? 'w-48 h-48 mb-12' : 'w-24 h-24 mb-8'}`} style={{ color: '#ffffff' }} />
                    <h2 className={`${isExport ? 'text-6xl mb-12' : 'text-3xl mb-6'} font-black uppercase`} style={{ color: '#ffffff' }}>Speed Demons</h2>
                    <p className={`${isExport ? 'mb-8 text-2xl' : 'mb-4 text-sm'}`} style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Avg time to reply</p>
                    <div className="w-full flex flex-col items-center gap-2">
                        {fastestRepliers.length > 0 ? fastestRepliers.map(([name, seconds], i) => {
                            const mins = Math.floor(seconds / 60);
                            const secs = Math.round(seconds % 60);
                            const valStr = `${mins}m ${secs}s`; // Updated format
                            return <ListItem key={name} rank={i + 1} label={name} value={valStr} isExport={isExport} />;
                        }) : <p className="text-white/50 text-2xl">No data available</p>}
                    </div>
                </div>
            )
        },
        {
            id: 'busiest',
            style: { background: 'linear-gradient(to bottom right, #ef4444, #ea580c)' }, // red-500 to orange-600
            render: ({ isExport }: { isExport?: boolean } = {}) => (
                <div className={`flex flex-col items-center justify-center h-full text-center ${isExport ? 'p-12' : 'p-6'}`}>
                    <Flame className={`${isExport ? 'w-48 h-48 mb-12' : 'w-24 h-24 mb-8'}`} style={{ color: '#ffffff' }} />
                    <p className={`${isExport ? 'text-4xl mb-6' : 'text-2xl mb-4'} font-medium`} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Most Chaotic Day</p>
                    <h2 className={`${isExport ? 'text-8xl mb-12' : 'text-5xl mb-6'} font-black`} style={{ color: '#ffffff' }}>
                        {busiestDay ? format(busiestDay.date, 'MMM do') : 'N/A'}
                    </h2>
                    <div className={`${isExport ? 'px-10 py-6 rounded-full mt-4' : 'px-6 py-3 rounded-full mt-2'}`} style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}>
                        <p className={`font-bold ${isExport ? 'text-4xl' : 'text-xl'}`} style={{ color: '#ffffff' }}>
                            {busiestDay ? `${busiestDay.count.toLocaleString()} messages` : ''}
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'vocab',
            style: { background: 'linear-gradient(to bottom right, #7c3aed, #a855f7)' }, // violet-600 to purple-500
            render: ({ isExport }: { isExport?: boolean } = {}) => (
                <div className={`flex flex-col items-center justify-center h-full text-center ${isExport ? 'p-12' : 'p-6'}`}>
                    <Quote className={`${isExport ? 'w-48 h-48 mb-12' : 'w-16 h-16 mb-6'}`} style={{ color: '#ffffff' }} />
                    <h2 className={`${isExport ? 'text-6xl mb-12' : 'text-3xl mb-6'} font-black uppercase`} style={{ color: '#ffffff' }}>Top Vocabulary</h2>
                    <div className="w-full flex flex-col items-center gap-2">
                        {stats.topWords.slice(0, 5).map((w, i) => (
                            <ListItem key={w.word} rank={i + 1} label={w.word} value={w.count} isExport={isExport} />
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'essayist',
            style: { background: 'linear-gradient(to bottom right, #c026d3, #db2777)' }, // fuchsia-600 to pink-600
            render: ({ isExport }: { isExport?: boolean } = {}) => (
                <div className={`flex flex-col items-center justify-center h-full text-center ${isExport ? 'p-12' : 'p-6'}`}>
                    <Type className={`${isExport ? 'w-48 h-48 mb-12' : 'w-16 h-16 mb-6'}`} style={{ color: '#ffffff' }} />
                    <h2 className={`${isExport ? 'text-6xl mb-12' : 'text-3xl mb-6'} font-black uppercase`} style={{ color: '#ffffff' }}>The Essayists</h2>
                    <p className={`${isExport ? 'mb-8 text-2xl' : 'mb-4 text-sm'}`} style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Avg chars per message</p>
                    <div className="w-full flex flex-col items-center gap-2">
                        {topEssayists.map(([name, len], i) => (
                            <ListItem key={name} rank={i + 1} label={name} value={Math.round(len)} sub="chars" isExport={isExport} />
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'novelist',
            style: { background: 'linear-gradient(to bottom right, #1e293b, #111827)' }, // slate-800 to gray-900
            render: ({ isExport }: { isExport?: boolean } = {}) => (
                <div className={`flex flex-col items-center justify-center h-full text-center ${isExport ? 'p-12' : 'p-6'}`}>
                    <div className={`${isExport ? 'text-9xl mb-12' : 'text-6xl mb-6'}`}>📜</div>
                    <p className={`${isExport ? 'text-4xl mb-6' : 'text-2xl mb-2'} font-medium`} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>The Novelist</p>
                    <h2 className={`${isExport ? 'text-5xl mb-8' : 'text-3xl mb-4'} font-black`} style={{ color: '#ffffff' }}>
                        {novelist ? novelist.author : 'N/A'}
                    </h2>
                    <div className={`${isExport ? 'p-10 rounded-3xl max-h-[400px] mb-8' : 'p-6 rounded-xl max-h-60 mb-4'} overflow-hidden relative`} style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                        <p className={`${isExport ? 'text-2xl' : 'text-sm'} italic leading-relaxed`} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                            "{novelist ? novelist.content.substring(0, 300) : ''}..."
                        </p>
                        <div className={`absolute bottom-0 left-0 right-0 ${isExport ? 'h-20' : 'h-10'} w-full`} style={{ background: 'linear-gradient(to top, rgba(17, 24, 39, 1), rgba(17, 24, 39, 0))' }} />
                    </div>
                    <p className={`effect-glow ${isExport ? 'text-3xl' : 'text-lg'} font-bold`} style={{ color: '#ffffff' }}>
                        {novelist ? `${novelist.length.toLocaleString()} characters` : 0}
                    </p>
                </div>
            )
        },
        {
            id: 'outro',
            style: { background: '#000000' },
            render: ({ isExport }: { isExport?: boolean } = {}) => (
                <div className={`flex flex-col items-center justify-center h-full text-center ${isExport ? 'p-12' : 'p-6'}`}>
                    <h2 className={`${isExport ? 'text-6xl mb-12' : 'text-3xl mb-8'} font-black uppercase`} style={{ color: '#ffffff' }}>Thanks for<br />chatting!</h2>
                    <div className="flex flex-col gap-6 w-full max-w-sm">
                        <button
                            onClick={onReset}
                            className={`bg-white text-black ${isExport ? 'px-10 py-5 text-2xl' : 'px-8 py-3 text-base'} rounded-full font-bold hover:scale-105 transition`}
                            style={{ backgroundColor: '#ffffff', color: '#000000' }}
                        >
                            Analyze Another Chat
                        </button>
                    </div>
                </div>
            )
        }
    ];

    const nextSlide = () => {
        if (currentIndex < slides.length - 1) setCurrentIndex(c => c + 1);
    };

    const prevSlide = () => {
        if (currentIndex > 0) setCurrentIndex(c => c - 1);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="relative w-full max-w-md h-full md:h-[800px] flex flex-col justify-center">

                {/* HIDDEN CONTAINER FOR BATCH CAPTURE */}
                {/* Positioned behind content but theoretically visible to DOM scanners */}
                <div ref={hiddenRef} className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none flex flex-col w-[1080px] h-[1920px] overflow-hidden">
                    {slides.map((s) => (
                        <div
                            key={s.id}
                            // Ensure dimensions are explicit and background is set
                            className="w-[1080px] h-[1920px] flex-shrink-0 flex flex-col"
                            style={s.style}
                        >
                            {/* Render MASSIVE EXPORT version here */}
                            {s.render({ isExport: true })}
                        </div>
                    ))}
                </div>

                {/* Main Card Container (Preview) */}
                <div
                    ref={slideRef}
                    className="relative w-full aspect-[9/16] md:aspect-auto md:h-full bg-black md:rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Progress Bar */}
                    <div className="absolute top-4 left-0 right-0 z-20 flex gap-1 px-2 pointer-events-none">
                        {slides.map((_, idx) => (
                            <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white"
                                    initial={{ width: 0 }}
                                    animate={{ width: idx < currentIndex ? '100%' : idx === currentIndex ? '100%' : '0%' }}
                                    transition={{ duration: idx === currentIndex ? 5 : 0 }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Exit Button */}
                    <button
                        onClick={onReset}
                        className="absolute top-6 right-4 z-40 text-white/50 hover:text-white pointer-events-auto exclude-from-capture"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Slide Content */}
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0"
                            style={slides[currentIndex].style}
                            onClick={(e) => {
                                // Simple tap navigation logic
                                const width = e.currentTarget.offsetWidth;
                                e.clientX > width / 2 ? nextSlide() : prevSlide();
                            }}
                        >
                            {/* Render NORMAL PREVIEW version here */}
                            {slides[currentIndex].render({ isExport: false })}
                        </motion.div>
                    </AnimatePresence>

                    {/* Watermark for shared images */}
                    <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-0 md:opacity-0 group-hover:opacity-100">
                        <span className="text-white/20 text-[10px] uppercase tracking-widest">Chat Wrapped 2025</span>
                    </div>
                </div>

                {/* Floating Controls (Outside Capture Area) */}
                <div className="absolute -bottom-16 md:bottom-8 left-0 right-0 flex justify-center gap-4 pointer-events-auto">
                    <button
                        onClick={downloadSlide}
                        disabled={isDownloading}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-6 py-3 rounded-full font-semibold transition"
                    >
                        {isDownloading ? (
                            <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                <span className="hidden md:inline">Save Slide</span>
                                <span className="md:hidden">Save</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={downloadAllSlides}
                        disabled={isDownloading}
                        className="flex items-center gap-2 bg-indigo-500/80 hover:bg-indigo-500 text-white backdrop-blur-md px-6 py-3 rounded-full font-semibold transition shadow-lg"
                    >
                        {isDownloading ? (
                            <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Layers className="w-5 h-5" />
                                <span className="hidden md:inline">Save All (ZIP)</span>
                                <span className="md:hidden">All</span>
                            </>
                        )}
                    </button>

                    <p className="fixed bottom-4 md:hidden text-white/30 text-xs text-center w-full pointer-events-none">
                        Tap Left/Right to Navigate
                    </p>
                </div>
            </div>
        </div>
    );
}
