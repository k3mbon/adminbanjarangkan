// Sanity Data Import Script
import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sanity client configuration
const client = createClient({
  projectId: 'e0jvxihm',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_AUTH_TOKEN, // Set this environment variable
});

// Helper function to upload assets to Sanity
async function uploadAssetToSanity(filePath, filename) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return null;
    }
    
    const fileStream = fs.createReadStream(filePath);
    const asset = await client.assets.upload('image', fileStream, {
      filename: filename
    });
    
    console.log(`Uploaded asset: ${filename} -> ${asset._id}`);
    return asset;
  } catch (error) {
    console.error(`Error uploading ${filename}:`, error);
    return null;
  }
}

// Helper function to convert base64 image to Sanity asset
async function uploadBase64ImageToSanity(base64Data, filename) {
  try {
    // Remove data URL prefix if present
    const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64String, 'base64');
    
    const asset = await client.assets.upload('image', buffer, {
      filename: filename || `image-${Date.now()}.png`
    });
    
    console.log(`Uploaded base64 image: ${filename} -> ${asset._id}`);
    return asset;
  } catch (error) {
    console.error(`Error uploading base64 image ${filename}:`, error);
    return null;
  }
}

// Helper function to parse HTML content and convert to portable text
async function parseContentToPortableText(htmlContent, uploadedAssets = {}) {
  if (!htmlContent) return [];
  
  const blocks = [];
  let imageCounter = 1;
  
  // Split content by paragraphs and process each part
  const parts = htmlContent.split(/<\/?p[^>]*>/);
  
  for (const part of parts) {
    if (!part.trim()) continue;
    
    // Check for base64 images
    const base64ImgMatch = part.match(/<img[^>]+src="data:image\/[^;]+;base64,([^"]+)"[^>]*>/i);
    
    // Check for Firebase Storage URLs
    const firebaseImgMatch = part.match(/<img[^>]+src="(https:\/\/firebasestorage\.googleapis\.com[^"]+)"[^>]*>/i);
    
    if (base64ImgMatch) {
      // Handle base64 images
      const base64Data = base64ImgMatch[1];
      const filename = `content-image-${imageCounter++}.png`;
      const uploadedAsset = await uploadBase64ImageToSanity(`data:image/png;base64,${base64Data}`, filename);
      
      if (uploadedAsset) {
        blocks.push({
          _type: 'image',
          _key: `image-${Date.now()}-${imageCounter}`,
          asset: {
            _type: 'reference',
            _ref: uploadedAsset._id
          },
          alt: 'Content image',
          caption: ''
        });
      }
    } else if (firebaseImgMatch) {
      // Handle Firebase Storage URLs
      const imageUrl = firebaseImgMatch[1];
      const imageName = imageUrl.split('/').pop().split('?')[0].replace(/%2F/g, '/');
      const simpleImageName = imageName.split('/').pop();
      
      // Try to find the asset in uploaded assets
      const matchingAsset = uploadedAssets[simpleImageName] || uploadedAssets[imageName];
      
      if (matchingAsset) {
        blocks.push({
          _type: 'image',
          _key: `image-${Date.now()}-${imageCounter++}`,
          asset: {
            _type: 'reference',
            _ref: matchingAsset._id
          },
          alt: 'Content image',
          caption: ''
        });
      } else {
        console.warn(`Image not found in assets: ${imageName}`);
      }
    } else {
      // Regular text content
      const textContent = part.replace(/<[^>]+>/g, '').trim();
      if (textContent) {
        blocks.push({
          _type: 'block',
          _key: `block-${Date.now()}-${Math.random()}`,
          style: 'normal',
          children: [{
            _type: 'span',
            _key: `span-${Date.now()}-${Math.random()}`,
            text: textContent,
            marks: []
          }],
          markDefs: []
        });
      }
    }
  }
  
  return blocks;
}

// Transform Firebase blog post to Sanity blog post
async function transformBlogPost(firebasePost, uploadedAssets = {}) {
  const sanityPost = {
    _type: 'blogPost',
    judul: firebasePost.judul || firebasePost.title || 'Untitled',
    publishedAt: firebasePost.createdAt || firebasePost.publishedAt || firebasePost.timestamp || new Date().toISOString(),
    createdAt: firebasePost.createdAt || firebasePost.publishedAt || firebasePost.timestamp || new Date().toISOString()
  };
  
  // Parse content field and convert to portable text (matching schema structure)
  const contentField = firebasePost.isi || firebasePost.content || '';
  sanityPost.isi = await parseContentToPortableText(contentField, uploadedAssets);
  
  // Handle featured image - first try gambarThumbnail, then extract first image from content
  let featuredImageAsset = null;
  
  if (firebasePost.gambarThumbnail && firebasePost.gambarThumbnail.trim()) {
    const imageUrl = firebasePost.gambarThumbnail;
    const imageName = imageUrl.split('/').pop().split('?')[0];
    
    if (uploadedAssets[imageName]) {
      featuredImageAsset = uploadedAssets[imageName];
    }
  }
  
  // If no gambarThumbnail, try to extract first base64 image from content as featured image
  if (!featuredImageAsset && contentField) {
    const base64ImgMatch = contentField.match(/<img[^>]+src="data:image\/[^;]+;base64,([^"]+)"[^>]*>/i);
    if (base64ImgMatch) {
      const base64Data = base64ImgMatch[1];
      const filename = `featured-${firebasePost.id || Date.now()}.png`;
      featuredImageAsset = await uploadBase64ImageToSanity(`data:image/png;base64,${base64Data}`, filename);
    }
  }
  
  if (featuredImageAsset) {
    sanityPost.gambarThumbnail = {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: featuredImageAsset._id
      }
    };
  }
  
  return sanityPost;
}

// Transform Firebase prestasi to Sanity prestasi
function transformPrestasi(firebasePrestasi, uploadedAssets = {}) {
  const sanityPrestasi = {
    _type: 'prestasi',
    title: firebasePrestasi.judul || firebasePrestasi.title || 'Untitled Achievement',
    description: firebasePrestasi.deskripsi || firebasePrestasi.description || '',
    achievementDate: firebasePrestasi.tanggal || firebasePrestasi.achievementDate || firebasePrestasi.createdAt || new Date().toISOString(),
    category: firebasePrestasi.kategori || firebasePrestasi.category || 'general',
    level: firebasePrestasi.tingkat || firebasePrestasi.level || 'school',
    participants: firebasePrestasi.peserta || firebasePrestasi.participants || [],
  };
  
  // Handle image
  if (firebasePrestasi.gambar || firebasePrestasi.image) {
    const imageUrl = firebasePrestasi.gambar || firebasePrestasi.image;
    const imageName = imageUrl.split('/').pop().split('?')[0];
    
    if (uploadedAssets[imageName]) {
      sanityPrestasi.image = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: uploadedAssets[imageName]._id
        }
      };
    }
  }
  
  return sanityPrestasi;
}

// Transform Firebase album to Sanity album
function transformAlbum(firebaseAlbum, uploadedAssets = {}) {
  const sanityAlbum = {
    _type: 'album',
    albumName: firebaseAlbum.judul || firebaseAlbum.title || firebaseAlbum.albumName || 'Untitled Album',
    description: firebaseAlbum.deskripsi || firebaseAlbum.description || '',
    createdAt: firebaseAlbum.createdAt || firebaseAlbum.timestamp || new Date().toISOString(),
    images: []
  };
  
  // Handle photos/images array
  if (firebaseAlbum.photos && Array.isArray(firebaseAlbum.photos)) {
    sanityAlbum.images = firebaseAlbum.photos.map(photo => {
      const imageName = photo.url ? photo.url.split('/').pop().split('?')[0] : null;
      
      if (imageName && uploadedAssets[imageName]) {
        return {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: uploadedAssets[imageName]._id
          }
        };
      }
      return null;
    }).filter(Boolean);
    
    // Set cover image as the first image
    if (sanityAlbum.images.length > 0) {
      sanityAlbum.coverImage = sanityAlbum.images[0];
    }
  }
  
  return sanityAlbum;
}

// Transform Firebase carousel image to Sanity carousel image
function transformCarouselImage(firebaseCarousel, uploadedAssets = {}) {
  const sanityCarousel = {
    _type: 'carouselImage',
    title: firebaseCarousel.judul || firebaseCarousel.title || 'Carousel Image',
    description: firebaseCarousel.deskripsi || firebaseCarousel.description || '',
    order: firebaseCarousel.order || 0,
    isActive: firebaseCarousel.isActive !== false,
    createdAt: firebaseCarousel.createdAt || firebaseCarousel.timestamp || new Date().toISOString(),
  };
  
  // Handle image
  if (firebaseCarousel.gambar || firebaseCarousel.image || firebaseCarousel.url) {
    const imageUrl = firebaseCarousel.gambar || firebaseCarousel.image || firebaseCarousel.url;
    const imageName = imageUrl.split('/').pop().split('?')[0];
    
    if (uploadedAssets[imageName]) {
      sanityCarousel.image = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: uploadedAssets[imageName]._id
        }
      };
    }
  }
  
  return sanityCarousel;
}

// Transform Firebase agenda to Sanity agenda
function transformAgenda(firebaseAgenda) {
  return {
    _type: 'agenda',
    judul: firebaseAgenda.judul || firebaseAgenda.title || 'Untitled Event',
    isi: firebaseAgenda.deskripsi || firebaseAgenda.description || firebaseAgenda.isi || '',
    tanggal: firebaseAgenda.tanggal || firebaseAgenda.eventDate || firebaseAgenda.date || new Date().toISOString(),
    lokasi: firebaseAgenda.lokasi || firebaseAgenda.location || '',
    createdAt: firebaseAgenda.createdAt || firebaseAgenda.timestamp || new Date().toISOString(),
  };
}

// Transform Firebase document to Sanity document
async function transformDocument(firebaseDocument, uploadedAssets = {}) {
  const sanityDocument = {
    _type: 'generalDocument',
    judul: firebaseDocument.judul || firebaseDocument.title || 'Untitled Document',
    createdAt: firebaseDocument.createdAt || firebaseDocument.timestamp || new Date().toISOString()
  };
  
  // Parse content field and convert to portable text
  const contentField = firebaseDocument.isi || firebaseDocument.content || '';
  sanityDocument.isi = await parseContentToPortableText(contentField, uploadedAssets);
  
  // Handle thumbnail image
  if (firebaseDocument.gambarThumbnail || firebaseDocument.featuredImage) {
    const imageUrl = firebaseDocument.gambarThumbnail || firebaseDocument.featuredImage;
    const imageName = imageUrl.split('/').pop().split('?')[0];
    
    if (uploadedAssets[imageName]) {
      sanityDocument.gambarThumbnail = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: uploadedAssets[imageName]._id
        }
      };
    }
  }
  
  return sanityDocument;
}

// Import data to Sanity
async function importToSanity() {
  console.log('Starting Sanity import...');
  
  const exportDir = path.join(__dirname, 'firebase-export');
  const dataDir = path.join(exportDir, 'data');
  const assetsDir = path.join(exportDir, 'assets');
  
  // Check if export data exists
  const firestoreDataPath = path.join(dataDir, 'firestore-data.json');
  const storageAssetsPath = path.join(dataDir, 'storage-assets.json');
  
  if (!fs.existsSync(firestoreDataPath)) {
    console.error('Firestore data not found. Please run firebase-export.js first.');
    return;
  }
  
  // Load exported data
  const firestoreData = JSON.parse(fs.readFileSync(firestoreDataPath, 'utf8'));
  const storageAssets = fs.existsSync(storageAssetsPath) 
    ? JSON.parse(fs.readFileSync(storageAssetsPath, 'utf8'))
    : [];
  
  console.log('Loaded Firebase export data');
  
  // Upload assets to Sanity first
  console.log('Uploading assets to Sanity...');
  const uploadedAssets = {};
  
  for (const asset of storageAssets) {
    if (fs.existsSync(asset.localPath)) {
      const uploadedAsset = await uploadAssetToSanity(asset.localPath, asset.filename);
      if (uploadedAsset) {
        uploadedAssets[asset.filename] = uploadedAsset;
      }
    }
  }
  
  console.log(`Uploaded ${Object.keys(uploadedAssets).length} assets to Sanity`);
  
  // Import blog posts
  if (firestoreData.posts && firestoreData.posts.length > 0) {
    console.log(`Importing ${firestoreData.posts.length} blog posts...`);
    
    for (const post of firestoreData.posts) {
      try {
        const sanityPost = await transformBlogPost(post, uploadedAssets);
        const result = await client.create(sanityPost);
        console.log(`Imported blog post: ${result.title}`);
      } catch (error) {
        console.error(`Error importing blog post ${post.id}:`, error);
      }
    }
  }
  
  // Import prestasi
  if (firestoreData.prestasi && firestoreData.prestasi.length > 0) {
    console.log(`Importing ${firestoreData.prestasi.length} prestasi...`);
    
    for (const prestasi of firestoreData.prestasi) {
      try {
        const sanityPrestasi = transformPrestasi(prestasi, uploadedAssets);
        const result = await client.create(sanityPrestasi);
        console.log(`Imported prestasi: ${result.title}`);
      } catch (error) {
        console.error(`Error importing prestasi ${prestasi.id}:`, error);
      }
    }
  }
  
  // Import albums
  if (firestoreData.albums && firestoreData.albums.length > 0) {
    console.log(`Importing ${firestoreData.albums.length} albums...`);
    
    for (const album of firestoreData.albums) {
      try {
        const sanityAlbum = transformAlbum(album, uploadedAssets);
        const result = await client.create(sanityAlbum);
        console.log(`Imported album: ${result.title}`);
      } catch (error) {
        console.error(`Error importing album ${album.id}:`, error);
      }
    }
  }
  
  // Import carousel images
  if (firestoreData.carousel && firestoreData.carousel.length > 0) {
    console.log(`Importing ${firestoreData.carousel.length} carousel images...`);
    
    for (const carousel of firestoreData.carousel) {
      try {
        const sanityCarousel = transformCarouselImage(carousel, uploadedAssets);
        const result = await client.create(sanityCarousel);
        console.log(`Imported carousel image: ${result.title}`);
      } catch (error) {
        console.error(`Error importing carousel ${carousel.id}:`, error);
      }
    }
  }
  
  // Import agenda
  if (firestoreData.agenda && firestoreData.agenda.length > 0) {
    console.log(`Importing ${firestoreData.agenda.length} agenda items...`);
    
    for (const agenda of firestoreData.agenda) {
      try {
        const sanityAgenda = transformAgenda(agenda);
        const result = await client.create(sanityAgenda);
        console.log(`Imported agenda: ${result.title}`);
      } catch (error) {
        console.error(`Error importing agenda ${agenda.id}:`, error);
      }
    }
  }
  
  console.log('\n=== Import Summary ===');
  console.log('Data migration from Firebase to Sanity completed!');
  console.log('Note: User authentication data needs to be handled separately.');
  console.log('Consider implementing a new authentication system or migrating users manually.');
}

// Run the import
if (!process.env.SANITY_AUTH_TOKEN) {
  console.error('Please set SANITY_AUTH_TOKEN environment variable');
  console.log('You can get this token from: https://sanity.io/manage/personal/tokens');
  process.exit(1);
}

importToSanity().catch(console.error);