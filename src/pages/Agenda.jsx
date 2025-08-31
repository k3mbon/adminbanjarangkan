import React from 'react';
import ReminderForm from '../components/ReminderForm';
import ReminderList from '../components/ReminderList';

const Agenda = () => {
  return (
    <>
      {/* Page Header */}
      <div className="content-header">
        <div className="flex items-center gap-4">
          <div className="page-icon">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="page-title">Agenda & Pengingat</h1>
            <p className="page-subtitle">Kelola jadwal dan pengingat penting Anda</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid single-column">
        <div className="content-card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="card-icon">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2>Tambah Acara Baru</h2>
            </div>
          </div>
          <ReminderForm />
        </div>
        
        <div className="content-card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="card-icon">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2>Acara Anda</h2>
            </div>
          </div>
          <ReminderList />
        </div>
      </div>
    </>
  );
};

export default Agenda;
