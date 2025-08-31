import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Sanity client configuration
const client = createClient({
  projectId: 'e0jvxihm',
  dataset: 'production', // or the name of your dataset
  useCdn: true, // Enable CDN for faster, cached responses
  apiVersion: '2023-05-03', // Use current date or a specific API version
  token: import.meta.env.VITE_SANITY_TOKEN, // Optional: for authenticated requests
});

// Image URL builder for Sanity images
const builder = imageUrlBuilder(client);

// Helper function to generate image URLs
export const urlFor = (source) => builder.image(source);
export { builder as imageUrlBuilder };

// Export the client for use in components
export { client };
export default client;

// Helper functions for common operations
export const sanityHelpers = {
  // Create a document
  create: (doc) => client.create(doc),
  
  // Update a document
  patch: (id, operations) => client.patch(id).set(operations).commit(),
  
  // Update a document (alias for patch)
  update: (id, operations) => client.patch(id).set(operations).commit(),
  
  // Get document by ID
  getById: (id) => client.getDocument(id),
  
  // Delete a document
  delete: (id) => client.delete(id),
  
  // Fetch documents with GROQ query
  fetch: (query, params) => client.fetch(query, params),
  
  // Upload an asset (image/file)
  uploadAsset: (file, options = {}) => {
    return client.assets.upload('image', file, options);
  },
  
  // Delete an asset
  deleteAsset: (id) => client.delete(id),
  
  // Authentication helpers
  authenticateUser: async (email, password) => {
    try {
      // Simple password hashing for demo (in production, use proper bcrypt)
       const hashedPassword = btoa(password); // Base64 encoding for demo
      
      const query = `*[_type == "user" && email == $email && password == $hashedPassword && isActive == true][0]`;
      const user = await client.fetch(query, { email, hashedPassword });
      
      if (user) {
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return {
          success: true,
          user: {
            uid: user._id,
            email: user.email,
            displayName: user.displayName,
            role: user.role
          }
        };
      } else {
        return { success: false, error: 'Kredensial tidak valid' };
      }
    } catch (error) {
      console.error('Error autentikasi:', error);
      return { success: false, error: 'Autentikasi gagal' };
    }
  },
  
  // Create user helper
  createUser: async (userData) => {
    try {
      // Hash password (simple base64 for demo)
       const hashedPassword = btoa(userData.password);
      
      const user = {
        _type: 'user',
        email: userData.email,
        password: hashedPassword,
        displayName: userData.displayName,
        role: userData.role || 'admin',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      return await client.create(user);
    } catch (error) {
      console.error('Error membuat pengguna:', error);
      throw error;
    }
  }
};

// Blog Post queries
export const getAllBlogPosts = () => {
  return client.fetch(`*[_type == "blogPost"] | order(_createdAt desc) {
    _id,
    judul,
    slug,
    description,
    author,
    category,
    isi,
    gambarThumbnail,
    gambar,
    status,
    _createdAt,
    _updatedAt
  }`);
};

export const getPublishedBlogPosts = () => {
  return client.fetch(`*[_type == "blogPost" && status == "published"] | order(_createdAt desc) {
    _id,
    judul,
    slug,
    description,
    author,
    category,
    isi,
    gambarThumbnail,
    gambar,
    status,
    _createdAt,
    _updatedAt
  }`);
};

export const getPendingBlogPosts = () => {
  return client.fetch(`*[_type == "blogPost" && status == "pending"] | order(_createdAt desc) {
    _id,
    judul,
    slug,
    description,
    author,
    category,
    isi,
    gambarThumbnail,
    gambar,
    status,
    _createdAt,
    _updatedAt
  }`);
};

export const getDraftBlogPosts = () => {
  return client.fetch(`*[_type == "blogPost" && status == "draft"] | order(_createdAt desc) {
    _id,
    judul,
    slug,
    description,
    author,
    category,
    isi,
    gambarThumbnail,
    gambar,
    status,
    _createdAt,
    _updatedAt
  }`);
};

export const getBlogPostBySlug = async (slug) => {
  try {
    const result = await client.fetch(`*[_type == "blogPost" && slug.current == $slug][0] {
      _id,
      judul,
      slug,
      description,
      author,
      category,
      isi,
      gambarThumbnail,
      gambar,
      status,
      _createdAt,
      _updatedAt
    }`, { slug });
    return result;
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    throw error;
  }
};

// Utility function to create URL-friendly slugs
export const createSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim('-'); // Remove leading/trailing hyphens
};

// Function to get slug from title
export const getSlugFromTitle = (title) => {
  return createSlug(title);
};

export const getBlogPostById = (id) => {
  return client.fetch(`*[_type == "blogPost" && _id == $id][0] {
    _id,
    judul,
    slug,
    description,
    author,
    category,
    isi,
    gambarThumbnail,
    gambar,
    status,
    _createdAt,
    _updatedAt
  }`, { id });
};

// Common GROQ queries
export const queries = {
  // Get all prestasi
  getAllPrestasi: '*[_type == "prestasi"] | order(_createdAt desc)',
  
  // Get all blog posts
  getAllPosts: '*[_type == "blogPost"] | order(_createdAt desc)',
  getAllBlogPosts: '*[_type == "blogPost"] | order(_createdAt desc)',
  
  // Get published blog posts
  getPublishedPosts: '*[_type == "blogPost" && status == "published"] | order(_createdAt desc)',
  
  // Get pending blog posts
  getPendingPosts: '*[_type == "blogPost" && status == "pending"] | order(_createdAt desc)',
  
  // Get draft blog posts
  getDraftPosts: '*[_type == "blogPost" && status == "draft"] | order(_createdAt desc)',
  
  // Get all general documents
  getAllDocuments: '*[_type == "generalDocument"] | order(_createdAt desc)',
  
  // Get all carousel images
  getAllCarouselImages: '*[_type == "carouselImage"] | order(_createdAt desc)',
  
  // Get all albums
  getAllAlbums: '*[_type == "album"] | order(_createdAt desc)',
  
  // Get all agenda items
  getAllAgenda: '*[_type == "agenda"] | order(_createdAt desc)',
  
  // Get single document by ID
  getById: (type, id) => `*[_type == "${type}" && _id == "${id}"][0]`,
};