import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { storage } from '../firebase';
import {
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL,
} from 'firebase/storage';
import { db, auth } from '../firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the styles
import { Button, Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

const BlogForm = ({ dataToEdit, onFormSubmit }) => {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [gambar, setGambar] = useState(null);
  const [gambarThumbnail, setGambarThumbnail] = useState('');
  const user = auth.currentUser;
  const sanitizedHTML = DOMPurify.sanitize(isi);

  useEffect(() => {
    if (dataToEdit) {
      setJudul(dataToEdit.judul || '');
      setIsi(dataToEdit.isi || '');
      setGambarThumbnail(dataToEdit.gambarThumbnail || '');
    }
  }, [dataToEdit]);

  
  const handleUpload = async () => {
    if (!gambar) return;

    // Delete previous image if exists
    if (gambarThumbnail) {
      const imageRef = ref(storage, `postImages/${gambarThumbnail}`);
      await deleteObject(imageRef);
    }

    const storageRef = ref(storage, `postImages/${gambar.name}`);
    try {
      await uploadBytes(storageRef, gambar);
      const url = await getDownloadURL(storageRef);
      setGambarThumbnail(url); // Store download URL in state
      console.log('Image uploaded successfully:', url);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      try {
        await handleUpload();

        if (dataToEdit) {
          const documentRef = doc(db, 'poststunda', dataToEdit.id);
          await setDoc(documentRef, {
            judul,
            isi,
            gambarThumbnail, // Store image URL in Firestore
          });
          console.log('Blog post updated successfully!');
        } else {
          await addDoc(collection(db, 'poststunda'), {
            judul,
            isi,
            gambarThumbnail, // Store image URL in Firestore
            createdAt: serverTimestamp(), // Add timestamp automatically
          });
          console.log('Blog post created successfully!');
        }

        setJudul('');
        setIsi('');
        setGambar(null);
        setGambarThumbnail('');
        
        if (onFormSubmit) {
          onFormSubmit();
        }
      } catch (error) {
        console.error('Error creating/updating blog post:', error);
      }
    } else {
      console.log('User is not authenticated. Redirecting to login page...');
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'link',
    'image',
    'video',
  ];

  return (
    <>
      <Form className="mx-5" onSubmit={handleSubmit}>
        <h2>{dataToEdit ? 'Edit' : 'Buat'} Postingan Artikel</h2>
        <hr className="text-dark" />
        <Form.Group className="my-5">
          <Form.Label>Judul Artikel</Form.Label>
          <Form.Control
            placeholder="Tuliskan judul artikel disini"
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="my-5">
          <Form.Label>Isi Artikel</Form.Label>
          <ReactQuill
            value={sanitizedHTML}
            onChange={(value) => setIsi(value)}
            placeholder="Type your blog content here..."
            modules={quillModules}
            formats={quillFormats}
          />
        </Form.Group>
        <Button className="my-5" variant="primary" type="submit">
          {dataToEdit ? 'Update' : 'Submit'}
        </Button>
      </Form>
    </>
  );
};

export default BlogForm;
