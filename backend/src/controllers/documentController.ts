import { Request, Response } from 'express';
import { executeQuery, generateUUID } from '../utils/dbUtils';

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        d.id,
        d.title,
        d.type,
        d.created_at,
        u.username as uploaded_by
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      ORDER BY d.created_at DESC
    `;
    
    const documents = await executeQuery(query);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

export const createDocument = async (req: Request, res: Response) => {
  try {
    const { title, type } = req.body;
    const userId = req.user?.id;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify user exists
    const userCheckQuery = 'SELECT id, username FROM users WHERE id = ?';
    const [user] = await executeQuery(userCheckQuery, [userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const id = generateUUID();
    const insertQuery = `
      INSERT INTO documents 
      (id, title, type, uploaded_by)
      VALUES (?, ?, ?, ?)
    `;

    await executeQuery(insertQuery, [id, title, type, userId]);

    res.status(201).json({ 
      message: 'Document created successfully',
      document: {
        id,
        title,
        type,
        uploaded_by: user.username,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleteQuery = 'DELETE FROM documents WHERE id = ?';
    await executeQuery(deleteQuery, [id]);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
}; 