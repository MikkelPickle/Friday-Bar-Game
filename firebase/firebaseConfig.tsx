import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
import { getFirestore} from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDtVzBfIBuRMUXjwn_o2TsmyqoX1rrIVYM",
  authDomain: "friday-bar-app.firebaseapp.com",
  projectId: "friday-bar-app",
  storageBucket: "friday-bar-app.firebasestorage.app",
  messagingSenderId: "243952221636",
  appId: "1:243952221636:web:b6d30be3963395e5207891",
  measurementId: "G-WCDPHEJC9M"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

