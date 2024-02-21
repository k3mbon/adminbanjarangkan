// CarouselImage.jsx
import { useState } from 'react';
import { db, storage } from '../firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import '../styles/CarouselImage.css';
import { Button, Form } from 'react-bootstrap';

const CarouselImage = () => {
  const [image, setImage] = useState(null);
  const [Gambar1, setImageUrl] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);

    // Display image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(selectedImage);
  };

  const handleUpload = async () => {
    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `images/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);
      await uploadTask;

      // Get the download URL
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      // Create a document in Firestore with image details
      const docRef = await addDoc(collection(db, 'foto_carousel'), {
        Gambar1: downloadURL,
      });

      console.log('Document written with ID: ', docRef.id);
    } catch (error) {
      console.error('Error uploading image: ', error);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Delete the document from Firestore
      // Note: You might want to store the document ID when creating the document for accurate deletion
      const querySnapshot = await getDocs(collection(db, 'foto_carousel'));
      const docToDelete = querySnapshot.docs[0]; // Change this to the correct document reference
      await deleteDoc(doc(db, 'foto_carousel', docToDelete.id));

      // Delete the image from Firebase Storage
      const imageRef = ref(storage, `images/${image.name}`);
      await deleteObject(imageRef);

      // Reset state
      setImage(null);
      setImageUrl('');
    } catch (error) {
      console.error('Error deleting image: ', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Form className="m-5">
      <h2>Buat Postingan Foto</h2>
      <hr className="text-dark" />
      <Form.Group className="my-5">
        <Form.Control type="file" onChange={handleImageChange} />
        {Gambar1 && (
          <img src={Gambar1} alt="Preview" style={{ maxWidth: '200px' }} />
        )}
      </Form.Group>
      <Form.Group className="my-5">
        <Button variant="primary" onClick={handleUpload}>
          Upload
        </Button>
      </Form.Group>
      <Form.Group className="my-5">
        <Button
          variant="success"
          onClick={handleDelete}
          disabled={!Gambar1 || isDeleting}
        >
          Delete
        </Button>
      </Form.Group>
    </Form>
  );
};

export default CarouselImage;
