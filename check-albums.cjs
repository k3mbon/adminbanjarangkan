const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'e0jvxihm',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_AUTH_TOKEN
});

async function checkSanityData() {
  try {
    const [posts, prestasi, albums, carousel, agenda, documents] = await Promise.all([
      client.fetch('*[_type == "blogPost"]'),
      client.fetch('*[_type == "prestasi"]'),
      client.fetch('*[_type == "album"]'),
      client.fetch('*[_type == "carouselImage"]'),
      client.fetch('*[_type == "agenda"]'),
      client.fetch('*[_type == "document"]')
    ]);
    
    console.log('Current Sanity data:');
    console.log('Blog Posts:', posts.length);
    console.log('Prestasi:', prestasi.length);
    console.log('Albums:', albums.length);
    console.log('Carousel Images:', carousel.length);
    console.log('Agenda:', agenda.length);
    console.log('Documents:', documents.length);
    
    if (albums.length > 0) {
      console.log('\nAlbum details:');
      albums.forEach(album => {
        console.log({
          _id: album._id,
          title: album.title,
          albumName: album.albumName,
          photos: album.photos?.length || 0,
          images: album.images?.length || 0,
          coverImage: !!album.coverImage
        });
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSanityData();