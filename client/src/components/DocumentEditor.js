import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const DocumentEditor = ({ documentId }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    socket.on('document', (document) => {
      setContent(document.content);
    });
  }, []);

  const handleUpdate = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    socket.emit('update', { documentId, content: newContent });
  };

  return <textarea value={content} onChange={handleUpdate}></textarea>;
};

export default DocumentEditor;
