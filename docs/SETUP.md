# SheetFlow Setup Guide - Step by Step

This guide walks you through setting up SheetFlow from scratch. No experience needed!

## What You'll Need

- A computer with Node.js installed (download from nodejs.org)
- Google account
- About 15 minutes

## Step 1: Install Node.js

1. Go to [nodejs.org](https://nodejs.org/)
2. Download the "LTS" (Long Term Support) version
3. Run the installer and follow the steps
4. Open your terminal and verify installation:

```bash
node --version
npm --version
```

You should see version numbers printed.

## Step 2: Clone The Project

```bash
git clone <your-repository-url>
cd SheetFlow
```

## Step 3: Install Dependencies

This downloads all the code libraries SheetFlow needs:

```bash
npm install
```

This might take a few minutes. You'll see a lot of text flowing by - this is normal!

## Step 4: Setup MongoDB (Database)

MongoDB stores user accounts and project settings.

### Create a Free Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Sign Up"
3. Create a free account with your email
4. Complete the setup wizard

### Create a Database Connection

1. In the MongoDB dashboard, look for "Clusters" on the left
2. Click "Create" to create a new free cluster
3. Choose the free tier option
4. Click "Create Cluster" (takes a few minutes)
5. Once created, click "Connect"
6. Click "Connect Your Application"
7. Choose "Node.js" and copy the connection string
8. In the connection string, replace:
   - `<username>` with a username you create
   - `<password>` with a password you create
   - `myFirstDatabase` with `sheetflow`

**Example:**
```
mongodb+srv://user123:mypassword@cluster0.mongodb.net/sheetflow?retryWrites=true&w=majority
```

### Allow Your Computer to Connect

1. In MongoDB Atlas, click "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
4. Confirm

## Step 5: Setup Google Sign-In

Google OAuth lets users sign in with their Google account.

### Get Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" at the top
3. Click "NEW PROJECT"
4. Name it "SheetFlow" and click "Create"
5. Wait for it to complete (~1 minute)
6. Once in the project, search for "Google+ API"
7. Click it and press "Enable"
8. Wait for it to enable
9. Go back, look for "OAuth consent screen" on the left
10. Choose "External" and click "Create"
11. Fill in:
    - App name: "SheetFlow"
    - Your email for support
    - Your email for contact info
12. Click "Save and Continue"
13. On Scopes page, click "Save and Continue" (defaults are fine)
14. On Summary page, click "Back to Dashboard"
15. Now click "Credentials" on the left sidebar
16. Click "Create Credentials" → "OAuth client ID"
17. Choose "Web Application"
18. Under "Authorized redirect URIs", click "Add URI"
19. Add: `http://localhost:3000/api/auth/callback/google`
20. Click "Create"
21. A popup shows with your Client ID and Secret - **copy these!**

## Step 6: Create Environment File

Environment variables are settings that the app reads.

1. In your SheetFlow folder, create a new file named `.env.local`
2. Copy this content and fill in your values:

```env
# From MongoDB Atlas
MONGODB_URI=mongodb+srv://user:password@cluster0.mongodb.net/sheetflow?retryWrites=true&w=majority

# From Google Cloud
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-secret-here

# Generate a random secret with: openssl rand -hex 32
NEXTAUTH_SECRET=generate-random-string-here

# Keep this for local development
NEXTAUTH_URL=http://localhost:3000

# App title
NEXT_PUBLIC_APP_TITLE=SheetFlow AI
```

### Generate NEXTAUTH_SECRET

Open your terminal and run:

```bash
openssl rand -hex 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET`.

## Step 7: Run The App

```bash
npm run dev
```

You should see:

```
> ready - started server on 0.0.0.0:3000
```

## Step 8: Test It Works

1. Open your browser to `http://localhost:3000`
2. You should see the SheetFlow homepage
3. Click "Sign In" and sign in with your Google account
4. You're done! 🎉

## Testing the API

To verify everything is connected properly:

```bash
curl http://localhost:3000/api/backend/health
```

You should see something like:

```json
{
  "status": "healthy",
  "message": "App is running and database connection is working"
}
```

## Troubleshooting

### "MONGODB_URI is not set"

Your `.env.local` file isn't being read. Make sure:
- File name is exactly `.env.local` (with the dot at the start)
- It's in the root SheetFlow folder
- Restart your dev server after saving the file

### "Connection refused"

MongoDB isn't accessible. Check:
- Your internet connection
- Your MongoDB connection string is correct
- You allowed your IP address in MongoDB Atlas

### "Google sign-in not working"

- Make sure you added the redirect URI correctly
- Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are filled in

### App crashes on startup

Check your terminal for error messages. Most common:
- Missing environment variable
- MongoDB connection issue
- Port 3000 already in use

## What's Next?

You now have Phase 1 complete! You can:

1. **Explore the code** - look at files in `/backend` and `/frontend`
2. **Test the APIs** - use curl or Postman to test endpoints
3. **Wait for Phase 2** - Excel file upload features coming soon

## Need Help?

- Check the [README.md](README.md) for API documentation
- Look at the code comments - they explain what each part does
- Create an issue on GitHub with your question

---

**You're ready to develop SheetFlow! Welcome aboard!** 🚀
