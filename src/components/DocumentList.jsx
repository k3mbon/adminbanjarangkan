import React, { useState, useEffect } from 'react';
import client, { sanityHelpers, queries, urlFor } from '../sanity';
import { Link } from 'react-router-dom';
import { PortableText } from '@portabletext/react';
import { DocumentTextIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline';
import '../styles/DocumentList.css';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const data = await sanityHelpers.fetch(queries.getAllBlogPosts);
        setDocuments(data || []);
        setError(null);
      } catch (error) {
        console.error('Error mengambil dokumen:', error);
        setError('Gagal memuat dokumen. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak ada tanggal';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return 'Tidak ada konten tersedia';
    if (typeof content === 'string') {
      return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    }
    return 'Pratinjau konten tidak tersedia';
  };
  

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5" />
            Dokumen Terbaru
          </h3>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5" />
            Dokumen Terbaru
          </h3>
        </div>
        <div className="card-content">
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5" />
          Dokumen Terbaru
        </h3>
        <span className="text-sm" style={{color: 'var(--text-secondary)'}}>
          {documents.length} {documents.length === 1 ? 'dokumen' : 'dokumen'}
        </span>
      </div>
      <div className="card-content">
        {documents.length > 0 ? (
          <div className="space-y-4">
            {documents.slice(0, 5).map((document) => (
              <Link
                key={document._id}
                to={`/document/${document._id}`}
                className="block group hover:bg-gray-50 p-3 rounded-lg transition-colors"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {document.gambarThumbnail ? (
                      <img
                        src={urlFor(document.gambarThumbnail).width(64).height(64).url()}
                        alt={document.judul || 'Thumbnail dokumen'}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <DocumentTextIcon className="w-6 h-6" style={{color: 'var(--text-tertiary)'}} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium group-hover:text-blue-600 transition-colors truncate" style={{color: 'var(--text-primary)'}}>
                      {document.judul || 'Dokumen Tanpa Judul'}
                    </h4>
                    
                    <div className="text-sm mt-1 line-clamp-2" style={{color: 'var(--text-secondary)'}}>
                      {document.isi && Array.isArray(document.isi) && document.isi.length > 0 ? (
                        <PortableText 
                          value={document.isi.slice(0, 1)} 
                          components={{
                            block: {
                              normal: ({children}) => <span>{children}</span>
                            }
                          }}
                        />
                      ) : (
                        'Tidak ada konten tersedia'
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs" style={{color: 'var(--text-tertiary)'}}>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {formatDate(document.createdAt)}
                      </span>
                      {document.status && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          document.status === 'published' 
                            ? 'bg-green-100 text-green-800'
                            : document.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100' + ' ' + 'text-gray-800'
                        }`}>
                          {document.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 flex items-center">
                    <svg className="w-4 h-4 group-hover:opacity-80 transition-colors" style={{color: 'var(--text-tertiary)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
            
            {documents.length > 5 && (
              <div className="pt-3 border-t border-gray-200">
                <Link
                  to="/posts"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <EyeIcon className="w-4 h-4" />
                  Lihat semua {documents.length} dokumen
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-3" style={{color: 'var(--text-muted)'}} />
            <p className="mb-2" style={{color: 'var(--text-secondary)'}}>Tidak ada dokumen ditemukan</p>
            <p className="text-sm" style={{color: 'var(--text-tertiary)'}}>Dokumen akan muncul di sini setelah dibuat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;
