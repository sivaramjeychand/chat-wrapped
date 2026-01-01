import { useState, useMemo } from 'react';
import { UploadZone } from './components/UploadZone';
import { StoryViewer } from './components/StoryViewer';
import type { Message, ChatStats } from './types';
import { analyzeChat } from './utils/analytics';
import { MessageCircle } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const stats: ChatStats | null = useMemo(() => {
    if (!messages) return null;
    return analyzeChat(messages, 2025);
  }, [messages]);

  const handleReset = () => {
    setMessages(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-green-500/30">
      {!messages && (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-4 bg-green-500/10 rounded-2xl mb-6 ring-1 ring-green-500/20">
              <MessageCircle className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 mb-4 tracking-tight">
              Chat Wrapped
            </h1>
            <p className="text-xl text-slate-400">
              Discover your chat personality. Private, secure, and instant.
            </p>
          </header>

          <UploadZone
            onDataLoaded={setMessages}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />

          <footer className="mt-20 text-center text-slate-600 text-sm">
            <p>Designed for privacy. No data leaves your device.</p>
          </footer>
        </div>
      )}

      {messages && stats && (
        <StoryViewer
          stats={stats}
          onReset={handleReset}
          messages={messages}
        />
      )}
    </div>
  );
}

export default App;
