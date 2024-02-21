import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/database';
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
  const [gambar, setGambar] = useState([]);
  const [gambarUrls, setGambarUrls] = useState([]);
  const user = auth.currentUser;
  const sanitizedHTML = DOMPurify.sanitize(isi);

  useEffect(() => {
    if (dataToEdit) {
      // If dataToEdit is provided, set form fields with the data for editing
      setJudul(dataToEdit.judul || '');
      setIsi(dataToEdit.isi || '');
      setGambarUrls(dataToEdit.gambarUrls || []);
    }
  }, [dataToEdit]);

  const handleGambarChange = (e) => {
    const files = Array.from(e.target.files);
    setGambar((prevGambar) => [...prevGambar, ...files]);
  };

  const handleUpload = async () => {
    const urls = await Promise.all(
      gambar.map(async (image) => {
        const storageRef = ref(storage, `postImages/${image.name}`);
        await uploadBytes(storageRef, image);
        return getDownloadURL(storageRef);
      })
    );
    setGambarUrls(urls);
  };

  const handleDeleteGambar = (index) => {
    const imageRef = ref(storage, `postImages/${gambar[index].name}`);
    deleteObject(imageRef);

    setGambarUrls((prevUrls) => [
      ...prevUrls.slice(0, index),
      ...prevUrls.slice(index + 1),
    ]);
    setGambar((prevGambar) => [
      ...prevGambar.slice(0, index),
      ...prevGambar.slice(index + 1),
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      try {
        await handleUpload();

        if (dataToEdit) {
          // If editing existing document, update the document
          const documentRef = doc(db, 'poststunda', dataToEdit.id);
          await setDoc(documentRef, {
            judul,
            isi,
            gambarUrls,
          });
          console.log('Blog post updated successfully!');
        } else {
          // If creating a new document, add the document to Firestore
          await addDoc(collection(db, 'poststunda'), {
            judul,
            isi,
            gambarUrls,
            createdAt: serverTimestamp(),
          });
          console.log('Blog post created successfully!');
        }

        // Reset form fields after submission
        setJudul('');
        setIsi('');
        setGambar([]);
        setGambarUrls([]);
        
        // Callback to notify parent component about form submission
        if (onFormSubmit) {
          onFormSubmit();
        }
      } catch (error) {
        console.error('Error creating/updating blog post:', error);
      }
    } else {
      console.log('User is not authenticated. Redirecting to login page...');
      // Implement authentication or redirection logic here
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
        <Form.Group className="my-5" controlId="formGridAddress1">
          <Form.Label>Foto Thumbnail Artikel</Form.Label>
          <Form.Control type="file" multiple onChange={handleGambarChange} />
          <Button
            className="mt-1"
            type="button"
            onClick={handleUpload}
            variant="primary"
          >
            Upload Foto
          </Button>
        </Form.Group>
        {gambar.length > 0 && (
          <div className="image-preview mx-5">
            {gambar.map((image, index) => (
              <div key={index}>
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Gambar ${index + 1}`}
                />
                <Button type="button" onClick={() => handleDeleteGambar(index)}>
                  Hapus
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button
          className="my-5"
          variant="primary"
          type="submit"
        >
          {dataToEdit ? 'Update' : 'Submit'}
        </Button>
      </Form>{' '}
    </>
  );
};

export default BlogForm;
