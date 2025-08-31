import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client, { sanityHelpers, queries, urlFor } from '../sanity';
import BlogForm from './BlogForm';

const DocumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [documentDetails, setDocumentDetails] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleFormSubmit = async ({ judul, isi, gambarThumbnail }) => {
    try {
      const updatedDocument = await sanityHelpers.update(id, {
        judul: judul,
        isi: isi,
        gambarThumbnail: gambarThumbnail,
      });

      setDocumentDetails(updatedDocument);

      // Navigate back to the previous page
      navigate(-1);
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const document = await sanityHelpers.getById(id);
        if (document) {
          setDocumentDetails(document);
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
      {documentDetails.gambarThumbnail && (
            <img src={urlFor(documentDetails.gambarThumbnail).url()} alt="Thumbnail" />
          )}
      <h3>{documentDetails.judul}</h3>
      <div dangerouslySetInnerHTML={{ __html: documentDetails.isi }} />
      <button onClick={toggleEditMode}>Edit</button>
      <button onClick={goBack}>Kembali</button>
      {isEditMode && (
        <BlogForm
          dataToEdit={documentDetails}
          onFormSubmit={(data) => handleFormSubmit(data)}
        />
      )}
    </div>
  );
};

export default DocumentDetails;
