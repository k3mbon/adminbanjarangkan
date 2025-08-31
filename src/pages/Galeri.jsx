import React, { useState, useEffect } from 'react';
import client from '../sanity';
import GalleryForm from '../components/GalleryForm';
import { PlusIcon, FolderIcon, EyeIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

function Galeri() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'folders'
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showAlbumDetail, setShowAlbumDetail] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const query = `*[_type == "album"] | order(_createdAt desc) {
        _id,
        albumName,
        description,
        coverImage {
          asset-> {
            _id,
            url
          }
        },
        images[] {
          asset-> {
            _id,
            url
          },
          caption
        },
        _createdAt
      }`;
      
      const data = await client.fetch(query);
      setAlbums(data);
    } catch (err) {
      console.error('Error fetching albums:', err);
      setError('Gagal memuat album');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAlbum(null);
    fetchAlbums(); // Refresh the albums list
  };

  const handleViewAlbum = (album) => {
    setSelectedAlbum(album);
    setShowAlbumDetail(true);
  };

  const handleEditAlbum = (album) => {
    setEditingAlbum(album);
    setShowForm(true);
  };

  const handleDeleteAlbum = async (albumId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus album ini?')) {
      try {
        await client.delete(albumId);
        fetchAlbums(); // Refresh the albums list
      } catch (error) {
        console.error('Error deleting album:', error);
        alert('Gagal menghapus album');
      }
    }
  };

  const closeAlbumDetail = () => {
    setShowAlbumDetail(false);
    setSelectedAlbum(null);
  };

  if (loading) {
    return (
      <>
        <div className="dashboard-container">
          <div className="page-header">
            <h1 className="page-title">Galeri Foto</h1>
            <p className="page-subtitle">Koleksi foto kegiatan dan momen berharga</p>
          </div>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="text-secondary">Memuat galeri...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="dashboard-container">
          <div className="page-header">
            <h1 className="page-title">Galeri Foto</h1>
            <p className="page-subtitle">Koleksi foto kegiatan dan momen berharga</p>
          </div>
          <div className="alert alert-danger">
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="dashboard-container">
        <div className="content-header">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-800/30 rounded-2xl">
                <FolderIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Galeri Foto
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Koleksi foto kegiatan dan momen berharga
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Tampilan Grid
              </button>
              <button
                onClick={() => setViewMode('folders')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'folders'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Tampilan Folder
              </button>
            </div>
            
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <PlusIcon className="w-5 h-5" />
              {showForm ? 'Batal' : 'Tambah Album'}
            </button>
          </div>
        </div>
        
        {/* Gallery Form */}
        {showForm && (
          <div className="content-card">
            <GalleryForm 
              onSuccess={handleFormSuccess} 
              editingAlbum={editingAlbum}
            />
          </div>
        )}

        {/* Album Detail Modal */}
        {showAlbumDetail && selectedAlbum && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedAlbum.albumName}
                  </h2>
                  {selectedAlbum.description && (
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {selectedAlbum.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={closeAlbumDetail}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedAlbum.images && selectedAlbum.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedAlbum.images.map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={image.asset?.url}
                          alt={image.caption || `Foto ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                          onClick={() => window.open(image.asset?.url, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FolderIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Album ini belum memiliki foto</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {albums.length === 0 ? (
          <div className="content-card">
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mb-6">
                <FolderIcon className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Belum Ada Album
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Buat album foto pertama Anda untuk mulai mengatur koleksi galeri.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <PlusIcon className="w-5 h-5" />
                Buat Album Pertama
              </button>
            </div>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }`}>
            {albums.map((album) => (
              <div key={album._id} className={`${
                viewMode === 'grid'
                  ? 'content-card group hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]'
                  : 'content-card group hover:shadow-md transition-all duration-200'
              }`}>
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-video rounded-xl overflow-hidden mb-4 relative">
                      {album.coverImage?.asset?.url ? (
                        <img 
                          src={album.coverImage.asset.url} 
                          alt={album.albumName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                          <FolderIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleViewAlbum(album)}
                            className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                            title="Lihat Album"
                          >
                            <EyeIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                          </button>
                          <button
                            onClick={() => handleEditAlbum(album)}
                            className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                            title="Edit Album"
                          >
                            <PencilIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                          </button>
                          <button
                            onClick={() => handleDeleteAlbum(album._id)}
                            className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Hapus Album"
                          >
                            <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-lg">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {album.images?.length || 0} foto
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                        {album.albumName}
                      </h3>
                      {album.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                          {album.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{album.images?.length || 0} foto</span>
                        <span>{new Date(album._createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-4 p-2">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      {album.coverImage?.asset?.url ? (
                        <img 
                          src={album.coverImage.asset.url} 
                          alt={album.albumName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                          <FolderIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                        {album.albumName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-1 mb-2">
                        {album.description || 'Tanpa deskripsi'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{album.images?.length || 0} foto</span>
                        <span>{new Date(album._createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewAlbum(album)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Lihat Album"
                      >
                        <EyeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleEditAlbum(album)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit Album"
                      >
                        <PencilIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteAlbum(album._id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Hapus Album"
                      >
                        <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Galeri;