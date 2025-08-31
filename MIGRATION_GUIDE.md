# Firebase to Sanity Migration Guide

This guide will help you migrate your existing Firebase data (Firestore, Storage, and Authentication) to Sanity CMS while preserving original timestamps and data integrity.

## Prerequisites

1. **Firebase Project Access**: Ensure you have admin access to your Firebase project
2. **Sanity Project Setup**: Your Sanity project should be configured (already done)
3. **Node.js**: Ensure Node.js is installed on your system

## Step 1: Prepare Environment Variables

1. Get your Sanity authentication token:
   - Go to [Sanity Manage](https://sanity.io/manage/personal/tokens)
   - Create a new token with "Editor" permissions
   - Copy the token

2. Update your `.env` file:
   ```env
   VITE_SANITY_TOKEN=your_sanity_token_here
   SANITY_AUTH_TOKEN=your_sanity_token_here
   ```

## Step 2: Export Firebase Data

1. **Install required dependencies**:
   ```bash
   npm install firebase-admin
   ```

2. **Run the Firebase export script**:
   ```bash
   node firebase-export.js
   ```

   This will:
   - Export all Firestore collections (posts, prestasi, albums, carousel, agenda)
   - Download all Firebase Storage assets
   - Create export instructions for Firebase Authentication users
   - Save everything to `firebase-export/` directory

## Step 3: Export Firebase Authentication Users (Manual)

Since Firebase Authentication requires admin privileges, you'll need to use Firebase CLI:

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Export users**:
   ```bash
   firebase auth:export firebase-export/data/users.json --project sman1banjarangkan-d25d1
   ```

## Step 4: Import Data to Sanity

1. **Run the Sanity import script**:
   ```bash
   node sanity-import.js
   ```

   This will:
   - Upload all Firebase Storage assets to Sanity
   - Import blog posts with preserved timestamps
   - Import prestasi (achievements) data
   - Import photo albums
   - Import carousel images
   - Import agenda/events

## Step 5: Handle User Authentication

Since Sanity doesn't provide authentication services, you have several options:

### Option A: Use Sanity with External Auth (Recommended)
1. Implement authentication using services like:
   - **Auth0**
   - **Supabase Auth**
   - **NextAuth.js**
   - **Clerk**

### Option B: Simple Admin Authentication
1. Create a simple admin login system
2. Store admin credentials securely
3. Use session-based authentication

### Option C: Migrate to Supabase (Full Firebase Alternative)
1. Set up Supabase project
2. Import user data to Supabase Auth
3. Use Supabase for both data and authentication

## Step 6: Update Application Code

The application code has already been updated to use Sanity, but you may need to:

1. **Update authentication logic** based on your chosen auth solution
2. **Test all CRUD operations** to ensure they work with Sanity
3. **Verify data integrity** by comparing migrated data with original Firebase data

## Step 7: Verification and Testing

1. **Check Sanity Studio**:
   - Open http://localhost:3333/
   - Verify all data types are present
   - Check that images are properly linked

2. **Test the application**:
   - Open http://localhost:5173/
   - Test creating, reading, updating, and deleting content
   - Verify that timestamps are preserved

3. **Data integrity check**:
   - Compare document counts between Firebase and Sanity
   - Verify that all images are accessible
   - Check that all relationships are maintained

## Troubleshooting

### Common Issues:

1. **"SANITY_AUTH_TOKEN not set"**:
   - Ensure you've added the token to your `.env` file
   - Restart your terminal/IDE after updating `.env`

2. **"Firebase permission denied"**:
   - Ensure you have admin access to the Firebase project
   - Check that Firebase rules allow read access

3. **"Asset upload failed"**:
   - Check your internet connection
   - Verify Sanity token has proper permissions
   - Some large files might timeout - retry the import

4. **"Collection not found"**:
   - Some collections might be empty or named differently
   - Check the actual collection names in your Firebase console
   - Update the collection names in `firebase-export.js` if needed

## Post-Migration Cleanup

After successful migration:

1. **Remove Firebase dependencies** (optional):
   ```bash
   npm uninstall firebase
   ```

2. **Update package.json** to remove Firebase-related scripts

3. **Remove Firebase configuration files** (keep as backup initially)

4. **Update deployment configuration** to use Sanity instead of Firebase

## Data Structure Mapping

| Firebase Collection | Sanity Document Type | Key Changes |
|-------------------|---------------------|-------------|
| `posts` | `blogPost` | `judul` → `title`, `isi` → `content` |
| `prestasi` | `prestasi` | Added `level` and `category` fields |
| `albums` | `album` | Photos array converted to Sanity image references |
| `carousel` | `carouselImage` | Added `order` and `isActive` fields |
| `agenda` | `agenda` | `tanggal` → `eventDate`, added `organizer` |

## Support

If you encounter issues during migration:

1. Check the console logs for detailed error messages
2. Verify your Firebase and Sanity configurations
3. Ensure all required environment variables are set
4. Test with a small subset of data first

The migration scripts include comprehensive error handling and logging to help identify and resolve issues quickly.