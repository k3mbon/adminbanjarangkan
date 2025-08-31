import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client, { sanityHelpers, queries, urlFor } from '../sanity';
import { PortableText } from '@portabletext/react';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import '../styles/PostsList.css';

const PostsList = ({ searchTerm = '', statusFilter = 'all', categoryFilter = 'all' }) => {
  const navigate = useNavigate();
  
  // Local slug creation function
  const createSlug = (title) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim('-'); // Remove leading/trailing hyphens
  };
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(20);
  const [paginatedPosts, setPaginatedPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const postsData = await sanityHelpers.fetch(queries.getAllBlogPosts);
        console.log('Fetched posts data:', postsData);
        console.log('Posts with slug info:');
        postsData.forEach((post, index) => {
          console.log(`${index + 1}. "${post.judul}"`);
          console.log(`   Slug object:`, post.slug);
          console.log(`   Slug current:`, post.slug?.current);
          console.log('---');
        });
        setPosts(postsData);
        setError(null);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts based on search term and filters
  useEffect(() => {
    let filtered = [...posts];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.isi?.some(block => 
          block.children?.some(child => 
            child.text?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    // Filter by category (if you have categories in your schema)
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(post => post.category === categoryFilter);
    }

    setFilteredPosts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [posts, searchTerm, statusFilter, categoryFilter]);

  // Handle pagination
  useEffect(() => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    setPaginatedPosts(currentPosts);
  }, [filteredPosts, currentPage, postsPerPage]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'published': 'badge badge-success',
      'draft': 'badge badge-warning',
      'pending': 'badge badge-primary',
      'archived': 'badge'
    };
    return statusClasses[status?.toLowerCase()] || 'badge';
  };

  const handleViewPost = (post) => {
    // Navigate to post view using slug
    const slug = post.slug?.current || createSlug(post.judul || 'untitled');
    console.log('Post data:', post);
    console.log('Generated slug:', slug);
    console.log('Navigating to:', `/document/${slug}`);
    navigate(`/document/${slug}`);
  };

  const handleEditPost = (post) => {
    // Navigate to edit page using slug
    const slug = post.slug?.current || createSlug(post.judul || 'untitled');
    navigate(`/posts/edit/${slug}`);
  };

  const handleDeletePost = async (postId, postTitle) => {
    if (window.confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      try {
        await client.delete(postId);
        setPosts(posts.filter(post => post._id !== postId));
        alert('Post deleted successfully!');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content || !Array.isArray(content)) return 'No content available';
    
    const textContent = content
      .filter(block => block._type === 'block')
      .map(block => 
        block.children
          ?.filter(child => child._type === 'span')
          ?.map(span => span.text)
          ?.join(' ') || ''
      )
      .join(' ');
    
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...' 
      : textContent;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading"></div>
        <span className="ml-3" style={{color: 'var(--text-secondary)'}}>Loading posts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-2">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary mt-3"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!filteredPosts || filteredPosts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <DocumentTextIcon className="empty-icon-svg" />
        </div>
        <h3 className="empty-title">
          {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
            ? 'No posts match your filters' 
            : 'No posts found'
          }
        </h3>
        <p className="empty-description">
          {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
            ? 'Try adjusting your search or filter criteria.'
            : 'Get started by creating your first blog post.'
          }
        </p>
        {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
          <Link to="/create" className="btn btn-primary">
            <PlusIcon className="btn-icon" />
            Create Your First Post
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="posts-grid-container">
      <div className="posts-grid">
        {paginatedPosts.map((post) => (
          <div key={post._id} className="post-card">
            {/* Post Thumbnail */}
            <div className="post-thumbnail">
              {post.gambarThumbnail ? (
                <img
                  src={urlFor(post.gambarThumbnail).width(400).height(240).url()}
                  alt={post.judul}
                  className="post-image"
                />
              ) : (
                <div className="post-placeholder">
                  <DocumentTextIcon className="placeholder-icon" />
                  <span className="placeholder-text">No Image</span>
                </div>
              )}
              <div className="post-overlay">
                <span className={`post-status post-status-${post.status?.toLowerCase() || 'draft'}`}>
                  {post.status || 'Draft'}
                </span>
              </div>
            </div>
            
            {/* Post Content */}
            <div className="post-content">
              <div className="post-header">
                <h3 className="post-title">
                  {post.judul || 'Untitled Post'}
                </h3>
                <div className="post-meta">
                  <div className="meta-item">
                    <CalendarIcon className="meta-icon" />
                    <span className="meta-text">{formatDate(post._createdAt)}</span>
                  </div>
                  {post.author && (
                    <div className="meta-item">
                      <UserIcon className="meta-icon" />
                      <span className="meta-text">{post.author}</span>
                    </div>
                  )}
                  {post.category && (
                    <div className="meta-item">
                      <span className="category-badge">{post.category}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="post-description">
                {post.description || truncateContent(post.isi, 120)}
              </p>
              
              <div className="post-actions">
                <button 
                  className="action-btn action-btn-view"
                  title="View Post"
                  onClick={() => handleViewPost(post)}
                >
                  <EyeIcon className="action-icon" />
                  <span className="action-text">View</span>
                </button>
                <button 
                  className="action-btn action-btn-edit"
                  title="Edit Post"
                  onClick={() => handleEditPost(post)}
                >
                  <PencilIcon className="action-icon" />
                  <span className="action-text">Edit</span>
                </button>
                <button 
                  className="action-btn action-btn-delete"
                  title="Delete Post"
                  onClick={() => handleDeletePost(post._id, post.judul)}
                >
                  <TrashIcon className="action-icon" />
                  <span className="action-text">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span className="pagination-text">
              Showing {((currentPage - 1) * postsPerPage) + 1} to {Math.min(currentPage * postsPerPage, filteredPosts.length)} of {filteredPosts.length} posts
            </span>
          </div>
          
          <div className="pagination-controls">
            <button 
              className={`pagination-btn ${!hasPrevPage ? 'disabled' : ''}`}
              onClick={handlePrevPage}
              disabled={!hasPrevPage}
            >
              <ChevronLeftIcon className="pagination-icon" />
              Previous
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNumber}
                    className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                    onClick={() => handlePageClick(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            
            <button 
              className={`pagination-btn ${!hasNextPage ? 'disabled' : ''}`}
              onClick={handleNextPage}
              disabled={!hasNextPage}
            >
              Next
              <ChevronRightIcon className="pagination-icon" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsList;
