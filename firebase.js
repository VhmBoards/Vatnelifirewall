import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getDatabase, ref, set, get, push, update, remove, onValue, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCi1O7XQ9SXnngnGzzhwDBgoowtivZag8",
  authDomain: "full-vhm.firebaseapp.com",
  databaseURL: "https://full-vhm-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "full-vhm",
  storageBucket: "full-vhm.firebasestorage.app",
  messagingSenderId: "321612925860",
  appId: "1:321612925860:web:31d719132d80c618c5cf31",
  measurementId: "G-FW31FSQL41"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, ref, set, get, push, update, remove, onValue, query, orderByChild, limitToLast };