// ListPrestasi.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import '../styles/ListPrestasi.css'; // Import the CSS file for styling

const ListPrestasi = () => {
  const [prestasiList, setPrestasiList] = useState([]);

  useEffect(() => {
    const fetchPrestasiList = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'prestasi'));
        const prestasiData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          description: doc.data().description,
          imageUrl: doc.data().imageUrl,
        }));
        setPrestasiList(prestasiData);
      } catch (error) {
        console.error('Error fetching prestasi list: ', error);
      }
    };

    fetchPrestasiList();
  }, []); // Fetch data on component mount

  return (
    <div className="prestasi-list-container">
      <h2>List of Prestasi</h2>
      {prestasiList.map((prestasi) => (
        <div key={prestasi.id} className="prestasi-card">
          <h3>{prestasi.title}</h3>
          <p>{prestasi.description}</p>
          <img src={prestasi.imageUrl} alt={prestasi.title} className="card-image" />
        </div>
      ))}
    </div>
  );
};

export default ListPrestasi;
