/**
 * Document Loader Utility
 * Handles loading of PDF and DOCX files using LangChain loaders
 */

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import path from 'path';

/**
 * Load documents from file path based on file type
 * @param {string} filePath - Absolute path to the file
 * @returns {Promise<Array>} Array of Document objects
 */
export async function loadDocument(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    try {
        let loader;
        
        if (ext === '.pdf') {
            loader = new PDFLoader(filePath);
        } else if (ext === '.docx') {
            loader = new DocxLoader(filePath);
        } else {
            throw new Error(`Unsupported file type: ${ext}. Only PDF and DOCX are supported.`);
        }
        
        const documents = await loader.load();
        console.log(`Loaded ${documents.length} document chunks from ${path.basename(filePath)}`);
        
        return documents;
    } catch (error) {
        console.error(`Error loading document ${filePath}:`, error.message);
        throw error;
    }
}

/**
 * Load multiple documents from file paths
 * @param {Array<string>} filePaths - Array of absolute file paths
 * @returns {Promise<Array>} Combined array of all Document objects
 */
export async function loadMultipleDocuments(filePaths) {
    const allDocuments = [];
    
    for (const filePath of filePaths) {
        try {
            const docs = await loadDocument(filePath);
            allDocuments.push(...docs);
        } catch (error) {
            console.error(`Failed to load ${filePath}:`, error.message);
            // Continue loading other files even if one fails
        }
    }
    
    console.log(`Total documents loaded: ${allDocuments.length} from ${filePaths.length} files`);
    return allDocuments;
}

/**
 * Validate file type
 * @param {string} filename - Name of the file
 * @returns {boolean} True if file type is supported
 */
export function isValidFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    return ext === '.pdf' || ext === '.docx';
}
