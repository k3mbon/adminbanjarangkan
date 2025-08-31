import React, { useState, useEffect } from 'react';
import client, { sanityHelpers, queries } from '../sanity';
import { useAuth } from '../context/AuthContext.jsx';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/BlogForm.css';
import DOMPurify from 'dompurify';
import { PhotoIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const BlogForm = ({ dataToEdit, onFormSubmit }) => {
  const [judul, setJudul] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [isi, setIsi] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [gambar, setGambar] = useState(null);
  const [gambarThumbnail, setGambarThumbnail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const { currentUser } = useAuth();
  


  useEffect(() => {
    if (dataToEdit) {
      const content = dataToEdit.isi || '';
      setJudul(dataToEdit.judul || '');
      setDescription(dataToEdit.description || '');
      setAuthor(dataToEdit.author || '');
      setCategory(dataToEdit.category || '');
      setIsi(content);
      setEditorContent(content);
      setGambarThumbnail(dataToEdit.gambarThumbnail || '');
    }
  }, [dataToEdit]);

  
  const handleUpload = async () => {
    if (!gambar) return;

    try {
      // Upload image to Sanity
      const imageAsset = await sanityHelpers.uploadAsset(gambar, {
        filename: gambar.name
      });
      
      // Store the asset reference for use in the document
      setGambarThumbnail(imageAsset._id);
      console.log('Image uploaded successfully:', imageAsset);
      return imageAsset;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setSubmitStatus({ type: 'error', message: 'You must be logged in to create posts.' });
      return;
    }

    if (!judul.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter a title for your post.' });
      return;
    }

    if (!isi.trim() || isi === '<p><br></p>') {
      setSubmitStatus({ type: 'error', message: 'Please add some content to your post.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      let imageAsset = null;
      if (gambar) {
        imageAsset = await handleUpload();
      }

      // Determine status based on user role
      let status = 'draft';
      if (currentUser?.role === 'superadmin') {
        status = 'published';
      } else if (currentUser?.role === 'admin') {
        status = 'pending';
      }

      const blogPostData = {
        _type: 'blogPost',
        judul,
        description,
        author,
        category,
        isi,
        status,
        createdAt: new Date().toISOString()
      };

      if (imageAsset) {
        blogPostData.gambarThumbnail = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id
          }
        };
      }

      if (dataToEdit) {
        await sanityHelpers.patch(dataToEdit._id, blogPostData);
        setSubmitStatus({ type: 'success', message: 'Blog post updated successfully!' });
      } else {
        await sanityHelpers.create(blogPostData);
        setSubmitStatus({ type: 'success', message: 'Blog post created successfully!' });
      }

      // Reset form
      setJudul('');
      setDescription('');
      setAuthor('');
      setCategory('');
      setIsi('');
      setGambar(null);
      setGambarThumbnail('');
      
      if (onFormSubmit) {
        onFormSubmit();
      }
    } catch (error) {
      console.error('Error creating/updating blog post:', error);
      setSubmitStatus({ type: 'error', message: 'Failed to save post. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'link',
    'image',
    'video',
  ];

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {submitStatus && (
        <div className={`p-4 rounded-lg border ${
          submitStatus.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {submitStatus.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium">{submitStatus.message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div className="form-group">
          <label className="form-label">
            <DocumentTextIcon className="w-4 h-4 inline mr-2" />
            Article Title
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter your article title here..."
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label className="form-label">
            Description/Excerpt
          </label>
          <textarea
            className="form-control"
            placeholder="Enter a brief description or excerpt for your article..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            rows={3}
            maxLength={300}
          />
          <div className="text-sm mt-1" style={{color: 'var(--text-tertiary)'}}>
            {description.length}/300 characters
          </div>
        </div>

        {/* Author and Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Author Field */}
          <div className="form-group">
            <label className="form-label">
              Author
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter author name..."
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Category Field */}
          <div className="form-group">
            <label className="form-label">
              Category
            </label>
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Select a category...</option>
              <option value="news">News</option>
              <option value="announcement">Announcement</option>
              <option value="event">Event</option>
              <option value="achievement">Achievement</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        {/* Image Upload Field */}
        <div className="form-group">
          <label className="form-label">
            <PhotoIcon className="w-4 h-4 inline mr-2" />
            Featured Image (Optional)
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setGambar(e.target.files[0])}
              className="form-control"
              disabled={isSubmitting}
            />
            {gambar && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Selected: {gambar.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content Editor */}
        <div className="form-group">
          <label className="form-label">Article Content</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <ReactQuill
              key={`blogform-editor-${dataToEdit?._id || 'new'}`}
              value={editorContent}
              onChange={(value) => {
                setIsi(value || '');
                setEditorContent(value || '');
              }}
              placeholder="Write your article content here..."
              modules={quillModules}
              formats={quillFormats}
              style={{ minHeight: '300px' }}
              readOnly={isSubmitting}
              theme="snow"
            />
          </div>
        </div>

        {/* Status Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Publishing Status</h4>
          <p className="text-sm text-blue-800">
            {currentUser?.role === 'superadmin' 
              ? 'Your post will be published immediately.' 
              : currentUser?.role === 'admin'
              ? 'Your post will be submitted for review before publishing.'
              : 'Your post will be saved as a draft.'}
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary flex-1 sm:flex-none"
          >
            {isSubmitting ? (
              <>
                <div className="loading w-4 h-4 mr-2"></div>
                {dataToEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                {dataToEdit ? 'Update Post' : 'Create Post'}
              </>
            )}
          </button>
          
          {!dataToEdit && (
            <button
              type="button"
              onClick={() => {
                setJudul('');
                setDescription('');
                setAuthor('');
                setCategory('');
                setIsi('');
                setGambar(null);
                setGambarThumbnail('');
                setSubmitStatus(null);
              }}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Clear Form
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
