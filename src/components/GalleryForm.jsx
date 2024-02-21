// GalleryForm.jsx
import { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import '../styles/GalleryForm.css';

const GalleryForm = () => {
  const [albumName, setAlbumName] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    const fetchImageUrls = async () => {
      try {
        // Fetch initial data
        const initialSnapshot = await getDocs(collection(db, 'album_foto'));
        const initialData = initialSnapshot.docs.map((doc) => doc.data());

        // Set the initial data
        setAlbumName(initialData[0]?.albumName || '');
        setImageUrls(initialData[0]?.imageUrls || []);

        // Set up a real-time listener to automatically update on changes
        const unsubscribe = onSnapshot(
          collection(db, 'album_foto'),
          (snapshot) => {
            const updatedData = snapshot.docs.map((doc) => doc.data());
            setAlbumName(updatedData[0]?.albumName || '');
            setImageUrls(updatedData[0]?.imageUrls || []);
          }
        );

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching image URLs: ', error);
      }
    };

    fetchImageUrls();
  }, []); // Fetch data on component mount

  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...selectedImages]);

    // Display image previews
    const previews = selectedImages.map((image) => URL.createObjectURL(image));
    setImagePreviews((prevPreviews) => [...prevPreviews, ...previews]);
  };

  const handleImageUpload = async () => {
    setUploading(true);

    try {
      const newImageUrls = [];
      const albumRef = await addDoc(collection(db, 'album_foto'), {
        albumName,
      });

      for (const image of images) {
        const storagePath = `albums/${albumRef.id}/images/${image.name}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, image);

        // Use the on method to track the state of the upload
        uploadTask.on(
          'state_changed',
          null,
          (error) => {
            console.error('Error during upload: ', error);
          },
          async () => {
            // Get the download URL after the image is uploaded
            const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            newImageUrls.push(imageUrl);

            // Update state with new image URLs using the functional form
            setImageUrls((prevImageUrls) => [...prevImageUrls, imageUrl]);
          }
        );
      }

      // Update the document with the newImageUrls
      await setDoc(albumRef, { imageUrls: newImageUrls }, { merge: true });

      // Reset the state and clear form fields
      setAlbumName('');
      setImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Error during image upload: ', error);
    } finally {
      setUploading(false);
    }
  };

  // ... (handleImageDelete function remains unchanged)

  return (
    <div className="gallery-form">
      <input
        type="text"
        placeholder="Album Name"
        value={albumName}
        onChange={(e) => setAlbumName(e.target.value)}
      />
      <input type="file" multiple onChange={handleImageChange} />
      <button onClick={handleImageUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Images'}
      </button>

      <div className="image-container">
        {/* Display image previews */}
        {imagePreviews.map((preview, index) => (
          <div key={index} className="image-item">
            <img
              src={preview}
              alt={`uploaded-img-${index}`}
              className="thumbnail"
            />
            <button onClick={() => handleImageDelete(index)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryForm;
