import React, { useState, useEffect } from 'react';
import client from '../sanity';
import PrestasiForm from '../components/PrestasiForm';

function Prestasi() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const query = `*[_type == "prestasi"] | order(_createdAt desc) {
        _id,
        title,
        description,
        image {
          asset-> {
            _id,
            url
          }
        },
        _createdAt
      }`;
      
      const data = await client.fetch(query);
      setAchievements(data);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Gagal memuat prestasi');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = (newAchievement) => {
    setAchievements(prev => [newAchievement, ...prev]);
    setShowForm(false);
    fetchAchievements(); // Refresh the list
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tanpa tanggal';
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
            <h1 className="page-title">Prestasi</h1>
            <p className="page-subtitle">Pencapaian dan penghargaan yang diraih</p>
          </div>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="text-secondary">Memuat prestasi...</p>
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
            <h1 className="page-title">Prestasi</h1>
            <p className="page-subtitle">Pencapaian dan penghargaan yang diraih</p>
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
          <div className="header-content">
            <h1 className="page-title">Prestasi</h1>
            <p className="page-subtitle">Pencapaian dan penghargaan yang diraih</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary"
            >
              <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
              {showForm ? 'Batal' : 'Tambah Prestasi'}
            </button>
          </div>
        </div>
        
        {showForm && (
          <div className="form-section">
            <PrestasiForm onSuccess={handleFormSuccess} />
          </div>
        )}
        
        {achievements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏆</div>
            <h3 className="empty-state-title">Belum ada prestasi</h3>
            <p className="empty-state-description">Klik tombol "Tambah Prestasi" untuk menambahkan prestasi baru.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div key={achievement._id} className="card card-hover group">
                <div className="card-image-container aspect-video">
                  {achievement.image?.asset?.url ? (
                    <img 
                      src={achievement.image.asset.url} 
                      alt={achievement.title}
                      className="card-image object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="card-placeholder">
                      <div className="placeholder-icon">🏆</div>
                      <span className="placeholder-text">Tanpa Gambar</span>
                    </div>
                  )}
                </div>
                <div className="card-content">
                  <div className="card-header">
                    <h3 className="card-title line-clamp-2">{achievement.title}</h3>
                    <div className="card-meta">
                      <span className="meta-item">
                        <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="meta-text">{formatDate(achievement._createdAt)}</span>
                      </span>
                    </div>
                  </div>
                  {achievement.description && (
                    <p className="card-description line-clamp-3">{achievement.description}</p>
                  )}
                  <div className="card-footer">
                    <div className="achievement-badge">
                      <svg className="achievement-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <span className="achievement-text">Prestasi</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Prestasi;
