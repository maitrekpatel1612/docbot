import { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { MessageInput } from './components/MessageInput';
import { useChat } from './hooks/useChat';
import { useSession } from './hooks/useSession';

function App() {
  const [hasDocuments, setHasDocuments] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [notification, setNotification] = useState(null);
  const [uploadStatuses, setUploadStatuses] = useState([]);
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const { clearCurrentSession } = useSession();

  const generateUploadId = () =>
    (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  const createUploadEntries = (files) =>
    files.map((file) => ({
      id: generateUploadId(),
      name: file.name,
      type: file.type,
      progress: 0,
      status: 'uploading'
    }));

  const updateUploadProgress = (entryIds, progress) => {
    setUploadStatuses((prev) =>
      prev.map((entry) =>
        entryIds.includes(entry.id)
          ? { ...entry, progress }
          : entry
      )
    );
  };

  const scheduleUploadRemoval = (entryIds, delay) => {
    setTimeout(() => {
      setUploadStatuses((prev) => prev.filter((entry) => !entryIds.includes(entry.id)));
    }, delay);
  };

  const finalizeUploadStatus = (entryIds, status) => {
    setUploadStatuses((prev) =>
      prev.map((entry) =>
        entryIds.includes(entry.id)
          ? {
              ...entry,
              status,
              progress: status === 'completed' ? 100 : entry.progress,
              completedAt: Date.now()
            }
          : entry
      )
    );

    if (status === 'completed') {
      scheduleUploadRemoval(entryIds, 500); // Reduced from 2000ms to 500ms
    }

    if (status === 'error') {
      scheduleUploadRemoval(entryIds, 5000);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleNewChat = async () => {
    try {
      clearMessages();
      setHasDocuments(false);
      setUploadedFiles([]);
      setUploadStatuses([]);
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
      if (fileArray.length === 0) return;

      // Validate file sizes (10MB limit)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
      const oversizedFiles = fileArray.filter(file => file.size > MAX_FILE_SIZE);
      
      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map(f => f.name).join(', ');
        showNotification(
          `File(s) too large: ${fileNames}. Maximum size is 10MB per file.`,
          'error'
        );
        return;
      }

      const MAX_FILES_PER_BATCH = 10;
      const uploadEntries = createUploadEntries(fileArray);
      setUploadStatuses((prev) => [...prev, ...uploadEntries]);

      const batches = [];
      const entryBatches = [];
      for (let i = 0; i < fileArray.length; i += MAX_FILES_PER_BATCH) {
        batches.push(fileArray.slice(i, i + MAX_FILES_PER_BATCH));
        entryBatches.push(uploadEntries.slice(i, i + MAX_FILES_PER_BATCH));
      }

      const uploadPromises = batches.map((batch, index) => {
        const ids = entryBatches[index].map((entry) => entry.id);
        return uploadFiles(batch, {
          onUploadProgress: (event) => {
            if (!event.total) return;
            const percent = Math.round((event.loaded / event.total) * 100);
            updateUploadProgress(ids, percent);
          }
        })
          .then((response) => {
            finalizeUploadStatus(ids, 'completed');
            return response;
          })
          .catch((err) => {
            finalizeUploadStatus(ids, 'error');
            throw err;
          });
      });

      const settledResponses = await Promise.allSettled(uploadPromises);
      const successfulResponses = settledResponses
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);
      const failedResponses = settledResponses.filter((result) => result.status === 'rejected');

      let uploadedNames = [];
      let totalFilesProcessed = 0;

      successfulResponses.forEach((response) => {
        if (response.success && response.data) {
          totalFilesProcessed += response.data.fileCount || 0;
          if (Array.isArray(response.data.files)) {
            uploadedNames = uploadedNames.concat(response.data.files);
          }
        }
      });

      if (failedResponses.length > 0) {
        showNotification('Some documents failed to upload', 'error');
      }

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

      <header className="fixed top-0 left-0 right-0 z-30 border-b border-white/10 bg-black/10 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/40 bg-gradient-to-r from-white/5 to-emerald-500/5 px-5 py-3 text-xs font-bold uppercase tracking-[0.45em] text-emerald-100 shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
    
            <spa>DocBot</spa>
          </div>
          <button
            onClick={handleNewChat}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-emerald-400/50 bg-gradient-to-r from-emerald-500/20 to-green-500/20 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-500/30"
          >
            <span>New Chat</span>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

      {notification && (
        <div className="fixed top-20 sm:top-6 left-4 right-4 sm:left-auto sm:right-6 z-50 animate-slide-in">
          <div
            className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl backdrop-blur-2xl border shadow-2xl text-xs sm:text-sm ${
              notification.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100'
                : 'bg-red-500/15 border-red-400/30 text-red-100'
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      <main className="relative z-10 px-2 sm:px-4 pb-32 sm:pb-36 md:pb-40 pt-20 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-6xl min-h-[calc(100vh-200px)]">
          <section className="glass-panel relative flex min-h-[70vh] flex-col overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-10 top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl animate-float-slowest" />
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden pb-6">
              <ChatInterface
                messages={messages}
                onFilesDropped={handleFilesDropped}
                uploadPreviews={uploadStatuses}
                hasDocuments={hasDocuments || uploadedFiles.length > 0}
              />
              {error && (
                <div className="absolute top-4 right-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-200 shadow-lg">
                  {error}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 px-2 py-2 sm:px-4 sm:py-4 md:px-6 lg:px-8 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl rounded-2xl sm:rounded-[32px] border border-white/5 bg-black/70 p-2 sm:p-3 md:p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <MessageInput
            onSend={sendMessage}
            isLoading={isLoading}
            disabled={!hasDocuments && uploadedFiles.length === 0}
            onUploadClick={handleUploadClick}
            uploadedFiles={uploadedFiles}
            onRemoveFile={handleRemoveFile}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
