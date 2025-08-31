import React, { useState, useEffect } from 'react';
import client, { sanityHelpers, queries, urlFor } from '../sanity';
import { PortableText } from '@portabletext/react';
import { useAuth } from '../context/AuthContext';
import '../styles/PendingPostsList.css';
import { 
  CheckCircleIcon, 
  XMarkIcon, 
  TrashIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const PendingPostsList = () => {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const fetchPendingPosts = async () => {
    try {
      const postsData = await sanityHelpers.fetch(queries.getPendingPosts);
      setPendingPosts(postsData);
    } catch (error) {
      console.error('Error fetching pending posts:', error);
    }
  };

  const handlePublish = async (postId) => {
    if (currentUser?.role !== 'superadmin') {
      setMessage('Only superadmin can publish posts');
      return;
    }

    setLoading(true);
    try {
      await sanityHelpers.patch(postId, { status: 'published' });
      setMessage('Post published successfully!');
      fetchPendingPosts(); // Refresh the list
    } catch (error) {
      console.error('Error publishing post:', error);
      setMessage('Error publishing post');
    }
    setLoading(false);
  };

  const handleDelete = async (postId) => {
    if (currentUser?.role !== 'superadmin') {
      setMessage('Only superadmin can delete posts');
      return;
    }

    if (window.confirm('Are you sure you want to delete this post?')) {
      setLoading(true);
      try {
        await sanityHelpers.delete(postId);
        setMessage('Post deleted successfully!');
        fetchPendingPosts(); // Refresh the list
      } catch (error) {
        console.error('Error deleting post:', error);
        setMessage('Error deleting post');
      }
      setLoading(false);
    }
  };

  const handleReject = async (postId) => {
    if (currentUser?.role !== 'superadmin') {
      setMessage('Only superadmin can reject posts');
      return;
    }

    setLoading(true);
    try {
      await sanityHelpers.patch(postId, { status: 'draft' });
      setMessage('Post rejected and moved to draft!');
      fetchPendingPosts(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting post:', error);
      setMessage('Error rejecting post');
    }
    setLoading(false);
  };

  if (currentUser?.role !== 'superadmin') {
    return (
      <div className="card">
        <div className="card-content">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">Access Denied</h3>
              <p className="text-sm text-yellow-700">Only superadmin can view pending posts.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 ${
          message.includes('Error') 
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          {message.includes('Error') ? (
            <XMarkIcon className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="font-medium">{message}</span>
        </div>
      )}
      
      {pendingPosts && pendingPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingPosts.map((post) => (
            <div key={post._id} className="card group hover:shadow-lg transition-shadow">
              {/* Image */}
              {post.gambarThumbnail ? (
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img 
                    src={urlFor(post.gambarThumbnail).width(400).height(200).url()}
                    alt={post.judul || 'Post thumbnail'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
                  <ClockIcon className="w-12 h-12" style={{color: 'var(--text-muted)'}} />
                </div>
              )}
              
              <div className="card-content">
                {/* Title */}
                <h3 className="font-semibold mb-2 line-clamp-2" style={{color: 'var(--text-primary)'}}>
                  {post.judul || 'Untitled Post'}
                </h3>
                
                {/* Content Preview */}
                <div className="text-sm mb-4 line-clamp-3" style={{color: 'var(--text-secondary)'}}>
                  {post.isi && Array.isArray(post.isi) && post.isi.length > 0 ? (
                    <PortableText 
                      value={post.isi.slice(0, 1)} 
                      components={{
                        block: {
                          normal: ({children}) => <span>{children}</span>
                        }
                      }}
                    />
                  ) : (
                    <span className="italic" style={{color: 'var(--text-tertiary)'}}>No content available</span>
                  )}
                </div>
                
                {/* Meta Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs" style={{color: 'var(--text-tertiary)'}}>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                      {post.status || 'pending'}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={() => handlePublish(post._id)}
                    disabled={loading}
                    className="btn btn-success flex-1 text-sm"
                  >
                    {loading ? (
                      <div className="loading w-3 h-3 mr-1"></div>
                    ) : (
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                    )}
                    Publish
                  </button>
                  
                  <button 
                    onClick={() => handleReject(post._id)}
                    disabled={loading}
                    className="btn btn-warning flex-1 text-sm"
                  >
                    <XMarkIcon className="w-3 h-3 mr-1" />
                    Reject
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(post._id)}
                    disabled={loading}
                    className="btn btn-danger text-sm"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <InformationCircleIcon className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2" style={{color: 'var(--text-primary)'}}>No Pending Posts</h3>
              <p style={{color: 'var(--text-secondary)'}}>There are no posts waiting for review at the moment.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingPostsList;