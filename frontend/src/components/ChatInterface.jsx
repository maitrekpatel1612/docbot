/**
 * ChatInterface Component
 * Displays chat messages with markdown rendering and drag & drop support
 */

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ChatInterface({ messages, onFilesDropped }) {
    const messagesEndRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const validFiles = files.filter(file => 
            file.type === 'application/pdf' || 
            file.name.endsWith('.docx')
        );

        if (validFiles.length > 0 && onFilesDropped) {
            onFilesDropped(validFiles);
        }
    };

    return (
        <div
            className="relative h-full"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="h-full overflow-y-auto px-6 py-6">
                {messages.length === 0 ? (
                    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center text-gray-400">
                        <div className="mb-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                            <svg className="mx-auto h-10 w-10 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="mt-3 text-base font-semibold text-white">Start the conversation</p>
                            <p className="text-xs text-gray-500">Drag & drop your documents into this chat to begin.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                    {messages.map((message, index) => {
                        const isUser = message.role === 'user';
                        const key = `${message.timestamp ?? index}-${index}`;

                        return (
                            <div key={key} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-message-pop`}>
                                <div
                                    className={`relative max-w-[80%] rounded-3xl px-4 py-3 text-sm shadow-[0_15px_45px_rgba(0,0,0,0.45)] transition-all ${
                                        isUser
                                            ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-black'
                                            : 'bg-white/5 border border-white/10 backdrop-blur'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-7 h-7 rounded-2xl flex items-center justify-center ${
                                            isUser ? 'bg-white/30 text-black' : 'bg-emerald-500/20 text-emerald-200'
                                        }`}>
                                            {isUser ? (
                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {isUser ? (
                                                <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">{message.content}</p>
                                            ) : (
                                                <div className="markdown-content text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                            <p className={`text-[10px] mt-2 ${isUser ? 'text-black/70' : 'text-gray-400'}`}>
                                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {isDragging && (
                <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-emerald-400/60 bg-emerald-500/10 backdrop-blur flex items-center justify-center text-emerald-100">
                    <div className="text-center">
                        <svg className="mx-auto mb-3 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-base font-semibold">Drop files to upload</p>
                        <p className="text-xs text-emerald-100/70">PDF / DOCX supported</p>
                    </div>
                </div>
            )}
        </div>
    );
}
