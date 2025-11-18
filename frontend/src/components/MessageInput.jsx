/**
 * MessageInput Component
 * User input field for chat messages
 */

import { useState } from 'react';

export function MessageInput({ onSend, isLoading, disabled, onUploadClick, uploadedFiles, onRemoveFile }) {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSend(input);
            setInput('');
        }
    };

    return (
        <div className="space-y-2 sm:space-y-3">
            {uploadedFiles && uploadedFiles.length > 0 && (
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 pr-1 no-scrollbar">
                    {uploadedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="group flex-shrink-0 flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs text-gray-200 backdrop-blur transition hover:border-emerald-400/40"
                        >
                            <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-2xl bg-emerald-500/15 text-emerald-200 text-[10px] sm:text-xs font-semibold flex-shrink-0">
                                {index + 1}
                            </div>
                            <span className="max-w-[120px] sm:max-w-[180px] truncate">{file}</span>
                            {onRemoveFile && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveFile(index)}
                                    className="ml-0.5 sm:ml-1 text-gray-500 transition group-hover:text-red-300 flex-shrink-0"
                                    title="Remove"
                                >
                                    <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-2 py-2 sm:px-4 sm:py-3 shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur focus-within:border-emerald-400/40"
            >
                <button
                    type="button"
                    onClick={onUploadClick}
                    className="group flex h-9 w-9 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-500/20"
                    title="Upload files"
                >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={disabled ? 'Upload documents first' : 'Ask about your documents...'}
                    disabled={disabled || isLoading}
                    className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={disabled || isLoading || !input.trim()}
                    className="inline-flex flex-shrink-0 items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-black shadow-[0_15px_35px_rgba(16,185,129,0.35)] transition hover:shadow-[0_20px_45px_rgba(16,185,129,0.45)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending
                        </>
                    ) : (
                        <>
                            <span className="hidden xs:inline sm:inline">Send</span>
                            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
