// ListAlbumFoto.jsx
import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa'; // Import the trash icon
import '../styles/ListAlbumFoto.css'; // Import your CSS file

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

  const handleDeleteAlbum = async (id, albumName) => {
    try {
      // Delete the album from Firestore
      await deleteDoc(doc(db, 'album_foto', id));

      // Delete the images in Firebase Storage
      const storageRef = storage.ref(`album_foto/${id}`);
      await storageRef.delete();

      // Update the local state to reflect the deletion
      setAlbums((prevAlbums) => prevAlbums.filter((album) => album.id !== id));

      console.log(`Album ${id} and associated images deleted successfully.`);
    } catch (error) {
      console.error('Error deleting album:', error);
    }
  };

  return (
    <div>
      <h2>Daftar Album</h2>
      <div className="album-list">
        {albums.map((album) => (
          <div key={album.id} className="album-card">
            <Link to={`/albums/${album.id}`}>
              <h3>{album.albumName}</h3>
              {/* Display other relevant details if needed */}
            </Link>
            <div className="delete-container">
              <button className="delete-button" onClick={() => handleDeleteAlbum(album.id, album.albumName)}>
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListAlbumFoto;
