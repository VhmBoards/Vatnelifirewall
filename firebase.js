'use strict';

// Import the Firebase libraries
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  databaseURL: 'YOUR_DATABASE_URL',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Helper functions
export const getDatabaseRef = (path) => {
  return ref(database, path);
};

export const setData = async (path, data) => {
  const dbRef = getDatabaseRef(path);
  await set(dbRef, data);
};

export const getData = async (path) => {
  const dbRef = getDatabaseRef(path);
  const snapshot = await get(dbRef);
  return snapshot.val();
};
