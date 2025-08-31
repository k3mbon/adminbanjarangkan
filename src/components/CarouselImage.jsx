// CarouselImage.jsx
import { useState } from 'react';
import client, { sanityHelpers, queries } from '../sanity';
import '../styles/CarouselImage.css';
import { Button, Form } from 'react-bootstrap';

const CarouselImage = () => {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
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
      // Upload image to Sanity
      const imageAsset = await sanityHelpers.uploadAsset(image, {
        filename: image.name
      });

      // Create a document in Sanity with image details
      const carouselImageData = {
        _type: 'carouselImage',
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id
          }
        },
        createdAt: new Date().toISOString()
      };

      const docRef = await sanityHelpers.create(carouselImageData);
      console.log('Dokumen dibuat dengan ID: ', docRef._id);
    } catch (error) {
      console.error('Error mengunggah gambar: ', error);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Get all carousel images from Sanity
      const carouselImages = await sanityHelpers.fetch(queries.getAllCarouselImages);
      
      if (carouselImages.length > 0) {
        const docToDelete = carouselImages[0]; // Delete the first one, or implement proper selection
        
        // Delete the document from Sanity
        await sanityHelpers.delete(docToDelete._id);
        
        // Delete the image asset if it exists
        if (docToDelete.image?.asset?._ref) {
          await sanityHelpers.deleteAsset(docToDelete.image.asset._ref);
        }
      }

      // Reset state
      setImage(null);
      setImageUrl('');
    } catch (error) {
      console.error('Error menghapus gambar: ', error);
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
        {imageUrl && (
          <img src={imageUrl} alt="Pratinjau" style={{ maxWidth: '200px' }} />
        )}
      </Form.Group>
      <Form.Group className="my-5">
        <Button variant="primary" onClick={handleUpload}>
          Unggah
        </Button>
      </Form.Group>
      <Form.Group className="my-5">
        <Button
          variant="success"
          onClick={handleDelete}
          disabled={!imageUrl || isDeleting}
        >
          Hapus
        </Button>
      </Form.Group>
    </Form>
  );
};

export default CarouselImage;
