import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET,
  token: process.env.VITE_SANITY_TOKEN,
  useCdn: false,
  apiVersion: '2023-01-01'
});

const createTestPost = async () => {
  try {
    const testPost = {
      _type: 'blogPost',
      judul: 'Test Blog Post',
      isi: [
        {
          _type: 'block',
          _key: 'test1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'test2',
              text: 'This is a test blog post to verify the display functionality.'
            }
          ]
        }
      ],
      status: 'published',
      createdAt: new Date().toISOString()
    };

    const result = await client.create(testPost);
    console.log('Test post created:', result);
  } catch (error) {
    console.error('Error creating test post:', error);
  }
};

createTestPost();