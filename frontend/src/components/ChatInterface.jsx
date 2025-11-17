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

    if (messages.length === 0) {
        return (
            <div 
                className="flex items-center justify-center h-full text-gray-500 relative"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isDragging && (
                    <div className="absolute inset-0 bg-[#00b8a3]/10 border-2 border-dashed border-[#00b8a3] rounded flex items-center justify-center z-10">
                        <div className="text-center">
                            <svg className="w-16 h-16 mx-auto mb-2 text-[#00b8a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-lg font-medium text-[#00b8a3]">Drop files here</p>
                        </div>
                    </div>
                )}
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-[#00b8a3]/10 rounded-lg flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-400">Empty</p>
                    <p className="text-xs mt-1 text-gray-600">Upload documents to start chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="h-full overflow-y-auto p-4 space-y-3 relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDragging && (
                <div className="absolute inset-0 bg-[#00b8a3]/10 border-2 border-dashed border-[#00b8a3] rounded flex items-center justify-center z-10">
                    <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-2 text-[#00b8a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-lg font-medium text-[#00b8a3]">Drop files here</p>
                    </div>
                </div>
            )}
            {messages.map((message, index) => (
                <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 ${
                            message.role === 'user'
                                ? 'bg-[#00b8a3] text-white shadow-sm'
                                : 'bg-[#1a1a1a] text-gray-200 border border-[#2d2d2d]'
                        }`}
                    >
                        <div className="flex items-start gap-2">
                            {message.role === 'assistant' && (
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 bg-[#00b8a3] rounded flex items-center justify-center">
                                    <svg
                                        className="w-3 h-3 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                                    </svg>
                                </div>
                            )}
                            {message.role === 'user' && (
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 bg-white/20 rounded flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                {message.role === 'assistant' ? (
                                    <div className="markdown-content text-[13px] leading-relaxed prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-[13px] whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                                )}
                                <p className="text-[9px] mt-1.5 opacity-40">
                                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}
