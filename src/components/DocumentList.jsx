import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import ReactHtmlParser from 'html-react-parser'; // Import ReactHtmlParser
import '../styles/DocumentList.css'; // Import the CSS file

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'poststunda'));
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

  const extractFirstImage = (htmlContent) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const images = tempDiv.querySelectorAll('img');
    
    // Check if images exist and select the first one
    if (images && images.length > 0) {
      return images[0].src;
    }
  
    return null;
  };
  

  return (
    <div className="document-list-container">
      <h2>POST TERTUNDA</h2>
      <ul className="document-list">
        {documents.map((document) => (
          <li key={document.id} className="document-card">
            <Link to={`/document/${document.id}`}>
              {document.isi && (
                <img src={extractFirstImage(document.isi)} alt="Thumbnail" />
              )}
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

export default DocumentList;
