// AlbumPreview.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, doc, getDoc } from 'firebase/firestore';

const AlbumPreview = () => {
    const { albumId } = useParams();
    const [album, setAlbum] = useState(null);
  
    useEffect(() => {
        console.log('Album ID:', albumId);
        const fetchAlbum = async () => {
          try {
            const albumDoc = await getDoc(doc(db, 'album_foto', albumId));
            if (albumDoc.exists()) {
              const albumData = albumDoc.data();
              console.log('Fetched Album Data:', albumData);
              setAlbum(albumData);
            } else {
              console.error('Album not found');
            }
          } catch (error) {
            console.error('Error fetching album:', error);
          }
        };
      
        fetchAlbum();
      }, [albumId]);
      
  
    if (!album) {
      return <p>Loading...</p>;
    }
  
    return (
        <div>
          <h2>{album.albumName}</h2>
          {album.imageUrls && album.imageUrls.length > 0 ? (
            <div>
              <ul>
                {album.imageUrls.map((imageUrl, index) => (
                  <li key={index}>
                    <img src={imageUrl} alt={`album-image-${index}`} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No images found in the album.</p>
          )}
          {/* Add other fields as needed */}
        </div>
      );
      
  };
  
  export default AlbumPreview;
  