import { useState } from 'react';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import '../styles/GalleryForm.css';

const GalleryForm = () => {
  const [albumName, setAlbumName] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const files = e.target.files;
    setSelectedImages([...selectedImages, ...files]);

    // Display image previews
    const previews = Array.from(files).map((image) => URL.createObjectURL(image));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const handleImageDelete = (index) => {
    const updatedSelectedImages = [...selectedImages];
    const updatedImagePreviews = [...imagePreviews];

    updatedSelectedImages.splice(index, 1);
    updatedImagePreviews.splice(index, 1);

    setSelectedImages(updatedSelectedImages);
    setImagePreviews(updatedImagePreviews);
  };

  const handleImageUpload = async () => {
    if (!albumName || selectedImages.length === 0) {
      // Ensure that albumName and images are provided
      return;
    }

    setUploading(true);

    try {
      // Create a new album document
      const albumRef = await addDoc(collection(db, 'album_foto'), {
        albumName,
        createdAt: serverTimestamp(),
      });

      // Upload each image to storage and update album document with image URLs
      const imageUrls = [];

      for (const [index, image] of selectedImages.entries()) {
        if (!image) {
          console.error('Image does not exist');
          continue;
        }

        const storagePath = `album_foto/${albumRef.id}/${index}_${image.name}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, image);

        // Use closure to capture correct values during each iteration
        const imageUrl = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            null,
            (error) => reject(error),
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });

        imageUrls.push(imageUrl);
      }

      // Update the album document with image URLs
      const albumDocRef = doc(db, 'album_foto', albumRef.id);
      await updateDoc(albumDocRef, { imageUrls });

      // Clear form fields and reset state
      setAlbumName('');
      setSelectedImages([]);
      setImagePreviews([]);
      setUploading(false);

      console.log('Album uploaded successfully!');
    } catch (error) {
      console.error('Error during image upload: ', error);
      setUploading(false);
    }
  };

  return (
    <div>
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
