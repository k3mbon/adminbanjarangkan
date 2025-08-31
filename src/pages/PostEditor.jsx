import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client, { sanityHelpers, queries, getBlogPostById, getBlogPostBySlug, createSlug } from '../sanity';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { 
  DocumentTextIcon, 
  PhotoIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  ArrowLeftIcon,
  EyeIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

const PostEditor = () => {
  const { id } = useParams(); // For editing existing posts
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    judul: '',
    isi: '', // Ensure this is always a string
    gambar: null,
    gambarThumbnail: '',
    status: 'draft'
  });
  
  // Separate state for editor to prevent initialization issues
  const [editorContent, setEditorContent] = useState('');
  
  // Rich text editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
  };
  
  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'link', 'image', 'video', 'blockquote', 'code-block'
  ];

  // Load existing post for editing
  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    setIsLoading(true);
    try {
      let post;
      
      // Check if id is a valid ObjectId (24 hex characters) or a slug
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      
      if (isObjectId) {
        // Fetch by ID
        post = await getBlogPostById(id);
      } else {
        // Fetch by slug
        post = await getBlogPostBySlug(id);
      }
      
      if (post) {
        const content = post.isi || '';
        setFormData({
          judul: post.judul || '',
          isi: content,
          gambar: null,
          gambarThumbnail: post.gambarThumbnail || '',
          status: post.status || 'draft'
        });
        // Set editor content separately to ensure proper initialization
        setEditorContent(content);
      }
    } catch (error) {
      console.error('Error loading post:', error);
      setSaveStatus({ type: 'error', message: 'Failed to load post' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Update editor content separately for 'isi' field
    if (field === 'isi') {
      setEditorContent(value || '');
    }
    setSaveStatus(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setSaveStatus({ type: 'error', message: 'Image size must be less than 5MB' });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSaveStatus({ type: 'error', message: 'Please select a valid image file' });
        return;
      }
      
      setFormData(prev => ({ ...prev, gambar: file }));
    }
  };

  const determinePostStatus = (action) => {
    if (action === 'draft') return 'draft';
    if (action === 'publish') {
      if (currentUser?.role === 'superadmin') return 'published';
      if (currentUser?.role === 'admin') return 'pending';
      return 'draft';
    }
    return 'draft';
  };

  const handleSave = async (action = 'draft') => {
    if (!formData.judul.trim()) {
      setSaveStatus({ type: 'error', message: 'Title is required' });
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      let gambarThumbnailAsset = formData.gambarThumbnail;
      
      // Upload new image if selected
      if (formData.gambar) {
        const imageAsset = await client.assets.upload('image', formData.gambar, {
          filename: formData.gambar.name
        });
        gambarThumbnailAsset = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id
          }
        };
      }

      const postData = {
        judul: formData.judul,
        isi: formData.isi,
        gambarThumbnail: gambarThumbnailAsset,
        status: determinePostStatus(action),
        author: {
          _type: 'reference',
          _ref: currentUser.uid
        },
        _type: 'blogPost'
      };

      let result;
      if (id) {
        // Update existing post
        result = await sanityHelpers.update(id, postData);
        setSaveStatus({ type: 'success', message: 'Post updated successfully!' });
      } else {
        // Create new post
        result = await sanityHelpers.create(postData);
        setSaveStatus({ type: 'success', message: 'Post created successfully!' });
        // Navigate to edit mode for the new post
        navigate(`/posts/edit/${result._id}`, { replace: true });
      }

      // Update form data with result
      setFormData(prev => ({
        ...prev,
        gambar: null,
        status: result.status
      }));

    } catch (error) {
      console.error('Error saving post:', error);
      setSaveStatus({ type: 'error', message: 'Failed to save post. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusInfo = () => {
    const status = formData.status;
    if (status === 'published') {
      return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', text: 'Published' };
    } else if (status === 'pending') {
      return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'Pending Review' };
    }
    return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', text: 'Draft' };
  };

  const getPublishButtonText = () => {
    if (currentUser?.role === 'superadmin') return 'Publish Now';
    if (currentUser?.role === 'admin') return 'Submit for Review';
    return 'Save as Draft';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading w-8 h-8"></div>
        <span className="ml-3 text-gray-600">Loading post...</span>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="content-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/posts')}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl">
              <DocumentTextIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {id ? 'Edit Post' : 'Create New Post'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {id ? 'Update your blog post' : 'Write and publish a new blog post'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border} border shadow-sm`}>
          {statusInfo.text}
        </div>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <div className={`p-4 rounded-lg border ${
          saveStatus.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {saveStatus.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <XMarkIcon className="w-5 h-5" />
            )}
            {saveStatus.message}
          </div>
        </div>
      )}

      {/* Editor Form */}
      <div className="content-card">
        <div className="space-y-6">
          {/* Title */}
          <div className="form-group">
            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Post Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-4 text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your post title..."
              value={formData.judul}
              onChange={(e) => handleInputChange('judul', e.target.value)}
              disabled={isSaving}
            />
          </div>

          {/* Featured Image */}
          <div className="form-group">
            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <PhotoIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              Featured Image (Optional)
            </label>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 transition-all"
                  disabled={isSaving}
                />
              </div>
              {formData.gambar && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <PhotoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formData.gambar.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {(formData.gambar.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div className="form-group">
            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <DocumentTextIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              Post Content
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-800">
              <ReactQuill
                key={`editor-${id || 'new'}`} // Force re-render when switching posts
                value={editorContent}
                onChange={(value) => handleInputChange('isi', value)}
                placeholder="Start writing your post content..."
                modules={quillModules}
                formats={quillFormats}
                style={{ minHeight: '450px' }}
                readOnly={isSaving}
                theme="snow"
              />
            </div>
          </div>

          {/* Publishing Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-5">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <EyeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Publishing Status
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              {currentUser?.role === 'superadmin' 
                ? 'As a superadmin, your posts will be published immediately.' 
                : currentUser?.role === 'admin'
                ? 'As an admin, your posts will be submitted for review before publishing.'
                : 'Your posts will be saved as drafts and require approval.'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="content-card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Save as Draft */}
          <button
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-6 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <div className="p-1 bg-white dark:bg-gray-800 rounded-lg">
                  <BookmarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <span>Save Draft</span>
              </>
            )}
          </button>
          
          {/* Publish/Submit */}
          <button
            onClick={() => handleSave('publish')}
            disabled={isSaving || !formData.judul.trim()}
            className="flex-1 sm:flex-none px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{id ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                <div className="p-1 bg-white/20 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <span>{getPublishButtonText()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;