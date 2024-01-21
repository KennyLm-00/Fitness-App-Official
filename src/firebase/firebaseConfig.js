// firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, collection } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyApazFW9vbz-Bi5VG95HtGZu1xm-VGsfNU",
  authDomain: "task-manager-655bf.firebaseapp.com",
  projectId: "task-manager-655bf",
  storageBucket: "task-manager-655bf.appspot.com",
  messagingSenderId: "195554567437",
  appId: "1:195554567437:web:1b2afd84ce184f7429fc44",
  measurementId: "G-7CKXJKG106"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage };

export default firebaseConfig;
