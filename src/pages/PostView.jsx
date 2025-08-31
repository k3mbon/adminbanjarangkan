import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PortableText } from '@portabletext/react';
import client, { sanityHelpers, queries, urlFor, getBlogPostById, getBlogPostBySlug, createSlug } from '../sanity';
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import '../styles/PostView.css';

const PostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        let postData;
        
        // Check if id is a valid ObjectId (24 hex characters) or a slug
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        
        if (isObjectId) {
          postData = await getBlogPostById(id);
        } else {
          postData = await getBlogPostBySlug(id);
        }
        
        if (!postData) {
          setError('Post not found');
        } else {
          setPost(postData);
        }
      } catch (error) {
        console.error('PostView: Error during fetch:', error);
        setError('Failed to load post. Please try again.');
      } finally {
        console.log('PostView: Setting loading to false');
        setLoading(false);
      }
    };

    if (id) {
      console.log('PostView: useEffect triggered with id:', id);
      fetchPost();
    } else {
      console.log('PostView: No id provided');
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'published': 'status-badge status-published',
      'draft': 'status-badge status-draft',
      'pending': 'status-badge status-pending',
      'archived': 'status-badge status-archived'
    };
    return statusClasses[status?.toLowerCase()] || 'status-badge';
  };

  // Custom components for PortableText
  const portableTextComponents = {
    types: {
      image: ({ value }) => {
        if (!value?.asset) return null;
        return (
          <div className="post-image-container">
            <img
              src={urlFor(value).width(800).height(600).url()}
              alt={value.alt || 'Post image'}
              className="post-content-image"
            />
            {value.caption && (
              <p className="image-caption">{value.caption}</p>
            )}
          </div>
        );
      },
    },
    block: {
      normal: ({ children }) => <p className="post-paragraph">{children}</p>,
      h1: ({ children }) => <h1 className="post-heading-1">{children}</h1>,
      h2: ({ children }) => <h2 className="post-heading-2">{children}</h2>,
      h3: ({ children }) => <h3 className="post-heading-3">{children}</h3>,
      h4: ({ children }) => <h4 className="post-heading-4">{children}</h4>,
      blockquote: ({ children }) => <blockquote className="post-blockquote">{children}</blockquote>,
    },
    marks: {
      strong: ({ children }) => <strong className="post-strong">{children}</strong>,
      em: ({ children }) => <em className="post-emphasis">{children}</em>,
      link: ({ value, children }) => (
        <a href={value.href} className="post-link" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
    },
    list: {
      bullet: ({ children }) => <ul className="post-list">{children}</ul>,
      number: ({ children }) => <ol className="post-list post-list-numbered">{children}</ol>,
    },
    listItem: {
      bullet: ({ children }) => <li className="post-list-item">{children}</li>,
      number: ({ children }) => <li className="post-list-item">{children}</li>,
    },
  };

  if (loading) {
    return (
      <>
        <div className="post-view-loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading post...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="post-view-error">
          <div className="error-content">
            <h2 className="error-title">Error Loading Post</h2>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button 
                onClick={() => navigate('/posts')} 
                className="btn btn-secondary"
              >
                <ArrowLeftIcon className="btn-icon" />
                Back to Posts
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <div className="post-view-not-found">
          <div className="not-found-content">
            <h2 className="not-found-title">Post Not Found</h2>
            <p className="not-found-message">The post you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => navigate('/posts')} 
              className="btn btn-primary"
            >
              <ArrowLeftIcon className="btn-icon" />
              Back to Posts
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="post-view">
        {/* Header */}
        <div className="post-view-header">
          <button 
            onClick={() => navigate('/posts')} 
            className="back-button"
          >
            <ArrowLeftIcon className="back-icon" />
            <span>Back to Posts</span>
          </button>
          
          <div className="post-actions-header">
            <button 
              onClick={() => navigate(`/posts/edit/${post.slug || createSlug(post.judul) || post._id}`)} 
              className="btn btn-secondary"
            >
              <PencilIcon className="btn-icon" />
              Edit Post
            </button>
          </div>
        </div>

        {/* Post Content */}
        <article className="post-article">
          {/* Featured Image */}
          {post.gambarThumbnail && (
            <div className="post-featured-image">
              <img
                src={urlFor(post.gambarThumbnail).width(1200).height(600).url()}
                alt={post.judul}
                className="featured-image"
              />
            </div>
          )}

          {/* Post Header */}
          <header className="post-article-header">
            <div className="post-meta-info">
              <span className={getStatusBadge(post.status)}>
                {post.status || 'Draft'}
              </span>
              
              <div className="post-meta-items">
                <div className="meta-item">
                  <CalendarIcon className="meta-icon" />
                  <span className="meta-text">
                    Published {formatDate(post._createdAt)}
                  </span>
                </div>
                
                {post.author && (
                  <div className="meta-item">
                    <UserIcon className="meta-icon" />
                    <span className="meta-text">{post.author}</span>
                  </div>
                )}
                
                {post.category && (
                  <div className="meta-item">
                    <TagIcon className="meta-icon" />
                    <span className="meta-text">{post.category}</span>
                  </div>
                )}
              </div>
            </div>
            
            <h1 className="post-article-title">{post.judul || 'Untitled Post'}</h1>
            
            {/* Post Description/Excerpt */}
            {post.description && (
              <div className="post-description">
                {Array.isArray(post.description) ? (
                  <PortableText 
                    value={post.description} 
                    components={portableTextComponents}
                  />
                ) : (
                  <p className="description-text">{post.description}</p>
                )}
              </div>
            )}
          </header>

          {/* Post Content */}
          <div className="post-article-content">
            {post.isi && Array.isArray(post.isi) && post.isi.length > 0 ? (
              <PortableText 
                value={post.isi} 
                components={portableTextComponents}
              />
            ) : (
              <div className="no-content">
                <p>No content available for this post.</p>
              </div>
            )}
          </div>

          {/* Additional Images */}
          {post.gambar && Array.isArray(post.gambar) && post.gambar.length > 0 && (
            <div className="post-gallery">
              <h3 className="gallery-title">Gallery</h3>
              <div className="gallery-grid">
                {post.gambar.map((image, index) => (
                  <div key={index} className="gallery-item">
                    <img
                      src={urlFor(image).width(400).height(300).url()}
                      alt={`Gallery image ${index + 1}`}
                      className="gallery-image"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </>
  );
};

export default PostView;