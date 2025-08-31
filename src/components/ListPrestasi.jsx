import React, { useState, useEffect } from 'react';
import client, { sanityHelpers, queries, urlFor } from '../sanity';
import { PencilIcon, TrashIcon, TrophyIcon } from '@heroicons/react/24/outline';
import '../styles/ListPrestasi.css';

const ListPrestasi = () => {
  const [prestasiList, setPrestasiList] = useState([]);

  useEffect(() => {
    const fetchPrestasiList = async () => {
      try {
        const prestasiData = await sanityHelpers.fetch(queries.getAllPrestasi);
        setPrestasiList(prestasiData);
      } catch (error) {
        console.error('Error fetching prestasi list: ', error);
      }
    };

    fetchPrestasiList();
  }, []); // Fetch data on component mount

  const handleEdit = (prestasi) => {
    // TODO: Implement edit functionality
    console.log('Edit prestasi:', prestasi);
  };

  const handleDelete = async (prestasiId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus prestasi ini?')) {
      try {
        await sanityHelpers.delete(prestasiId);
        // Refresh the list
        const updatedList = await sanityHelpers.fetch(queries.getAllPrestasi);
        setPrestasiList(updatedList);
      } catch (error) {
        console.error('Error deleting prestasi:', error);
      }
    }
  };

  return (
    <div className="prestasi-list-container">
      {prestasiList && prestasiList.length > 0 ? (
        <div className="prestasi-grid">
          {prestasiList.map((prestasi) => (
            <div key={prestasi._id} className="prestasi-card">
              <div className="prestasi-image-container">
                {prestasi.image ? (
                  <img
                    src={urlFor(prestasi.image).width(400).height(250).url()}
                    alt={prestasi.title}
                    className="prestasi-image"
                  />
                ) : (
                  <div className="prestasi-placeholder">
                    <TrophyIcon className="placeholder-icon" />
                  </div>
                )}
              </div>
              
              <div className="prestasi-content">
                <h3 className="prestasi-title">{prestasi.title}</h3>
                <p className="prestasi-description">
                  {prestasi.description && prestasi.description.length > 120
                    ? `${prestasi.description.substring(0, 120)}...`
                    : prestasi.description || 'Tidak ada deskripsi'}
                </p>
                
                <div className="prestasi-actions">
                  <button
                    onClick={() => handleEdit(prestasi)}
                    className="action-btn action-btn-edit"
                    title="Edit prestasi"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prestasi._id)}
                    className="action-btn action-btn-delete"
                    title="Hapus prestasi"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <TrophyIcon className="empty-icon" />
          <h3 className="empty-title">Belum ada prestasi</h3>
          <p className="empty-description">Tambahkan prestasi pertama menggunakan form di atas</p>
        </div>
      )}
    </div>
  );
};

export default ListPrestasi;
