import { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Form } from 'react-bootstrap';

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
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
      <Form className="mx-5" onSubmit={handleSubmit}>
        <h2>Buat Postingan Prestasi</h2>
        <hr className="text-dark" />
        <Form.Group className="my-5">
          {' '}
          <Form.Control
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="my-5">
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </Form.Group>
        <Form.Group className="my-5">
          <Form.Control type="file" onChange={handleImageChange} />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              style={{ maxWidth: '200px' }}
            />
          )}
        </Form.Group>

        <button type="submit">Upload</button>
      </Form>
    </div>
  );
};

export default PrestasiForm;
