# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Firebase Admin SDK Setup

If you encounter the error "Unable to detect a Project Id in the current environment" when sending emails, you need to set up Firebase Admin SDK credentials:

### For Development:

The application is currently configured to use the project ID from the Firebase client configuration. This should work for basic Firestore operations in development.

### For Production:

1. Create a service account key in your Firebase project:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

2. Set the environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
   ```

3. Alternatively, you can initialize the Firebase Admin SDK with the service account key directly:
   ```typescript
   import serviceAccount from './path/to/service-account-key.json';
   
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),
     projectId: serviceAccount.project_id,
   });
   ```

### Environment Variables

Make sure you have the following environment variables set:
- `GMAIL_USER` - Your Gmail address for sending emails
- `GMAIL_APP_PASSWORD` - Your Gmail app password (not your regular password)
- `FIREBASE_PROJECT_ID` - Your Firebase project ID (optional, falls back to config)

## Gmail SMTP Setup

To use Gmail for sending emails:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to your Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Add these environment variables to your `.env.local` file:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   ```

Note: Regular Gmail passwords will not work with SMTP. You must use an App Password.

## Deployment to Vercel

To deploy this application to Vercel:

1. Create a new project on Vercel
2. Connect your Git repository
3. Add the following environment variables in your Vercel project settings:
   - `GMAIL_USER` - Your Gmail address for sending emails
   - `GMAIL_APP_PASSWORD` - Your Gmail app password
   - `FIREBASE_CLIENT_EMAIL` - Your Firebase service account email
   - `FIREBASE_PRIVATE_KEY` - Your Firebase service account private key (make sure to escape newlines with `\n`)
   - `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL

4. The application includes a fallback for the canvas library that allows it to build even when canvas is not available in the deployment environment.

5. The build process will automatically handle optional dependencies.

Note: The canvas library is used for certificate generation. In deployment environments where canvas cannot be installed, the application will fall back to a simpler SVG-based certificate generation method.

## Vercel Configuration

The `vercel.json` file is configured to avoid conflicts between the `builds` and `functions` properties. This configuration ensures that the Next.js application is built correctly without any deployment issues.

To verify the deployment configuration, you can run:
```bash
node scripts/verify-deployment.js
```

This script will check for common configuration issues and ensure that your deployment settings are correct.