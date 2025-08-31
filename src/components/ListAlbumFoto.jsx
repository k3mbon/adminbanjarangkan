import React, { useState, useEffect } from 'react';
import client, { sanityHelpers, queries, urlFor } from '../sanity';
import { Link } from 'react-router-dom';
import { TrashIcon, PhotoIcon, EyeIcon } from '@heroicons/react/24/outline';
import '../styles/ListAlbumFoto.css';

const ListAlbumFoto = () => {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const albumsData = await sanityHelpers.fetch(queries.getAllAlbums);
        setAlbums(albumsData);
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };

    fetchAlbums();
  }, []);

  const handleDeleteAlbum = async (id, albumName) => {
    try {
      // Get the album to access image assets
      const album = albums.find(a => a._id === id);
      
      // Delete associated image assets
      if (album && album.images) {
        for (const image of album.images) {
          if (image.asset && image.asset._ref) {
            await sanityHelpers.deleteAsset(image.asset._ref);
          }
        }
      }
      
      // Delete cover image asset if it exists
      if (album && album.coverImage && album.coverImage.asset && album.coverImage.asset._ref) {
        await sanityHelpers.deleteAsset(album.coverImage.asset._ref);
      }
      
      // Delete the album document from Sanity
      await sanityHelpers.delete(id);

      // Update the local state to reflect the deletion
      setAlbums((prevAlbums) => prevAlbums.filter((album) => album._id !== id));

      console.log(`Album ${id} and associated images deleted successfully.`);
    } catch (error) {
      console.error('Error deleting album:', error);
    }
  };

  return (
    <div className="album-list-container">
      <div className="album-header">
        <h2 className="album-title">Daftar Album Foto</h2>
        <p className="album-subtitle">Kelola koleksi foto sekolah</p>
      </div>
      
      {albums.length === 0 ? (
        <div className="empty-state">
          <PhotoIcon className="empty-icon" />
          <h3 className="empty-title">Belum ada album</h3>
          <p className="empty-description">Buat album pertama untuk menampilkan foto-foto sekolah</p>
        </div>
      ) : (
        <div className="album-grid">
          {albums.map((album) => (
            <div key={album._id} className="album-card">
              <div className="album-image-container">
                {album.coverImage ? (
                  <img 
                    src={urlFor(album.coverImage).width(300).height(200).url()} 
                    alt={album.albumName} 
                    className="album-image"
                  />
                ) : (
                  <div className="album-placeholder">
                    <PhotoIcon className="placeholder-icon" />
                  </div>
                )}
                <div className="album-overlay">
                  <Link to={`/albums/${album._id}`} className="view-album-btn">
                    <EyeIcon className="view-icon" />
                    <span>Lihat Album</span>
                  </Link>
                </div>
              </div>
              
              <div className="album-content">
                <h3 className="album-name">{album.albumName}</h3>
                <p className="album-description">{album.description}</p>
                <div className="album-meta">
                  <span className="image-count">
                    {album.images?.length || 0} foto
                  </span>
                </div>
              </div>
              
              <div className="album-actions">
                <button 
                  className="action-btn action-btn-delete"
                  onClick={() => handleDeleteAlbum(album._id, album.albumName)}
                  title="Hapus album"
                >
                  <TrashIcon className="action-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListAlbumFoto;
