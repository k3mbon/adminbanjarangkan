// ReminderForm.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase';
import '../styles/ReminderForm.css';

const storage = getStorage(); // Get the storage instance

const ReminderForm = () => {
  const [judul, setJudul] = useState('');
  const [tanggal, setTanggal] = useState(new Date());
  const [isi, setIsi] = useState(new Date());
  const [gambar, setGambar] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setGambar(file);
  };

  const handleImageUpload = async () => {
    if (gambar) {
      const storageRef = ref(storage, `reminderImages/${gambar.name}`);
      await uploadBytes(storageRef, gambar);
      return getDownloadURL(storageRef);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const imageUrls = await handleImageUpload();

      await addDoc(collection(db, 'agenda'), {
        judul,
        tanggal,
        isi,
        imageUrls,
        createdAt: serverTimestamp(),
      });

      // Clear form fields after submission
      setJudul('');
      setTanggal(new Date());
      setIsi('');
      setGambar(null);

      console.log('Agenda reminder added successfully!');
    } catch (error) {
      console.error('Error adding agenda reminder:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Judul:
        <input type="text" value={judul} onChange={(e) => setJudul(e.target.value)} />
      </label>
      <label>
        Deskripsi:
        <input type="text" value={isi} onChange={(e) => setIsi(e.target.value)} />
      </label>
      <label>
        Tanggal:
        <DatePicker
          selected={tanggal}
          onChange={(newDate) => setTanggal(newDate)}
          className="compact-datepicker"
        />
      </label>
      <label>
        Gambar:
        <input type="file" onChange={handleImageChange} />
      </label>
      <button type="submit">Tambahkan Agenda</button>
    </form>
  );
};

export default ReminderForm;
