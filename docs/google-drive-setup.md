# Google Drive Integration Setup

This guide explains how to set up Google Drive API access for the platform.

## Prerequisites

- A Google Cloud Platform account
- Access to the Google Drive folder you want to share

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter a project name (e.g., `bac2concours`) and click **Create**

## Step 2: Enable Google Drive API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click on it and press **Enable**

## Step 3: Create a Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in the details:
   - **Service account name**: `bac2concours` (or any name)
   - **Service account ID**: auto-generated
4. Click **Create and Continue**
5. Skip the optional steps and click **Done**

## Step 4: Generate a Key for the Service Account

1. In the **Credentials** page, find your service account and click on it
2. Go to the **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON** and click **Create**
5. A JSON file will be downloaded - keep it safe!

## Step 5: Extract Credentials from JSON

Open the downloaded JSON file. You'll need these values:

```json
{
  "client_email": "your-service@your-project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
}
```

## Step 6: Share Your Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Right-click on the folder you want to share → **Share**
3. Add the service account email (the `client_email` from the JSON)
4. Give it **Editor** access (so it can manage permissions)
5. Click **Send**

## Step 7: Get the Folder ID

The folder ID is in the URL when you open the folder:

```
https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz
                                        └──────────────────────────┘
                                              This is your folder ID
```

## Step 8: Update Environment Variables

Add these to your `.env` file:

```env
# Google Drive Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service@your-project.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_BOOKS_FOLDER_ID="1AbCdEfGhIjKlMnOpQrStUvWxYz"
```

### Important Notes

- **Private Key Format**: The private key must include the `\n` characters for line breaks. Copy it exactly as it appears in the JSON file.
- **Quotes**: Wrap all values in double quotes.
- **Security**: Never commit your `.env` file to version control.

## Verification

After setting up, restart your development server and:

1. Go to the Admin Dashboard
2. Look for the "Accès Google Drive" card
3. Click "Gérer les accès"
4. If configured correctly, you'll see the folder name and can manage user access

## Troubleshooting

### "Google Drive non configuré"
- Check that all three environment variables are set
- Verify the private key format (should have `\n` for newlines)
- Restart the development server after changing `.env`

### "Failed to grant access"
- Ensure the service account has Editor access to the folder
- Verify the folder ID is correct
- Check that the user email addresses are valid

### "Permission denied"
- The service account needs to be shared on the folder with Editor permissions
- Only the folder owner or editors can manage permissions
