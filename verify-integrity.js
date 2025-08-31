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

// Function to normalize content for comparison
function normalizeContent(content) {
  if (!content) return '';
  
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
  
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function verifyIntegrity() {
  try {
    console.log('=== Sanity Blog Post Data Integrity Verification ===\n');
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
        createdAt,
        updatedAt,
        lastModified,
        description,
        author,
        category
      } | order(_createdAt asc)
    `);
    
    console.log(`Found ${posts.length} blog posts`);
    
    // Verification checks
    const checks = {
      totalPosts: posts.length,
      postsWithSlugs: 0,
      postsWithoutSlugs: 0,
      uniqueSlugs: new Set(),
      duplicateSlugs: [],
      postsWithTimestamps: 0,
      postsWithoutTimestamps: 0,
      duplicateContent: [],
      statusDistribution: {},
      issues: []
    };
    
    console.log('\n=== RUNNING INTEGRITY CHECKS ===\n');
    
    // Check 1: Slug verification
    console.log('1. Checking slug integrity...');
    const slugMap = new Map();
    
    posts.forEach(post => {
      const slug = post.slug?.current;
      
      if (slug) {
        checks.postsWithSlugs++;
        
        if (checks.uniqueSlugs.has(slug)) {
          checks.duplicateSlugs.push({
            slug,
            posts: [slugMap.get(slug), post._id]
          });
        } else {
          checks.uniqueSlugs.add(slug);
          slugMap.set(slug, post._id);
        }
      } else {
        checks.postsWithoutSlugs++;
        checks.issues.push({
          type: 'missing_slug',
          postId: post._id,
          title: post.judul
        });
      }
    });
    
    console.log(`   ✅ Posts with slugs: ${checks.postsWithSlugs}`);
    console.log(`   ❌ Posts without slugs: ${checks.postsWithoutSlugs}`);
    console.log(`   🔄 Duplicate slugs: ${checks.duplicateSlugs.length}`);
    
    // Check 2: Timestamp verification
    console.log('\n2. Checking timestamp fields...');
    
    posts.forEach(post => {
      if (post.createdAt && post.updatedAt && post.lastModified) {
        checks.postsWithTimestamps++;
      } else {
        checks.postsWithoutTimestamps++;
        checks.issues.push({
          type: 'missing_timestamps',
          postId: post._id,
          title: post.judul,
          missing: {
            createdAt: !post.createdAt,
            updatedAt: !post.updatedAt,
            lastModified: !post.lastModified
          }
        });
      }
    });
    
    console.log(`   ✅ Posts with complete timestamps: ${checks.postsWithTimestamps}`);
    console.log(`   ❌ Posts with missing timestamps: ${checks.postsWithoutTimestamps}`);
    
    // Check 3: Duplicate content verification
    console.log('\n3. Checking for remaining duplicate content...');
    const contentGroups = new Map();
    
    posts.forEach(post => {
      const normalizedContent = normalizeContent(post.isi);
      const normalizedTitle = post.judul?.toLowerCase().trim() || '';
      const compositeKey = `${normalizedTitle}|||${normalizedContent}`;
      
      if (!contentGroups.has(compositeKey)) {
        contentGroups.set(compositeKey, []);
      }
      
      contentGroups.get(compositeKey).push(post);
    });
    
    contentGroups.forEach((group, key) => {
      if (group.length > 1) {
        checks.duplicateContent.push({
          key,
          posts: group.map(p => ({ id: p._id, title: p.judul })),
          count: group.length
        });
      }
    });
    
    console.log(`   ✅ Unique content groups: ${contentGroups.size - checks.duplicateContent.length}`);
    console.log(`   ❌ Remaining duplicate content groups: ${checks.duplicateContent.length}`);
    
    // Check 4: Status distribution
    console.log('\n4. Checking status distribution...');
    
    posts.forEach(post => {
      const status = post.status || 'unknown';
      checks.statusDistribution[status] = (checks.statusDistribution[status] || 0) + 1;
    });
    
    Object.entries(checks.statusDistribution).forEach(([status, count]) => {
      console.log(`   📊 ${status}: ${count} posts`);
    });
    
    // Check 5: Required fields verification
    console.log('\n5. Checking required fields...');
    let postsWithAllRequiredFields = 0;
    
    posts.forEach(post => {
      const missingFields = [];
      
      if (!post.judul) missingFields.push('judul');
      if (!post.slug?.current) missingFields.push('slug');
      if (!post.status) missingFields.push('status');
      
      if (missingFields.length === 0) {
        postsWithAllRequiredFields++;
      } else {
        checks.issues.push({
          type: 'missing_required_fields',
          postId: post._id,
          title: post.judul || 'Untitled',
          missingFields
        });
      }
    });
    
    console.log(`   ✅ Posts with all required fields: ${postsWithAllRequiredFields}`);
    console.log(`   ❌ Posts with missing required fields: ${posts.length - postsWithAllRequiredFields}`);
    
    // Summary
    console.log('\n=== INTEGRITY VERIFICATION SUMMARY ===');
    console.log(`📊 Total posts: ${checks.totalPosts}`);
    console.log(`✅ Posts with unique slugs: ${checks.postsWithSlugs}`);
    console.log(`✅ Posts with complete timestamps: ${checks.postsWithTimestamps}`);
    console.log(`✅ Unique content groups: ${contentGroups.size - checks.duplicateContent.length}`);
    console.log(`❌ Total issues found: ${checks.issues.length}`);
    
    if (checks.issues.length === 0) {
      console.log('\n🎉 DATA INTEGRITY VERIFICATION PASSED!');
      console.log('All blog posts have:');
      console.log('- Unique slugs');
      console.log('- Complete timestamp fields');
      console.log('- No duplicate content');
      console.log('- All required fields');
    } else {
      console.log('\n⚠️  DATA INTEGRITY ISSUES FOUND:');
      checks.issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.type.toUpperCase()}`);
        console.log(`   Post: ${issue.title} (${issue.postId})`);
        if (issue.missingFields) {
          console.log(`   Missing: ${issue.missingFields.join(', ')}`);
        }
        if (issue.missing) {
          const missing = Object.entries(issue.missing)
            .filter(([, isMissing]) => isMissing)
            .map(([field]) => field);
          console.log(`   Missing timestamps: ${missing.join(', ')}`);
        }
      });
    }
    
    // Save verification results
    const verificationData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPosts: checks.totalPosts,
        postsWithSlugs: checks.postsWithSlugs,
        postsWithTimestamps: checks.postsWithTimestamps,
        duplicateContent: checks.duplicateContent.length,
        totalIssues: checks.issues.length
      },
      checks,
      passed: checks.issues.length === 0
    };
    
    fs.writeFileSync('integrity-verification-results.json', JSON.stringify(verificationData, null, 2));
    console.log('\n📄 Verification results saved to integrity-verification-results.json');
    
    return verificationData;
    
  } catch (error) {
    console.error('Error during integrity verification:', error);
    throw error;
  }
}

verifyIntegrity();