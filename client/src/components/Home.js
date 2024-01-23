import React, { useState, useEffect } from 'react';
import DocumentEditor from './DocumentEditor';
import { v4 as uuidv4 } from 'uuid';
import { io } from 'socket.io-client'; 


const socket = io('http://localhost:3001');

const Home = () => {
  const [documentId, setDocumentId] = useState('');

  const joinDocument = () => {
    setDocumentId(uuidv4());
    socket.emit('join', documentId);
  };

  return (
    <div>
      <h1>Collaborative Document Editor</h1>
      {documentId ? (
        <DocumentEditor documentId={documentId} />
      ) : (
        <button onClick={joinDocument}>Create Document</button>
      )}
    </div>
  );
};

export default Home;
