import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const PrestasiForm = () => {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    const fetchImageUrls = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'prestasi'));
        const urls = querySnapshot.docs.map((doc) => doc.data().imageUrl);
        console.log('Fetched URLs: ', urls);
        setImageUrls(urls);
      } catch (error) {
        console.error('Error fetching image URLs: ', error);
      }
    };

    fetchImageUrls();
  }, []); // Fetch data on component mount

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);

    // Display image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(selectedImage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Upload image to Firebase Storage and get download URL
      const storageRef = ref(storage, `images/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      // Log progress of image upload
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Error during upload: ', error);
        },
        async () => {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('Image URL:', imageUrl);

          // Create a document in Firestore with image details
          const docRef = await addDoc(collection(db, 'prestasi'), {
            title,
            description,
            imageUrl,
          });

          console.log('Document written with ID: ', docRef.id);

          // Reset form fields and update image URLs
          setImage(null);
          setDescription('');
          setTitle('');
          setImagePreview(null);
          setImageUrls((prevUrls) => [...prevUrls, imageUrl]);
        }
      );
    } catch (error) {
      console.error('Error uploading image and creating document: ', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleImageChange} />
        {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px' }} />}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default PrestasiForm;
