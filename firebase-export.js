// Firebase Data Export Script
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
// Note: You need to download the service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate New Private Key
// Save it as 'serviceAccountKey.json' in your project root
try {
  const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "sman1banjarangkan-d25d1.appspot.com"
  });
} catch (error) {
  console.log('Service account key not found. Using default credentials or environment variables.');
  // Fallback: Initialize with default credentials
  admin.initializeApp({
    projectId: "sman1banjarangkan-d25d1",
    storageBucket: "sman1banjarangkan-d25d1.appspot.com"
  });
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage().bucket();

// Create export directories
const exportDir = path.join(__dirname, 'firebase-export');
const dataDir = path.join(exportDir, 'data');
const assetsDir = path.join(exportDir, 'assets');

if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

// Helper function to download files
function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(filepath);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

// Export Firestore collections
async function exportFirestoreData() {
    console.log('Exporting Firestore data...');
    
    const collections = ['posts', 'prestasi', 'albums', 'carousel', 'agenda', 'users'];
    const exportData = {};
    
    for (const collectionName of collections) {
        try {
            console.log(`Exporting collection: ${collectionName}`);
            const querySnapshot = await db.collection(collectionName).get();
            const documents = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Preserve timestamps
                const docData = {
                    id: doc.id,
                    ...data,
                    // Convert Firebase timestamps to ISO strings
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                    publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt,
                    timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp
                };
                documents.push(docData);
            });
            
            exportData[collectionName] = documents;
            console.log(`Exported ${documents.length} documents from ${collectionName}`);
        } catch (error) {
            console.error(`Error exporting collection ${collectionName}:`, error);
            exportData[collectionName] = [];
        }
    }
    
    // Save to JSON file
    fs.writeFileSync(
        path.join(dataDir, 'firestore-data.json'),
        JSON.stringify(exportData, null, 2)
    );
    
    console.log('Firestore data export completed!');
    return exportData;
}

// Export Firebase Storage assets
async function exportStorageAssets() {
    console.log('Exporting Firebase Storage assets...');
    
    const assetsList = [];
    
    try {
        const [files] = await storage.getFiles();
        
        for (const file of files) {
            try {
                const [url] = await file.getSignedUrl({
                    action: 'read',
                    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
                });
                
                const filename = file.name;
                const filepath = path.join(assetsDir, filename);
                
                // Create subdirectories if needed
                const fileDir = path.dirname(filepath);
                if (!fs.existsSync(fileDir)) {
                    fs.mkdirSync(fileDir, { recursive: true });
                }
                
                console.log(`Downloading: ${filename}`);
                await downloadFile(url, filepath);
                
                assetsList.push({
                    originalPath: file.name,
                    filename: path.basename(filename),
                    downloadURL: url,
                    localPath: filepath,
                    folder: path.dirname(filename) !== '.' ? path.dirname(filename) : null
                });
            } catch (error) {
                console.error(`Error downloading ${file.name}:`, error);
            }
        }
    } catch (error) {
        console.error('Error listing storage assets:', error);
    }
    
    // Save assets manifest
    fs.writeFileSync(
        path.join(dataDir, 'storage-assets.json'),
        JSON.stringify(assetsList, null, 2)
    );
    
    console.log(`Storage assets export completed! Downloaded ${assetsList.length} files.`);
    return assetsList;
}

// Export Firebase Authentication users
async function exportAuthUsers() {
    console.log('Exporting Firebase Authentication users...');
    
    const users = [];
    let nextPageToken;
    
    try {
        do {
            const listUsersResult = await auth.listUsers(1000, nextPageToken);
            
            listUsersResult.users.forEach((userRecord) => {
                const userData = {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    emailVerified: userRecord.emailVerified,
                    displayName: userRecord.displayName,
                    photoURL: userRecord.photoURL,
                    phoneNumber: userRecord.phoneNumber,
                    disabled: userRecord.disabled,
                    metadata: {
                        creationTime: userRecord.metadata.creationTime,
                        lastSignInTime: userRecord.metadata.lastSignInTime,
                        lastRefreshTime: userRecord.metadata.lastRefreshTime
                    },
                    customClaims: userRecord.customClaims,
                    providerData: userRecord.providerData
                };
                users.push(userData);
            });
            
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);
        
        // Save users to JSON file
        fs.writeFileSync(
            path.join(dataDir, 'auth-users.json'),
            JSON.stringify(users, null, 2)
        );
        
        console.log(`Exported ${users.length} users from Firebase Authentication`);
    } catch (error) {
        console.error('Error exporting authentication users:', error);
        
        // Create fallback instructions file
        const instructions = {
            error: error.message,
            note: "Failed to export users programmatically. Try using Firebase CLI:",
            instructions: [
                "1. Install Firebase CLI: npm install -g firebase-tools",
                "2. Login to Firebase: firebase login",
                "3. Export users: firebase auth:export users.json --project sman1banjarangkan-d25d1",
                "4. Move the users.json file to this data directory"
            ]
        };
        
        fs.writeFileSync(
            path.join(dataDir, 'auth-export-error.json'),
            JSON.stringify(instructions, null, 2)
        );
    }
    
    return users;
}

// Main export function
async function exportAllData() {
    console.log('Starting Firebase data export...');
    console.log(`Export directory: ${exportDir}`);
    
    try {
        // Export Firestore data
        const firestoreData = await exportFirestoreData();
        
        // Export Storage assets
        const storageAssets = await exportStorageAssets();
        
        // Export Auth users (instructions only)
        await exportAuthUsers();
        
        // Create summary
        const summary = {
            exportDate: new Date().toISOString(),
            firestoreCollections: Object.keys(firestoreData).length,
            totalDocuments: Object.values(firestoreData).reduce((sum, docs) => sum + docs.length, 0),
            storageAssets: storageAssets.length,
            exportPath: exportDir
        };
        
        fs.writeFileSync(
            path.join(exportDir, 'export-summary.json'),
            JSON.stringify(summary, null, 2)
        );
        
        console.log('\n=== Export Summary ===');
        console.log(`Export completed at: ${summary.exportDate}`);
        console.log(`Firestore collections: ${summary.firestoreCollections}`);
        console.log(`Total documents: ${summary.totalDocuments}`);
        console.log(`Storage assets: ${summary.storageAssets}`);
        console.log(`Export location: ${exportDir}`);
        
    } catch (error) {
        console.error('Export failed:', error);
    }
}

// Run the export
exportAllData();