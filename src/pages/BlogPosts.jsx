import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../sanity';

function BlogPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const query = `*[_type == "blogPost"] | order(_createdAt desc) {
        _id,
        judul,
        description,
        author,
        category,
        isi,
        gambarThumbnail,
        status,
        _createdAt,
        _updatedAt
      }`;
      
      const data = await client.fetch(query);
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <div className="dashboard-container">
          <div className="page-header">
            <h1 className="page-title">Blog Posts</h1>
            <p className="page-subtitle">Artikel dan berita terbaru</p>
          </div>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="text-secondary">Memuat artikel...</p>
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
            <h1 className="page-title">Blog Posts</h1>
            <p className="page-subtitle">Artikel dan berita terbaru</p>
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
        <div className="page-header">
          <h1 className="page-title">Blog Posts</h1>
          <p className="page-subtitle">Artikel dan berita terbaru</p>
        </div>
        
        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3 className="empty-state-title">Belum ada artikel</h3>
            <p className="empty-state-description">Artikel blog akan ditampilkan di sini setelah dipublikasikan melalui Sanity CMS.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article 
                key={post._id}
                className="blog-card"
                onClick={() => navigate(`/posts/${post._id}`)}
              >
                <div className="card-image">
                  {post.gambarThumbnail ? (
                    <img 
                      src={typeof post.gambarThumbnail === 'string' ? post.gambarThumbnail : post.gambarThumbnail.asset?.url} 
                      alt={post.judul}
                      className="card-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="card-placeholder">
                      <div className="placeholder-icon">📝</div>
                      <span className="placeholder-text">No Image</span>
                    </div>
                  )}
                  <div className="card-overlay">
                    <div className="overlay-content">
                      {post.category && (
                        <span className="category-badge">
                          {post.category}
                        </span>
                      )}
                      {post.status && (
                        <span className={`status-badge status-${post.status}`}>
                          {post.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-content">
                  <div className="card-header">
                    <h2 className="card-title line-clamp-2">{post.judul}</h2>
                    <div className="card-meta">
                      <span className="meta-item">
                        <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="meta-text">{formatDate(post._createdAt)}</span>
                      </span>
                    </div>
                  </div>
                  {post.description && (
                    <p className="card-description line-clamp-3">{post.description}</p>
                  )}
                  {post.author && (
                    <div className="card-footer">
                      <div className="author-info">
                        <div className="author-avatar">
                          <div className="avatar-placeholder">
                            {post.author.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="author-details">
                          <span className="author-name">{post.author}</span>
                          <span className="author-role">Author</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default BlogPosts;
