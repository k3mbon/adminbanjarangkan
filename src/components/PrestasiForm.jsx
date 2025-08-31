import React, { useState } from 'react';
import client from '../sanity';
import '../styles/PrestasiForm.css';

function PrestasiForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToSanity = async (imageFile) => {
    const formDataForUpload = new FormData();
    formDataForUpload.append('file', imageFile);
    
    const response = await fetch(
      `https://${client.config().projectId}.api.sanity.io/v2021-03-25/assets/images/${client.config().dataset}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${client.config().token || process.env.REACT_APP_SANITY_TOKEN}`
        },
        body: formDataForUpload
      }
    );
    
    if (!response.ok) {
      throw new Error('Gagal mengunggah gambar');
    }
    
    return await response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let imageAsset = null;
      
      // Upload image if provided
      if (image) {
        imageAsset = await uploadImageToSanity(image);
      }

      // Create prestasi document matching the schema
      const prestasiDoc = {
        _type: 'prestasi',
        title: formData.title,
        description: formData.description,
        ...(imageAsset && {
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: imageAsset.document._id
            }
          }
        })
      };

      const result = await client.create(prestasiDoc);
      console.log('Prestasi dibuat:', result);

      // Reset form
      setFormData({
        title: '',
        description: ''
      });
      setImage(null);
      setImagePreview(null);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }
      
    } catch (err) {
      console.error('Error membuat prestasi:', err);
      setError('Gagal membuat prestasi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData({
      title: '',
      description: ''
    });
    setImage(null);
    setImagePreview(null);
    setError(null);
  };

  return (
    <div className="prestasi-form-container">
      <div className="form-header">
        <h2>Tambah Prestasi Baru</h2>
        <p>Buat entri prestasi baru</p>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="prestasi-form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            <i className="fas fa-trophy"></i>
            Judul *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Masukkan judul prestasi"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            <i className="fas fa-align-left"></i>
            Deskripsi
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Masukkan deskripsi prestasi"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="image" className="form-label">
            <i className="fas fa-image"></i>
            Gambar
          </label>
          <div className="image-upload-container">
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            <label htmlFor="image" className="file-input-label">
              <i className="fas fa-cloud-upload-alt"></i>
              Pilih Gambar
            </label>
          </div>
          
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Pratinjau" className="preview-image" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setImage(null);
                }}
                className="remove-image-btn"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={clearForm}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            <i className="fas fa-eraser"></i>
            Bersihkan Form
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !formData.title.trim()}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Membuat...
              </>
            ) : (
              <>
                <i className="fas fa-plus"></i>
                Buat Prestasi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrestasiForm;
