import { Router } from 'express';
import { getDocuments, createDocument, deleteDocument } from '../controllers/documentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all documents
router.get('/', authenticateToken, getDocuments);

// Create a new document
router.post('/', authenticateToken, createDocument);

// Delete a document
router.delete('/:id', authenticateToken, deleteDocument);

export default router; 