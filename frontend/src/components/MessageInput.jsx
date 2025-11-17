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
        <div className="space-y-2">
            {/* Document Preview */}
            {uploadedFiles && uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-[#0a0a0a] rounded border border-[#2d2d2d]">
                    {uploadedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="group relative flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#2d2d2d] rounded text-xs text-gray-300 hover:border-[#00b8a3] transition-colors"
                        >
                            <svg className="w-4 h-4 text-[#00b8a3] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            <span className="max-w-[200px] truncate">{file}</span>
                            <span className="text-[10px] text-gray-500 font-medium">{index + 1}</span>
                            {onRemoveFile && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveFile(index)}
                                    className="ml-1 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                {/* Upload Button */}
                <button
                    type="button"
                    onClick={onUploadClick}
                    className="px-3 py-2.5 bg-[#1a1a1a] border border-[#2d2d2d] text-[#00b8a3] rounded hover:bg-[#2d2d2d] transition-all"
                    title="Upload files"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </button>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={disabled ? "Upload documents first" : "Type your question..."}
                disabled={disabled || isLoading}
                className="flex-1 px-4 py-2.5 bg-[#0a0a0a] border border-[#2d2d2d] text-white text-sm placeholder-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-[#00b8a3] focus:border-[#00b8a3] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
            <button
                type="submit"
                disabled={disabled || isLoading || !input.trim()}
                className="px-5 py-2.5 bg-[#00b8a3] text-white text-sm rounded font-medium hover:bg-[#009688] focus:outline-none focus:ring-1 focus:ring-[#00b8a3] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Sending</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span>Send</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                )}
                </button>
            </form>
        </div>
    );
}
