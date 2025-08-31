import { useState, useEffect } from 'react';
import client, { sanityHelpers, queries } from '../sanity';
import { PhotoIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import '../styles/GalleryForm.css';

const GalleryForm = ({ onSuccess, editingAlbum }) => {
  const [albumName, setAlbumName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [existingImages, setExistingImages] = useState([]);

  // Pre-populate form when editing
  useEffect(() => {
    if (editingAlbum) {
      setAlbumName(editingAlbum.albumName || '');
      setDescription(editingAlbum.description || '');
      if (editingAlbum.images) {
        setExistingImages(editingAlbum.images);
      }
    } else {
      // Reset form when not editing
      setAlbumName('');
      setDescription('');
      setExistingImages([]);
      setSelectedImages([]);
      setImagePreviews([]);
    }
  }, [editingAlbum]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const validPreviews = [];
    
    files.forEach((file) => {
      // Check file size (500KB = 500 * 1024 bytes)
      if (file.size > 500 * 1024) {
        alert(`File ${file.name} terlalu besar. Ukuran maksimal adalah 500KB.`);
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} bukan gambar yang valid.`);
        return;
      }
      
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });
    
    setSelectedImages([...selectedImages, ...validFiles]);
    setImagePreviews([...imagePreviews, ...validPreviews]);
  };

  const handleImageDelete = (index) => {
    const updatedSelectedImages = [...selectedImages];
    const updatedImagePreviews = [...imagePreviews];

    updatedSelectedImages.splice(index, 1);
    updatedImagePreviews.splice(index, 1);

    setSelectedImages(updatedSelectedImages);
    setImagePreviews(updatedImagePreviews);
  };

  const handleImageUpload = async () => {
    if (!albumName || (selectedImages.length === 0 && existingImages.length === 0)) {
      // Ensure that albumName and at least one image is provided
      return;
    }

    setUploading(true);

    try {
      // Upload new images to Sanity and collect asset references
      const newImageAssets = [];

      for (const [index, image] of selectedImages.entries()) {
        if (!image) {
          console.error('Gambar tidak ada');
          continue;
        }

        const imageAsset = await sanityHelpers.uploadAsset(image, {
          filename: `${index}_${image.name}`
        });

        newImageAssets.push({
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id
          }
        });
      }

      // Combine existing images with new images
      const allImages = [...existingImages, ...newImageAssets];

      // Create or update album document
      const albumData = {
        _type: 'album',
        albumName,
        description,
        images: allImages,
        coverImage: allImages.length > 0 ? allImages[0] : null, // Use first image as cover
        ...(editingAlbum ? {} : { createdAt: new Date().toISOString() })
      };

      let albumRef;
      if (editingAlbum) {
        // Update existing album
        albumRef = await client.patch(editingAlbum._id).set(albumData).commit();
        console.log('Album berhasil diperbarui!', albumRef);
      } else {
        // Create new album
        albumRef = await sanityHelpers.create(albumData);
        console.log('Album berhasil dibuat!', albumRef);
      }

      // Clear form fields and reset state
      setAlbumName('');
      setDescription('');
      setSelectedImages([]);
      setImagePreviews([]);
      setExistingImages([]);
      setUploading(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saat upload gambar: ', error);
      setUploading(false);
    }
  };

  return (
    <div className="gallery-form">
      <div className="gallery-form-header">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-800/30 rounded-xl">
            <PhotoIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <h2 className="gallery-form-title">{editingAlbum ? 'Edit Album' : 'Buat Album Baru'}</h2>
        <p className="gallery-form-subtitle">Upload foto dengan maksimal 500KB per file</p>
      </div>
      
      <div className="space-y-6">
        <div className="form-group">
          <label className="form-label">Nama Album</label>
          <input
            type="text"
            className="form-input"
            placeholder="Masukkan nama album"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Deskripsi Album</label>
          <textarea
            className="form-textarea"
            placeholder="Masukkan deskripsi album (opsional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="image-upload-section">
          <label className="form-label">Upload Foto</label>
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            id="album-images"
          />
          <label htmlFor="album-images" className="image-upload-dropzone block cursor-pointer">
            <div className="text-center">
              <PlusIcon className="upload-icon" />
              <div className="upload-text">Pilih foto untuk album</div>
              <div className="upload-hint">Maksimal 500KB per file • Klik untuk memilih</div>
            </div>
          </label>
        </div>
        
        {(existingImages.length > 0 || imagePreviews.length > 0) && (
          <div className={`image-container has-images`}>
            {/* Existing Images */}
            {existingImages.map((image, index) => (
              <div key={`existing-${index}`} className="image-item">
                <img
                  src={image.asset?.url}
                  alt={`Gambar ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="image-item-overlay">
                  <button
                    type="button"
                    className="image-remove-btn"
                    onClick={() => {
                      const updatedExisting = [...existingImages];
                      updatedExisting.splice(index, 1);
                      setExistingImages(updatedExisting);
                    }}
                    title="Hapus foto"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {/* New Images */}
            {imagePreviews.map((preview, index) => (
              <div key={`new-${index}`} className="image-item">
                <img
                  src={preview}
                  alt={`Pratinjau ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="image-item-overlay">
                  <button
                    type="button"
                    className="image-remove-btn"
                    onClick={() => handleImageDelete(index)}
                    title="Hapus foto"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-end pt-4">
          <button
            type="button"
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
              uploading || !albumName || selectedImages.length === 0
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
            }`}
            onClick={handleImageUpload}
            disabled={uploading || !albumName || (selectedImages.length === 0 && existingImages.length === 0)}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Mengupload...
              </>
            ) : (
              <>
                <PhotoIcon className="w-5 h-5" />
                {editingAlbum ? 'Perbarui Album' : 'Buat Album'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryForm;
