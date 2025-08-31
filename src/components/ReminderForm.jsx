// ReminderForm.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { sanityHelpers } from '../sanity';
import '../styles/ReminderForm.css';

const ReminderForm = () => {
  const [judul, setJudul] = useState('');
  const [tanggal, setTanggal] = useState(new Date());
  const [isi, setIsi] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await sanityHelpers.create({
        _type: 'agenda',
        judul,
        tanggal: tanggal.toISOString(),
        isi,
        lokasi,
        createdAt: new Date().toISOString(),
      });

      // Clear form fields after submission
      setJudul('');
      setTanggal(new Date());
      setIsi('');
      setLokasi('');

      console.log('Pengingat agenda berhasil ditambahkan!');
      // You could add a toast notification here
    } catch (error) {
      console.error('Error menambahkan pengingat agenda:', error);
      // You could add error handling/notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="agenda-form">
      <div className="form-header">
        <h2>Buat Acara Baru</h2>
        <p>Tambahkan item agenda atau pengingat baru</p>
      </div>
      
      <form onSubmit={handleSubmit} className="agenda-form-content">
        <div className="form-group">
          <label className="form-label">Judul Acara</label>
          <input
            type="text"
            className="form-input"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Masukkan judul acara"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Deskripsi</label>
          <textarea
            className="form-textarea"
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            placeholder="Masukkan deskripsi acara"
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            <MapPinIcon className="w-5 h-5 inline mr-2" />
            Lokasi
          </label>
          <input
            type="text"
            className="form-input"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            placeholder="Masukkan lokasi acara"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            <CalendarIcon className="w-5 h-5 inline mr-2" />
            Tanggal & Waktu Acara
          </label>
          <div className="date-picker-container">
            <DatePicker
              selected={tanggal}
              onChange={(newDate) => setTanggal(newDate)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="form-input date-picker-input"
              placeholderText="Pilih tanggal dan waktu"
              minDate={new Date()}
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting || !judul.trim()}
          >
            {isSubmitting ? 'Menambahkan...' : 'Tambah Acara'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReminderForm;
