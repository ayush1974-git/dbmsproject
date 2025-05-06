import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Document {
  id: string;
  title: string;
  type: string;
  created_at: string;
  uploaded_by: string;
}

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [open, setOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/documents', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewDocument({ title: '', type: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDocument(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/documents', newDocument, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchDocuments();
      handleClose();
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/documents/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search documents..."
          className="px-4 py-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={handleOpen}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Document
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Created By</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc) => (
              <tr key={doc.id} className="border-b">
                <td className="px-6 py-4">{doc.title}</td>
                <td className="px-6 py-4">{doc.type}</td>
                <td className="px-6 py-4">{doc.uploaded_by}</td>
                <td className="px-6 py-4">{new Date(doc.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Document</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Document Title</label>
                <input
                  type="text"
                  name="title"
                  className="w-full px-4 py-2 border rounded"
                  value={newDocument.title}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block mb-1">Document Type</label>
                <select
                  name="type"
                  className="w-full px-4 py-2 border rounded"
                  value={newDocument.type}
                  onChange={handleInputChange}
                >
                  <option value="">Select Type</option>
                  <option value="Policy">Policy</option>
                  <option value="Procedure">Procedure</option>
                  <option value="Form">Form</option>
                  <option value="Report">Report</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDocument}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!newDocument.title || !newDocument.type}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
