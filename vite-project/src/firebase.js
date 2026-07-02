import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAZNrjLeJfCxfBr2GuRIbiH1KuLSDl4_jg",
    authDomain: "collabworkspace-3a23c.firebaseapp.com",
    projectId: "collabworkspace-3a23c",
    storageBucket: "collabworkspace-3a23c.firebasestorage.app",
    messagingSenderId: "911703956669",
    appId: "1:911703956669:web:786e17de7903bc22e66bd4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth & Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);