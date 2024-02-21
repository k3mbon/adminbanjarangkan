// src/components/DocumentDetails.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DocumentDetails = () => {
  const { id } = useParams();
  const [documentDetails, setDocumentDetails] = useState(null);

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const documentRef = doc(db, 'poststunda', id);
        const documentSnapshot = await getDoc(documentRef);
        if (documentSnapshot.exists()) {
          setDocumentDetails({ id, ...documentSnapshot.data() });
        } else {
          console.error('Document not found');
        }
      } catch (error) {
        console.error('Error fetching document details:', error);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  if (!documentDetails) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Document Details</h2>
      {/* Display detailed information about the document */}
      <img src={documentDetails.gambarUrls} alt="Thumbnail" />
      <h3>{documentDetails.judul}</h3>
      <p>{documentDetails.isi}</p>
      {/* Add more fields as needed */}
    </div>
  );
};

export default DocumentDetails;
