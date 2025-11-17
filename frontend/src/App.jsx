import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ChatInterface } from './components/ChatInterface';
import { MessageInput } from './components/MessageInput';
import { useChat } from './hooks/useChat';
import { useSession } from './hooks/useSession';

function App() {
  const [hasDocuments, setHasDocuments] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [notification, setNotification] = useState(null);
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const { clearCurrentSession } = useSession();

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUploadSuccess = (response) => {
    setHasDocuments(true);
    if (response.data && response.data.files) {
      setUploadedFiles(response.data.files);
    }
    showNotification(`Successfully uploaded ${response.data.fileCount} file(s)`, 'success');
  };

  const handleUploadError = (errorMessage) => {
    showNotification(errorMessage, 'error');
  };

  const handleClearSession = async () => {
    if (window.confirm('Are you sure you want to clear all documents and chat history?')) {
      clearMessages();
      setHasDocuments(false);
      setUploadedFiles([]);
      await clearCurrentSession();
    }
  };

  const handleFilesDropped = async (files) => {
    try {
      const { uploadFiles } = await import('./services/api');
      const response = await uploadFiles(files);
      if (response.success && response.data && response.data.files) {
        setHasDocuments(true);
        setUploadedFiles(response.data.files);
        showNotification(`Successfully uploaded ${response.data.fileCount} file(s)`, 'success');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to upload files', 'error');
    }
  };

  const handleUploadClick = () => {
    // Trigger file input click
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.docx';
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        await handleFilesDropped(files);
      }
    };
    input.click();
  };

  const handleRemoveFile = async (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) {
      setHasDocuments(false);
      clearMessages();
      await clearCurrentSession();
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Thin Navbar */}
      <header className="bg-[#1a1a1a] border-b border-[#2d2d2d] sticky top-0 z-40">
        <div className="max-w-full mx-auto px-6">
          <div className="flex items-center justify-between h-12">
            {/* Title */}
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-white">
                DocBot
              </h1>
              <p className="text-[10px] text-gray-500 -mt-0.5">RAG Based Document Assistant</p>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {hasDocuments && (
                <div className="flex items-center gap-2 text-xs text-[#00b8a3]">
                  <div className="w-1.5 h-1.5 bg-[#00b8a3] rounded-full"></div>
                  <span>Active</span>
                </div>
              )}
              
              {hasDocuments && (
                <button
                  onClick={handleClearSession}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#2d2d2d] hover:bg-[#3d3d3d] rounded transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 animate-fade-in">
          <div
            className={`px-4 py-2 rounded text-sm ${
              notification.type === 'success'
                ? 'bg-[#00b8a3] text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="h-[calc(100vh-49px)]">
        <div className="h-full">
          {/* Chat Section - Full Width */}
          <div className="h-full bg-[#1a1a1a] flex flex-col">
            <div className="flex-1 overflow-hidden bg-[#0a0a0a]">
                <ChatInterface 
                  messages={messages}
                  onFilesDropped={handleFilesDropped}
                />
              </div>
            </div>

            {error && (
              <div className="px-4 py-2 bg-red-900/20 border-t border-red-900/50">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <div className="p-4 border-t border-[#2d2d2d]">
              <MessageInput
                onSend={sendMessage}
                isLoading={isLoading}
                disabled={false}
                onUploadClick={handleUploadClick}
                uploadedFiles={uploadedFiles}
                onRemoveFile={handleRemoveFile}
              />
            </div>
          </div>
      </main>
    </div>
  );
}

export default App;
