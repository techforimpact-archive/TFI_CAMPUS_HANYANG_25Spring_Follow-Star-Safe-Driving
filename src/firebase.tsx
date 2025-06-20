import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_BGSR_apiKey,
  authDomain: import.meta.env.VITE_BGSR_authDomain,
  projectId: import.meta.env.VITE_BGSR_projectId,
  storageBucket: import.meta.env.VITE_BGSR_storageBucket,
  messagingSenderId: import.meta.env.VITE_BGSR_messagingSenderId,
  appId: import.meta.env.VITE_BGSR_appId,
  measurementId: import.meta.env.VITE_BGSR_measurementId
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);