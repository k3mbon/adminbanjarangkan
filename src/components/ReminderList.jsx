// AgendaList.jsx
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/ReminderList.css';

const ReminderList = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'agenda'));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, []);

  return (
    <div className="document-list-container">
      <h2>POST TERTUNDA</h2>
      <ul className="document-list">
        {documents.map((document) => (
          <li key={document.id} className="document-card">
            <Link to={`/document/${document.id}`}>
              <img src={document.imageUrls} alt="Thumbnail" />
              <div className="document-card-content">
                <h3>{document.judul}</h3>
                <p>{document.isi}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReminderList;
