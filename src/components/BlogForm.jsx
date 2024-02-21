// src/components/BlogForm.jsx
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage } from '../firebase';
import {
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL,
} from 'firebase/storage';
import { db } from '../firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the styles
import '../styles/BlogForm.css';
import { Button, Form } from 'react-bootstrap';
import { useState } from 'react';

const BlogForm = () => {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [gambar, setGambar] = useState([]);
  const [gambarUrls, setGambarUrls] = useState([]);

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

    try {
      await handleUpload();

      const postRef = await addDoc(collection(db, 'poststunda'), {
        judul,
        isi,
        gambarUrls,
        createdAt: serverTimestamp(),
      });

      setJudul('');
      setGambar([]);
      setIsi([]);
      setGambarUrls([]);
      console.log('Blog post created successfully!');
    } catch (error) {
      console.error('Error creating blog post:', error);
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
      <Form className="mx-5">
        <h2>Buat Postingan Artikel</h2>
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
            value={isi}
            onChange={(value) => setIsi(value)}
            placeholder="Type your blog content here..."
            modules={quillModules}
            formats={quillFormats}
          />
        </Form.Group>
        <Form.Group className="my-5" controlId="formGridAddress1">
          <Form.Label>Foto Artikel</Form.Label>
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
          onChange={handleSubmit}
        >
          Submit
        </Button>
      </Form>{' '}
    </>
  );
};

export default BlogForm;
