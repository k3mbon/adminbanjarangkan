const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('firebase-export/data/firestore-data.json', 'utf8'));
  console.log('Available collections:');
  Object.keys(data).forEach(key => {
    if (data[key] && typeof data[key] === 'object') {
      const count = Object.keys(data[key]).length;
      console.log(`${key}: ${count} items`);
    }
  });
  
  // Check specifically for albums and carousel
  if (data.albums || data.album_foto) {
    const albums = data.albums || data.album_foto;
    console.log('\nAlbum data found:', Object.keys(albums).length, 'albums');
  }
  
  if (data.carousel) {
    console.log('Carousel data found:', Object.keys(data.carousel).length, 'images');
  }
  
} catch (error) {
  console.error('Error reading Firebase data:', error.message);
}