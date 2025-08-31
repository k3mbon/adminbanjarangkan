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

// Function to create a URL-friendly slug
function createSlug(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    // Replace Indonesian characters
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    // Remove special characters and replace with hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

// Function to ensure slug uniqueness
async function ensureUniqueSlug(baseSlug, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    // Check if slug exists
    const query = excludeId 
      ? `*[_type == "blogPost" && slug.current == $slug && _id != $excludeId][0]`
      : `*[_type == "blogPost" && slug.current == $slug][0]`;
    
    const existing = await client.fetch(query, { slug, excludeId });
    
    if (!existing) {
      return slug;
    }
    
    // If slug exists, append counter
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function generateSlugs() {
  try {
    console.log('=== Sanity Blog Post Slug Generator ===\n');
    console.log('Fetching all blog posts...');
    
    const posts = await client.fetch(`
      *[_type == "blogPost"] {
        _id,
        judul,
        slug,
        status,
        _createdAt
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
        const currentSlug = post.slug?.current;
        const title = post.judul || 'untitled';
        
        console.log(`\nProcessing: ${title} (${post._id})`);
        console.log(`Current slug: ${currentSlug || 'None'}`);
        
        // Generate new slug from title
        const baseSlug = createSlug(title);
        
        if (!baseSlug) {
          console.log('⚠️  Skipping: Could not generate slug from title');
          skippedCount++;
          results.push({
            id: post._id,
            title,
            status: 'skipped',
            reason: 'Could not generate slug from title',
            timestamp: new Date().toISOString()
          });
          continue;
        }
        
        // Ensure uniqueness
        const uniqueSlug = await ensureUniqueSlug(baseSlug, post._id);
        
        // Check if slug needs updating
        if (currentSlug === uniqueSlug) {
          console.log('✅ Slug already correct, skipping');
          skippedCount++;
          results.push({
            id: post._id,
            title,
            status: 'skipped',
            reason: 'Slug already correct',
            currentSlug,
            timestamp: new Date().toISOString()
          });
          continue;
        }
        
        // Update the post with new slug
        console.log(`Updating slug to: ${uniqueSlug}`);
        
        await client
          .patch(post._id)
          .set({
            slug: {
              _type: 'slug',
              current: uniqueSlug
            }
          })
          .commit();
        
        updatedCount++;
        results.push({
          id: post._id,
          title,
          status: 'updated',
          oldSlug: currentSlug,
          newSlug: uniqueSlug,
          timestamp: new Date().toISOString()
        });
        
        console.log('✅ Successfully updated slug');
        
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
    
    console.log('\n=== SLUG GENERATION SUMMARY ===');
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
    
    fs.writeFileSync('slug-generation-results.json', JSON.stringify(resultsData, null, 2));
    console.log('\n📄 Slug generation results saved to slug-generation-results.json');
    
    if (updatedCount > 0) {
      console.log('\n🎉 Slug generation completed successfully!');
    }
    
  } catch (error) {
    console.error('Error during slug generation:', error);
    throw error;
  }
}

generateSlugs();