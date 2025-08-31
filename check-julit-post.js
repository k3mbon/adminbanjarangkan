import client from './src/sanity.js';

async function checkJulitPost() {
  try {
    console.log('Checking for JULIT post in Sanity...');
    
    // Search for JULIT post
    const julitPost = await client.fetch(`*[_type == "blogPost" && judul match "*JULIT*"][0]{
      _id,
      judul,
      _createdAt,
      status
    }`);
    
    console.log('JULIT post result:', JSON.stringify(julitPost, null, 2));
    
    // Also get all blog posts to see what's available
    const allPosts = await client.fetch(`*[_type == "blogPost"]{_id, judul}`);
    console.log('\nAll blog posts:');
    allPosts.forEach(post => {
      console.log(`- ${post.judul} (${post._id})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkJulitPost();