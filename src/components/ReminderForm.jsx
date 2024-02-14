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
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleImageUpload = async () => {
    if (image) {
      const storageRef = ref(storage, `reminderImages/${image.name}`);
      await uploadBytes(storageRef, image);
      return getDownloadURL(storageRef);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const imageUrls = await handleImageUpload();

      await addDoc(collection(db, 'agenda'), {
        title,
        date,
        imageUrls,
        createdAt: serverTimestamp(),
      });

      // Clear form fields after submission
      setTitle('');
      setDate(new Date());
      setImage(null);

      console.log('Agenda reminder added successfully!');
    } catch (error) {
      console.error('Error adding agenda reminder:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Title:
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        Date:
        <DatePicker
          selected={date}
          onChange={(newDate) => setDate(newDate)}
          className="compact-datepicker"
        />
      </label>
      <label>
        Image:
        <input type="file" onChange={handleImageChange} />
      </label>
      <button type="submit">Add Reminder</button>
    </form>
  );
};

export default ReminderForm;
