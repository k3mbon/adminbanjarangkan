import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const client = createClient({
  projectId: 'e0jvxihm',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.VITE_SANITY_TOKEN,
});

async function deleteDuplicates() {
  try {
    console.log('=== Sanity Blog Post Duplicate Deletion ===\n');
    
    // Load deletion plan
    if (!fs.existsSync('deletion-plan.json')) {
      console.error('❌ deletion-plan.json not found. Please run duplicate-finder.js first.');
      return;
    }
    
    const deletionData = JSON.parse(fs.readFileSync('deletion-plan.json', 'utf8'));
    console.log(`📄 Loaded deletion plan from ${deletionData.timestamp}`);
    console.log(`Total groups: ${deletionData.totalGroups}`);
    console.log(`Total posts to delete: ${deletionData.totalToDelete}\n`);
    
    let deletedCount = 0;
    let errorCount = 0;
    const deletionResults = [];
    
    // Process each group
    for (const group of deletionData.plan) {
      console.log(`\n--- Processing Group ${group.groupIndex + 1} ---`);
      
      // Delete posts in the group
      for (const post of group.delete) {
        try {
          console.log(`Deleting post: ${post._id} (${post.judul})`);
          
          // Delete the post
          await client.delete(post._id);
          
          deletedCount++;
          deletionResults.push({
            id: post._id,
            title: post.judul,
            status: 'deleted',
            timestamp: new Date().toISOString()
          });
          
          console.log(`✅ Successfully deleted: ${post._id}`);
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Failed to delete ${post._id}:`, error.message);
          errorCount++;
          deletionResults.push({
            id: post._id,
            title: post.judul,
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    console.log('\n=== DELETION SUMMARY ===');
    console.log(`✅ Successfully deleted: ${deletedCount} posts`);
    console.log(`❌ Failed deletions: ${errorCount} posts`);
    console.log(`📊 Total processed: ${deletedCount + errorCount} posts`);
    
    // Save deletion results
    const resultsData = {
      timestamp: new Date().toISOString(),
      totalDeleted: deletedCount,
      totalErrors: errorCount,
      results: deletionResults
    };
    
    fs.writeFileSync('deletion-results.json', JSON.stringify(resultsData, null, 2));
    console.log('\n📄 Deletion results saved to deletion-results.json');
    
    if (deletedCount > 0) {
      console.log('\n🎉 Duplicate deletion completed successfully!');
      console.log('Next steps:');
      console.log('1. Generate unique slugs for remaining posts');
      console.log('2. Add timestamp field to schema');
      console.log('3. Verify data integrity');
    }
    
  } catch (error) {
    console.error('Error during deletion process:', error);
    throw error;
  }
}

// Confirmation prompt
console.log('⚠️  WARNING: This will permanently delete duplicate blog posts!');
console.log('Make sure you have reviewed the deletion plan in deletion-plan.json');
console.log('\nStarting deletion in 3 seconds...');

setTimeout(() => {
  deleteDuplicates();
}, 3000);