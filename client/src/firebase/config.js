import { initializeApp } from "firebase/app"
import { getAuth, browserLocalPersistence } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

export const actionCodeSettings = {
  url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT,
  handleCodeInApp: true,
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
auth.useDeviceLanguage();
auth.settings.appVerificationDisabledForTesting = false;

// Configure authentication persistence
auth.setPersistence(browserLocalPersistence);

// Configure multi-factor authentication if needed
// auth.tenantId = 'YOUR_TENANT_ID';

const db = getFirestore(app)

export { auth, db }

