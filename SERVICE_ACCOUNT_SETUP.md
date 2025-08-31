# Firebase Service Account Setup

To export data from Firebase, you need to set up a service account key. Follow these steps:

## Step 1: Download Service Account Key

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **sman1banjarangkan-d25d1**
3. Click on the gear icon (⚙️) and select **Project Settings**
4. Go to the **Service Accounts** tab
5. Click **Generate New Private Key**
6. Click **Generate Key** to download the JSON file
7. **Important**: Rename the downloaded file to `serviceAccountKey.json`
8. Move the file to your project root directory: `c:\Users\angel\adminbanjarangkan\serviceAccountKey.json`

## Step 2: Security Note

⚠️ **IMPORTANT**: The service account key contains sensitive credentials. 

- **DO NOT** commit this file to version control (Git)
- **DO NOT** share this file with others
- **DO NOT** upload it to public repositories
- Keep it secure and delete it after migration is complete

## Step 3: File Structure

After downloading, your project should look like this:

```
c:\Users\angel\adminbanjarangkan\
├── serviceAccountKey.json  ← Place the downloaded file here
├── firebase-export.js
├── sanity-import.js
├── package.json
└── ...
```

## Step 4: Run Migration

Once the service account key is in place, you can run:

```bash
npm run migrate:export
```

## Alternative: Environment Variables

If you prefer not to use a service account file, you can set up environment variables:

1. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to your service account key file
2. Or use the Firebase CLI to authenticate: `firebase login`

## Troubleshooting

- **"Service account key not found"**: Make sure the file is named exactly `serviceAccountKey.json` and is in the project root
- **"Permission denied"**: Ensure your Firebase account has admin access to the project
- **"Invalid key file"**: Re-download the service account key from Firebase Console

After successful migration, you can safely delete the `serviceAccountKey.json` file.