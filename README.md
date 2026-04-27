# HopeLink - NGO Volunteer Coordination System

HopeLink is a single-page React application designed to help NGOs coordinate volunteer efforts during critical situations. It uses Firebase for real-time data storage and the Gemini API for smart volunteer matching.

## Prerequisites
- Node.js installed
- A Google account (for Firebase and Google AI Studio)

## 1. Setup Firebase (Database & Hosting)

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the steps to create a new project.
3. Once the project is created, click the **Web** icon (`</>`) to add a web app to your project.
4. Register the app (you can check "Also set up Firebase Hosting" if you want, but we will do it via CLI later).
5. Copy the `firebaseConfig` object provided in the setup instructions.
6. Open `src/firebase.js` in this repository and replace the placeholder `firebaseConfig` with your actual keys.
7. In the Firebase Console, go to **Build > Firestore Database** and click **Create database**.
8. Start in **Test mode** (for development purposes) and choose a location.

## 2. Setup Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key**.
3. In your project root (`ngo-volunteer-system`), create a new file named `.env`
4. Add your API key to the file like this:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

## 3. Running Locally

1. Open your terminal in the project directory (`ngo-volunteer-system`).
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the link provided in the terminal (usually `http://localhost:5173/`) in your browser.

## 4. Building and Deploying to Firebase Hosting

1. Install the Firebase CLI globally if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in to your Google account:
   ```bash
   firebase login
   ```
3. Initialize Firebase in your project directory:
   ```bash
   firebase init
   ```
   - Select **Hosting: Configure files for Firebase Hosting and (optionally) set up GitHub Action deploys**.
   - Select **Use an existing project** and choose the project you created earlier.
   - What do you want to use as your public directory? Type `dist` and press Enter.
   - Configure as a single-page app? Type `y` and press Enter.
   - Set up automatic builds and deploys with GitHub? Type `N` and press Enter.
4. Build the project for production:
   ```bash
   npm run build
   ```
5. Deploy to Firebase:
   ```bash
   firebase deploy
   ```
   
Your app will now be live on the provided `.web.app` or `.firebaseapp.com` URL!
