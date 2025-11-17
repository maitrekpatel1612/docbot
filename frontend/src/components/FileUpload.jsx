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
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                    transition-all duration-200
                    ${
                        isDragActive 
                            ? 'border-[#00b8a3] bg-[#00b8a3]/10 shadow-[0_0_20px_rgba(0,184,163,0.3)]' 
                            : 'border-[#2d2d2d] hover:border-[#00b8a3] bg-[#0a0a0a]'
                    }
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-14 h-14 bg-[#00b8a3]/10 rounded-lg flex items-center justify-center">
                        <svg
                            className="w-7 h-7 text-[#00b8a3]"
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
                        <div className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-[#00b8a3]" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="text-sm font-medium text-[#00b8a3]">Processing...</p>
                        </div>
                    ) : isDragActive ? (
                        <p className="text-sm font-medium text-[#00b8a3]">Drop files here</p>
                    ) : (
                        <>
                            <p className="text-sm font-medium text-white">
                                Drag & drop or click to select
                            </p>
                            <p className="text-xs text-gray-500">
                                PDF and DOCX • Max 5 files, 10MB each
                            </p>
                        </>
                    )}
                </div>
            </div>

            {uploadedFiles.length > 0 && (
                <div className="mt-3">
                    <h3 className="text-xs font-medium text-gray-400 mb-2">Uploaded Files</h3>
                    <ul className="space-y-1.5">
                        {uploadedFiles.map((file, index) => (
                            <li key={index} className="text-xs text-gray-300 flex items-center gap-2 bg-[#0a0a0a] px-3 py-2 rounded border border-[#2d2d2d]">
                                <svg
                                    className="w-3.5 h-3.5 text-[#00b8a3] flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="truncate">{file}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
