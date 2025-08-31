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

async function fixStatus() {
  try {
    console.log('=== Sanity Blog Post Status Fix ===\n');
    console.log('Fetching all blog posts without status...');
    
    const posts = await client.fetch(`
      *[_type == "blogPost" && !defined(status)] {
        _id,
        judul,
        slug,
        _createdAt
      } | order(_createdAt asc)
    `);
    
    console.log(`Found ${posts.length} posts without status`);
    
    if (posts.length === 0) {
      console.log('✅ All posts already have status field!');
      return;
    }
    
    let updatedCount = 0;
    let errorCount = 0;
    const results = [];
    
    console.log('\nSetting status to "published" for all posts...');
    
    for (const post of posts) {
      try {
        const title = post.judul || 'Untitled';
        console.log(`Processing: ${title} (${post._id})`);
        
        // Set status to published (assuming these are existing posts that should be visible)
        await client
          .patch(post._id)
          .set({
            status: 'published'
          })
          .commit();
        
        updatedCount++;
        results.push({
          id: post._id,
          title,
          status: 'updated',
          newStatus: 'published',
          timestamp: new Date().toISOString()
        });
        
        console.log('✅ Successfully set status to "published"');
        
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
    
    console.log('\n=== STATUS FIX SUMMARY ===');
    console.log(`✅ Successfully updated: ${updatedCount} posts`);
    console.log(`❌ Failed updates: ${errorCount} posts`);
    console.log(`📊 Total processed: ${posts.length} posts`);
    
    // Save results
    const resultsData = {
      timestamp: new Date().toISOString(),
      totalProcessed: posts.length,
      totalUpdated: updatedCount,
      totalErrors: errorCount,
      results: results
    };
    
    fs.writeFileSync('status-fix-results.json', JSON.stringify(resultsData, null, 2));
    console.log('\n📄 Status fix results saved to status-fix-results.json');
    
    if (updatedCount > 0) {
      console.log('\n🎉 Status fix completed successfully!');
      console.log('All posts now have status = "published"');
    }
    
  } catch (error) {
    console.error('Error during status fix:', error);
    throw error;
  }
}

fixStatus();