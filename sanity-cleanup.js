// Sanity Cleanup Script - Delete all documents before re-import
import { createClient } from '@sanity/client';

// Sanity client configuration
const client = createClient({
  projectId: 'e0jvxihm',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_AUTH_TOKEN,
});

// Delete all documents of a specific type
async function deleteDocumentsByType(type) {
  try {
    const query = `*[_type == "${type}"]`;
    const documents = await client.fetch(query);
    
    console.log(`Found ${documents.length} documents of type '${type}'`);
    
    if (documents.length > 0) {
      const transaction = client.transaction();
      
      documents.forEach(doc => {
        transaction.delete(doc._id);
      });
      
      await transaction.commit();
      console.log(`Deleted ${documents.length} documents of type '${type}'`);
    }
  } catch (error) {
    console.error(`Error deleting documents of type '${type}':`, error);
  }
}

// Main cleanup function
async function cleanupSanity() {
  console.log('Starting Sanity cleanup...');
  
  const documentTypes = ['blogPost', 'prestasi', 'album', 'carouselImage', 'agenda'];
  
  for (const type of documentTypes) {
    await deleteDocumentsByType(type);
  }
  
  console.log('\n=== Cleanup Complete ===');
  console.log('All documents have been deleted. Ready for fresh import.');
}

// Run cleanup
if (!process.env.SANITY_AUTH_TOKEN) {
  console.error('Please set SANITY_AUTH_TOKEN environment variable');
  console.log('You can get this token from: https://sanity.io/manage/personal/tokens');
  process.exit(1);
}

cleanupSanity().catch(console.error);