/**
 * FileUpload Component
 * Drag-and-drop file upload interface
 */

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFiles } from '../services/api';

export function FileUpload({ onUploadSuccess, onUploadError }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        setIsUploading(true);
        try {
            const response = await uploadFiles(acceptedFiles);
            // Backend returns { success, message, data: { fileCount, documentCount, files } }
            // uploadFiles already extracts response.data, so we access files directly
            if (response.success && response.data && response.data.files) {
                setUploadedFiles(response.data.files);
                onUploadSuccess?.(response);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to upload files';
            onUploadError?.(errorMessage);
        } finally {
            setIsUploading(false);
        }
    }, [onUploadSuccess, onUploadError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 5,
        maxSize: 10485760, // 10MB
        disabled: isUploading
    });

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-transparent to-white/0 backdrop-blur-xl p-8 text-center cursor-pointer shadow-[0_30px_90px_rgba(0,0,0,0.45)] transition-all duration-300 ${
                    isDragActive ? 'ring-2 ring-emerald-400/50 scale-[1.01]' : 'hover:border-emerald-400/40'
                } ${isUploading ? 'opacity-50 cursor-progress' : 'cursor-pointer'}`}
            >
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),transparent_55%)] animate-orbit" />
                <input {...getInputProps()} />
                <div className="relative flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-200 shadow-inner animate-pulse-slow">
                        <svg
                            className="w-7 h-7"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </div>
                    {isUploading ? (
                        <div className="flex items-center gap-2 text-sm text-emerald-200">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Uploading...
                        </div>
                    ) : isDragActive ? (
                        <p className="text-sm font-medium text-emerald-200">Release to drop files</p>
                    ) : (
                        <>
                            <p className="text-base font-semibold text-white">Drag & drop or click to select</p>
                            <p className="text-xs text-gray-400">PDF / DOCX · Max 5 files · 10MB each</p>
                        </>
                    )}
                </div>
            </div>

            {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Recent uploads</span>
                        <span>{uploadedFiles.length} file(s)</span>
                    </div>
                    <ul className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                            <li
                                key={index}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-200"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-200 flex items-center justify-center text-[11px] font-semibold">
                                        {index + 1}
                                    </span>
                                    <span className="truncate">{file}</span>
                                </div>
                                <svg
                                    className="w-4 h-4 text-emerald-300 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
