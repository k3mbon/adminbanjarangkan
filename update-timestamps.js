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

async function updateTimestamps() {
  try {
    console.log('=== Sanity Blog Post Timestamp Update ===\n');
    console.log('Fetching all blog posts...');
    
    const posts = await client.fetch(`
      *[_type == "blogPost"] {
        _id,
        _createdAt,
        _updatedAt,
        judul,
        slug,
        createdAt,
        updatedAt,
        lastModified,
        status
      } | order(_createdAt asc)
    `);
    
    console.log(`Found ${posts.length} blog posts`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const results = [];
    
    console.log('\nProcessing posts...');
    
    for (const post of posts) {
      try {
        const title = post.judul || 'Untitled';
        console.log(`\nProcessing: ${title} (${post._id})`);
        
        const updates = {};
        let needsUpdate = false;
        
        // Set createdAt if missing (use Sanity's _createdAt)
        if (!post.createdAt && post._createdAt) {
          updates.createdAt = post._createdAt;
          needsUpdate = true;
          console.log(`Setting createdAt: ${post._createdAt}`);
        }
        
        // Set updatedAt if missing (use Sanity's _updatedAt)
        if (!post.updatedAt && post._updatedAt) {
          updates.updatedAt = post._updatedAt;
          needsUpdate = true;
          console.log(`Setting updatedAt: ${post._updatedAt}`);
        }
        
        // Set lastModified if missing
        if (!post.lastModified) {
          updates.lastModified = 'System Migration';
          needsUpdate = true;
          console.log('Setting lastModified: System Migration');
        }
        
        if (!needsUpdate) {
          console.log('✅ All timestamp fields already set, skipping');
          skippedCount++;
          results.push({
            id: post._id,
            title,
            status: 'skipped',
            reason: 'All timestamp fields already set',
            timestamp: new Date().toISOString()
          });
          continue;
        }
        
        // Update the post
        console.log('Updating timestamp fields...');
        
        await client
          .patch(post._id)
          .set(updates)
          .commit();
        
        updatedCount++;
        results.push({
          id: post._id,
          title,
          status: 'updated',
          updates: Object.keys(updates),
          timestamp: new Date().toISOString()
        });
        
        console.log('✅ Successfully updated timestamp fields');
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to update ${post._id}:`, error.message);
        errorCount++;
        results.push({
          id: post._id,
          title: post.judul || 'Unknown',
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    console.log('\n=== TIMESTAMP UPDATE SUMMARY ===');
    console.log(`✅ Successfully updated: ${updatedCount} posts`);
    console.log(`⏭️  Skipped (no changes needed): ${skippedCount} posts`);
    console.log(`❌ Failed updates: ${errorCount} posts`);
    console.log(`📊 Total processed: ${posts.length} posts`);
    
    // Save results
    const resultsData = {
      timestamp: new Date().toISOString(),
      totalProcessed: posts.length,
      totalUpdated: updatedCount,
      totalSkipped: skippedCount,
      totalErrors: errorCount,
      results: results
    };
    
    fs.writeFileSync('timestamp-update-results.json', JSON.stringify(resultsData, null, 2));
    console.log('\n📄 Timestamp update results saved to timestamp-update-results.json');
    
    if (updatedCount > 0) {
      console.log('\n🎉 Timestamp update completed successfully!');
    }
    
  } catch (error) {
    console.error('Error during timestamp update:', error);
    throw error;
  }
}

updateTimestamps();