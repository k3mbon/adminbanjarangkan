import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = createClient({
  projectId: 'e0jvxihm',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.VITE_SANITY_TOKEN,
});

// Function to normalize text content for comparison
function normalizeContent(content) {
  if (!content) return '';
  
  // Extract text from portable text blocks
  let text = '';
  if (Array.isArray(content)) {
    content.forEach(block => {
      if (block._type === 'block' && block.children) {
        block.children.forEach(child => {
          if (child.text) {
            text += child.text + ' ';
          }
        });
      }
    });
  }
  
  // Normalize whitespace and convert to lowercase
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Function to check if content has images
function hasImages(content) {
  if (!Array.isArray(content)) return false;
  
  return content.some(block => block._type === 'image');
}

async function findDuplicates() {
  try {
    console.log('=== Sanity Blog Post Duplicate Finder ===\n');
    console.log('Fetching all blog posts...');
    
    const posts = await client.fetch(`
      *[_type == "blogPost"] {
        _id,
        _createdAt,
        _updatedAt,
        judul,
        slug,
        isi,
        status,
        description
      } | order(_createdAt desc)
    `);
    
    console.log(`Found ${posts.length} blog posts`);
    
    // Group posts by normalized content
    const contentGroups = new Map();
    
    posts.forEach(post => {
      const normalizedContent = normalizeContent(post.isi);
      const normalizedTitle = post.judul?.toLowerCase().trim() || '';
      
      // Create a composite key using title and content
      const compositeKey = `${normalizedTitle}|||${normalizedContent}`;
      
      if (!contentGroups.has(compositeKey)) {
        contentGroups.set(compositeKey, []);
      }
      
      contentGroups.get(compositeKey).push({
        ...post,
        normalizedContent,
        hasImages: hasImages(post.isi),
        contentLength: normalizedContent.length
      });
    });
    
    // Find groups with duplicates
    const duplicateGroups = [];
    
    contentGroups.forEach((group, key) => {
      if (group.length > 1) {
        // Sort by creation date (newest first)
        group.sort((a, b) => new Date(b._createdAt) - new Date(a._createdAt));
        
        duplicateGroups.push({
          key,
          posts: group,
          count: group.length
        });
      }
    });
    
    console.log(`\nFound ${duplicateGroups.length} groups of duplicates:`);
    
    if (duplicateGroups.length === 0) {
      console.log('\n✅ No duplicate posts found!');
      return [];
    }
    
    duplicateGroups.forEach((group, index) => {
      console.log(`\n--- Duplicate Group ${index + 1} ---`);
      console.log(`Posts in group: ${group.count}`);
      console.log(`Title: ${group.posts[0].judul}`);
      console.log(`Content length: ${group.posts[0].contentLength} characters`);
      
      group.posts.forEach((post, postIndex) => {
        console.log(`  ${postIndex + 1}. ID: ${post._id}`);
        console.log(`     Created: ${post._createdAt}`);
        console.log(`     Status: ${post.status}`);
        console.log(`     Has Images: ${post.hasImages}`);
        console.log(`     Slug: ${post.slug?.current || 'No slug'}`);
      });
    });
    
    // Create deletion plan
    console.log('\n=== DELETION PLAN ===');
    let totalToDelete = 0;
    const deletionPlan = [];
    
    duplicateGroups.forEach((group, groupIndex) => {
      console.log(`\n--- Plan for Group ${groupIndex + 1} ---`);
      
      // Keep the oldest post, delete the rest
      const postsToKeep = [group.posts[group.posts.length - 1]]; // Keep oldest
      const postsToDelete = group.posts.slice(0, -1); // Delete newer ones
      
      // Sort posts to delete by priority:
      // 1. Posts without images first
      // 2. Then by creation date (newest first)
      postsToDelete.sort((a, b) => {
        if (a.hasImages !== b.hasImages) {
          return a.hasImages ? 1 : -1; // Posts without images first
        }
        return new Date(b._createdAt) - new Date(a._createdAt); // Newest first
      });
      
      console.log(`✅ KEEP: ${postsToKeep[0]._id} (${postsToKeep[0]._createdAt})`);
      console.log(`❌ DELETE ${postsToDelete.length} posts:`);
      
      postsToDelete.forEach((post, index) => {
        console.log(`   ${index + 1}. ${post._id} (${post._createdAt}) - Images: ${post.hasImages}`);
        totalToDelete++;
      });
      
      deletionPlan.push({
        groupIndex,
        keep: postsToKeep,
        delete: postsToDelete
      });
    });
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total duplicate groups: ${duplicateGroups.length}`);
    console.log(`Total posts to delete: ${totalToDelete}`);
    console.log('\n⚠️  Review the deletion plan above before proceeding.');
    
    // Save deletion plan to file for reference
    const fs = await import('fs');
    const deletionData = {
      timestamp: new Date().toISOString(),
      totalGroups: duplicateGroups.length,
      totalToDelete,
      plan: deletionPlan
    };
    
    fs.writeFileSync('deletion-plan.json', JSON.stringify(deletionData, null, 2));
    console.log('\n📄 Deletion plan saved to deletion-plan.json');
    
    return duplicateGroups;
    
  } catch (error) {
    console.error('Error finding duplicates:', error);
    throw error;
  }
}

findDuplicates();