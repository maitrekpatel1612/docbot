/**
 * Vector Store Service
 * Manages FAISS vector store creation and operations
 */

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers';

class VectorStoreService {
    constructor() {
        this.embeddings = null;
    }

    /**
     * Initialize embeddings model (lazy loading)
     * @returns {Promise<HuggingFaceTransformersEmbeddings>}
     */
    async getEmbeddings() {
        if (!this.embeddings) {
            console.log('Initializing HuggingFace embeddings model...');
            this.embeddings = new HuggingFaceTransformersEmbeddings({
                modelName: "Xenova/all-MiniLM-L6-v2"
            });
            console.log('Embeddings model initialized');
        }
        return this.embeddings;
    }

    /**
     * Split documents into chunks
     * @param {Array} documents - Array of Document objects
     * @returns {Promise<Array>} Array of chunked documents
     */
    async splitDocuments(documents) {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 600,
            chunkOverlap: 150
        });

        const chunks = await splitter.splitDocuments(documents);
        console.log(`Created ${chunks.length} chunks from ${documents.length} documents`);
        
        return chunks;
    }

    /**
     * Create FAISS vector store from documents
     * @param {Array} documents - Array of Document objects
     * @returns {Promise<FaissStore>} FAISS vector store
     */
    async createVectorStore(documents) {
        if (!documents || documents.length === 0) {
            throw new Error('No documents provided to create vector store');
        }

        console.log('Creating vector store...');
        
        try {
            // Split documents into chunks
            const chunks = await this.splitDocuments(documents);
            
            // Get embeddings
            const embeddings = await this.getEmbeddings();
            
            // Create FAISS vector store
            const vectorStore = await FaissStore.fromDocuments(chunks, embeddings);
            
            console.log('Vector store created successfully');
            return vectorStore;
        } catch (error) {
            console.error('Error creating vector store:', error.message);
            console.error('Stack:', error.stack);
            throw new Error(`Failed to create vector store: ${error.message}`);
        }
    }

    /**
     * Add documents to existing vector store
     * @param {FaissStore} vectorStore - Existing vector store
     * @param {Array} documents - New documents to add
     * @returns {Promise<FaissStore>} Updated vector store
     */
    async addDocumentsToStore(vectorStore, documents) {
        const chunks = await this.splitDocuments(documents);
        await vectorStore.addDocuments(chunks);
        console.log(`Added ${chunks.length} new chunks to vector store`);
        return vectorStore;
    }
}

// Export singleton instance
export default new VectorStoreService();
