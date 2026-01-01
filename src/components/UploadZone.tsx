import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileType } from 'lucide-react';
import { clsx } from 'clsx';
import { parseFile } from '../utils/parsers';
import type { Message } from '../types';

interface UploadZoneProps {
    onDataLoaded: (msgs: Message[]) => void;
    isProcessing: boolean;
    setIsProcessing: (v: boolean) => void;
}

export function UploadZone({ onDataLoaded, isProcessing, setIsProcessing }: UploadZoneProps) {
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setIsProcessing(true);
        try {
            const file = acceptedFiles[0];
            const messages = await parseFile(file);
            // Artificial delay for effect
            await new Promise(r => setTimeout(r, 1500));
            onDataLoaded(messages);
        } catch (e) {
            console.error(e);
            alert("Failed to parse file");
        } finally {
            setIsProcessing(false);
        }
    }, [onDataLoaded, setIsProcessing]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/plain': ['.txt'],
            'application/json': ['.json']
        },
        maxFiles: 1
    });

    return (
        <div
            {...getRootProps()}
            className={clsx(
                "cursor-pointer border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all h-64",
                isDragActive ? "border-green-400 bg-green-500/10" : "border-slate-600 hover:border-slate-400 hover:bg-slate-800/50"
            )}
        >
            <input {...getInputProps()} />
            {isProcessing ? (
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-300 font-medium">Crunching your chat history...</p>
                    <p className="text-xs text-slate-500 mt-2">Running entirely on your device</p>
                </div>
            ) : (
                <>
                    <div className="bg-slate-800 p-4 rounded-full mb-4">
                        <UploadCloud className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="text-xl font-semibold text-white mb-2">Drop your chat file here</p>
                    <p className="text-slate-400 text-sm mb-6">WhatsApp (_chat.txt) or Telegram (.json)</p>
                    <div className="flex gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                        <FileType className="w-3 h-3" />
                        <span>Privacy First: Data never leaves your device</span>
                    </div>
                </>
            )}
        </div>
    );
}
