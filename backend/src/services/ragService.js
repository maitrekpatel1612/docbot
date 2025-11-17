/**
 * RAG Service
 * Core RAG functionality with session-based management
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import dotenv from 'dotenv';
import vectorStoreService from './vectorStoreService.js';
import sessionService from './sessionService.js';
import { loadMultipleDocuments } from '../utils/documentLoader.js';

dotenv.config();

class RagService {
    constructor() {
        this.geminiModel = null;
    }

    /**
     * Initialize Google Gemini model
     * @returns {Object} Gemini model instance
     */
    initializeGemini() {
        if (this.geminiModel) {
            return this.geminiModel;
        }

        if (!process.env.GOOGLE_API_KEY) {
            throw new Error('GOOGLE_API_KEY not found in environment variables');
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        this.geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        console.log('Gemini model initialized');
        return this.geminiModel;
    }

    /**
     * Format retrieved documents into context string
     * @param {Array} retrievedDocs - Array of retrieved documents
     * @returns {string} Formatted context
     */
    formatDocs(retrievedDocs) {
        return retrievedDocs.map(doc => doc.pageContent).join('\n\n');
    }

    /**
     * Create LangChain-compatible wrapper for Gemini
     * @param {Object} model - Gemini model instance
     * @returns {Object} Model wrapper with invoke method
     */
    createModelWrapper(model) {
        return {
            invoke: async (promptValue) => {
                // Extract text from PromptValue or use as string
                const promptText = typeof promptValue === 'string' 
                    ? promptValue 
                    : promptValue.toString();
                
                const result = await model.generateContent(promptText);
                const response = await result.response;
                return response.text();
            }
        };
    }

    /**
     * Process uploaded documents and create vector store for session
     * @param {string} sessionId - Session ID
     * @param {Array<string>} filePaths - Array of file paths to process
     * @returns {Promise<Object>} Processing result
     */
    async processDocuments(sessionId, filePaths) {
        try {
            console.log(`Processing ${filePaths.length} documents for session ${sessionId}`);
            
            // Load all documents
            const documents = await loadMultipleDocuments(filePaths);
            
            if (documents.length === 0) {
                throw new Error('No documents could be loaded');
            }

            // Create vector store
            const vectorStore = await vectorStoreService.createVectorStore(documents);
            
            // Update session with vector store and full file paths
            sessionService.updateSession(sessionId, { 
                vectorStore,
                uploadedFiles: filePaths // Store full paths for cleanup
            });

            return {
                success: true,
                documentCount: documents.length,
                fileCount: filePaths.length
            };
        } catch (error) {
            console.error('Error processing documents:', error);
            throw error;
        }
    }

    /**
     * Chat with the RAG system
     * @param {string} sessionId - Session ID
     * @param {string} question - User question
     * @returns {Promise<string>} AI response
     */
    async chat(sessionId, question) {
        try {
            // Get session
            const session = sessionService.getSession(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            if (!session.vectorStore) {
                throw new Error('No documents uploaded. Please upload documents first.');
            }

            // Initialize Gemini model
            const model = this.initializeGemini();
            const modelWrapper = this.createModelWrapper(model);

            // Create retriever from vector store
            const retriever = session.vectorStore.asRetriever({ k: 3 });

            // Create prompt template
            const prompt = PromptTemplate.fromTemplate(`
You are a helpful assistant.
Answer ONLY from the provided document context.
If the context is insufficient, just say you don't know.

Context:
{context}

Question: {question}

Answer:`);

            // Create RAG chain
            const chain = RunnableSequence.from([
                {
                    context: async (input) => {
                        const docs = await retriever.getRelevantDocuments(input.question);
                        return this.formatDocs(docs);
                    },
                    question: (input) => input.question
                },
                prompt,
                async (input) => {
                    return await modelWrapper.invoke(input);
                },
                new StringOutputParser()
            ]);

            // Get response
            const response = await chain.invoke({ question });

            // Add to chat history
            sessionService.addChatMessage(sessionId, 'user', question);
            sessionService.addChatMessage(sessionId, 'assistant', response);

            return response;
        } catch (error) {
            console.error('Error in chat:', error);
            throw error;
        }
    }

    /**
     * Get chat history for session
     * @param {string} sessionId - Session ID
     * @returns {Array} Chat history
     */
    getChatHistory(sessionId) {
        const session = sessionService.getSession(sessionId);
        return session ? session.chatHistory : [];
    }
}

// Export singleton instance
export default new RagService();
