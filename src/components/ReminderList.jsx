import React, { useState, useEffect } from 'react';
import { CalendarIcon, MapPinIcon, PencilIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import { sanityHelpers, queries } from '../sanity';
import '../styles/ReminderList.css';

const ReminderList = () => {
  const [agendaItems, setAgendaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchAgendaItems();
  }, []);

  const fetchAgendaItems = async () => {
    try {
      setLoading(true);
      const data = await sanityHelpers.fetch(queries.getAllAgenda);
      
      // Auto-delete past events (older than 24 hours)
      const now = new Date();
      const validItems = [];
      const itemsToDelete = [];
      
      data.forEach(item => {
        const eventDate = new Date(item.tanggal);
        const hoursDiff = (now - eventDate) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          itemsToDelete.push(item._id);
        } else {
          validItems.push(item);
        }
      });
      
      // Delete past events
      if (itemsToDelete.length > 0) {
        await Promise.all(itemsToDelete.map(id => sanityHelpers.delete(id)));
        console.log(`Otomatis menghapus ${itemsToDelete.length} acara yang sudah lewat`);
      }
      
      setAgendaItems(validItems);
    } catch (error) {
      console.error('Error mengambil item agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    // TODO: Implement edit functionality
    console.log('Edit item agenda:', item._id);
  };

  const handleDelete = async (id) => {
    if (deleteConfirm === id) {
      try {
        await sanityHelpers.delete(id);
        setAgendaItems(prev => prev.filter(item => item._id !== id));
        setDeleteConfirm(null);
        console.log('Item agenda berhasil dihapus');
      } catch (error) {
        console.error('Error menghapus item agenda:', error);
      }
    } else {
      setDeleteConfirm(id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate > now;
  };

  if (loading) {
    return (
      <div className="agenda-list-container">
        <div className="agenda-header">
          <h2>Acara Mendatang</h2>
          <p>Memuat acara...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agenda-list-container">
      <div className="agenda-header">
        <h2>Acara Mendatang</h2>
        <p>{agendaItems.length} acara aktif</p>
      </div>
      
      {agendaItems.length > 0 ? (
        <div className="agenda-grid">
          {agendaItems.map((item) => (
            <div key={item._id} className={`agenda-card ${isUpcoming(item.tanggal) ? 'upcoming' : 'current'}`}>
              <div className="agenda-card-header">
                <div className="agenda-date">
                  <CalendarIcon className="w-6 h-6" />
                  <span>{formatDate(item.tanggal)}</span>
                </div>
                <div className="agenda-actions">
                  <button
                    onClick={() => handleEdit(item)}
                    className="action-btn action-btn-edit"
                    title="Edit acara"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className={`action-btn action-btn-delete ${
                      deleteConfirm === item._id ? 'confirm' : ''
                    }`}
                    title={deleteConfirm === item._id ? 'Klik lagi untuk konfirmasi' : 'Hapus acara'}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="agenda-content">
                <h3 className="agenda-title">{item.judul}</h3>
                {item.isi && (
                  <p className="agenda-description">{item.isi}</p>
                )}
                {item.lokasi && (
                  <div className="agenda-location">
                    <MapPinIcon className="w-5 h-5" />
                    <span>{item.lokasi}</span>
                  </div>
                )}
              </div>
              
              <div className="agenda-meta">
                <div className="agenda-status">
                  <ClockIcon className="w-5 h-5" />
                  <span>{isUpcoming(item.tanggal) ? 'Mendatang' : 'Hari Ini'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <CalendarIcon className="empty-icon w-16 h-16" />
          <h3 className="empty-title">Tidak Ada Acara Terjadwal</h3>
          <p className="empty-description">
            Buat acara pertama Anda menggunakan formulir di atas.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReminderList;
