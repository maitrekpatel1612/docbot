import { useState } from 'react';
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

  const handleNewChat = async () => {
    try {
      clearMessages();
      setHasDocuments(false);
      setUploadedFiles([]);
      await clearCurrentSession();
      showNotification('Started a fresh chat session', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to start a new chat', 'error');
    }
  };

  const handleFilesDropped = async (files) => {
    try {
      const { uploadFiles } = await import('./services/api');
      const fileArray = Array.from(files);
      const MAX_FILES_PER_BATCH = 10;

      const batches = [];
      for (let i = 0; i < fileArray.length; i += MAX_FILES_PER_BATCH) {
        batches.push(fileArray.slice(i, i + MAX_FILES_PER_BATCH));
      }

      const uploadResponses = await Promise.all(batches.map(batch => uploadFiles(batch)));

      let uploadedNames = [];
      let totalFilesProcessed = 0;

      uploadResponses.forEach((response) => {
        if (response.success && response.data) {
          totalFilesProcessed += response.data.fileCount || 0;
          if (Array.isArray(response.data.files)) {
            uploadedNames = uploadedNames.concat(response.data.files);
          }
        }
      });

      if (totalFilesProcessed > 0) {
        setHasDocuments(true);
        setUploadedFiles((prev) => [...prev, ...uploadedNames]);
        showNotification(`Successfully uploaded ${totalFilesProcessed} file(s)`, 'success');
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
    <div className="relative min-h-screen overflow-hidden bg-[#020202] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -top-52 -left-32 w-[520px] h-[520px] bg-emerald-500/25 blur-[160px] animate-float-slow" />
        <div className="absolute top-24 right-[-120px] w-[420px] h-[420px] bg-cyan-500/20 blur-[160px] animate-float-slower" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),transparent_55%)]" />
      </div>

      {/* Slim App Bar */}
      <header className="fixed top-0 left-0 right-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200">DocBot</span>
          <button
            onClick={handleNewChat}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-4 py-1 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-500/30"
          >
            <span>New Chat</span>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div
            className={`px-5 py-3 rounded-2xl backdrop-blur-2xl border shadow-2xl text-sm ${
              notification.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100'
                : 'bg-red-500/15 border-red-400/30 text-red-100'
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-10 pt-24 sm:px-6 lg:px-8 space-y-6">
        <div className="mx-auto max-w-6xl min-h-[calc(100vh-200px)]">
          {/* Chat Console */}
          <section className="glass-panel relative flex min-h-[70vh] flex-col overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-10 top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl animate-float-slowest" />
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden pb-6">
              <ChatInterface
                messages={messages}
                onFilesDropped={handleFilesDropped}
              />
              {error && (
                <div className="absolute top-4 right-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-200 shadow-lg">
                  {error}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mx-auto w-full max-w-6xl rounded-[32px] border border-white/5 bg-black/70 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <MessageInput
            onSend={sendMessage}
            isLoading={isLoading}
            disabled={!hasDocuments && uploadedFiles.length === 0}
            onUploadClick={handleUploadClick}
            uploadedFiles={uploadedFiles}
            onRemoveFile={handleRemoveFile}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
