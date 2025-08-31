// AlbumPreview.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import client, { sanityHelpers, queries, urlFor } from '../sanity';

const AlbumPreview = () => {
    const { albumId } = useParams();
    const [album, setAlbum] = useState(null);
  
    useEffect(() => {
        console.log('Album ID:', albumId);
        const fetchAlbum = async () => {
          try {
            const albumData = await sanityHelpers.getById(albumId);
            if (albumData) {
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
          {album.images && album.images.length > 0 ? (
            <div>
              <ul>
                {album.images.map((image, index) => (
                  <li key={index}>
                    <img src={urlFor(image).url()} alt={`album-image-${index}`} />
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
  