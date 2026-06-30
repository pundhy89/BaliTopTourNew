import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAm4zxTNozo8ewIlJWz0DtXptPj_LvqHz0",
  authDomain: "yachty-analyzer-4k6kr.firebaseapp.com",
  projectId: "yachty-analyzer-4k6kr",
  storageBucket: "yachty-analyzer-4k6kr.firebasestorage.app",
  messagingSenderId: "545533725296",
  appId: "1:545533725296:web:5a124d7111bddf50fb82b5"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom databaseId from our config using getFirestore(app, databaseId)
export const db = getFirestore(app, "ai-studio-556860ba-31d2-4048-8b80-d50e0bc35d49");
