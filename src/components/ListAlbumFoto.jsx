// ListAlbumFoto.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom for navigation

const ListAlbumFoto = () => {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'album_foto'));
        const albumsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAlbums(albumsData);
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };

    fetchAlbums();
  }, []);

  return (
    <div>
      <h2>Daftar Album</h2>
      <div className="album-list">
        {albums.map((album) => (
          <Link to={`/albums/${album.id}`} key={album.id} className="album-card">
            <h3>{album.albumName}</h3>
            {album.imageUrls && album.imageUrls.length > 0 && (
              <div>
                <p>Images:</p>
                <ul>
                  {album.imageUrls.map((imageUrl, index) => (
                    <li key={index}>
                      <img src={imageUrl} alt={`album-image-${index}`} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Add other fields as needed */}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ListAlbumFoto;
