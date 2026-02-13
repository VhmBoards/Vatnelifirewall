// Firebase Configuration & Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, get, update, remove, onValue, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Firebase Config
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Global State
let currentUser = null;
let currentUserRole = null;

// Auth State Listener
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    console.log("✓ User logged in:", user.email);
  } else {
    console.log("✓ User logged out");
  }
});

// Helper Functions
export async function createUser(email, password, name, code, role) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Save user data to database
    await set(ref(db, `users/${uid}`), {
      uid: uid,
      name: name,
      email: email,
      code: code,
      role: role,
      createdAt: new Date().toISOString(),
      verified: false
    });

    // Initialize points
    await set(ref(db, `points/${uid}`), 0);

    console.log("✓ User created:", name);
    return userCredential.user;
  } catch (error) {
    console.error("❌ Error creating user:", error.message);
    throw error;
  }
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✓ User logged in:", email);
    return userCredential.user;
  } catch (error) {
    console.error("❌ Error logging in:", error.message);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    sessionStorage.clear();
    window.location.href = 'index.html';
  } catch (error) {
    console.error("❌ Error logging out:", error.message);
  }
}

export async function getCurrentUserData() {
  if (!currentUser) return null;
  try {
    const snapshot = await get(ref(db, `users/${currentUser.uid}`));
    return snapshot.val();
  } catch (error) {
    console.error("❌ Error getting user data:", error);
    return null;
  }
}

export async function saveMessage(uid, name, text, avatar) {
  try {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    // Check if current time is in suspicious window (09:00-14:30)
    const isSuspiciousTime = (hours >= 9 && hours < 14) || (hours === 14 && minutes < 30);

    const message = {
      uid: uid,
      name: name,
      text: text,
      avatar: avatar || null,
      timestamp: now.getTime(),
      visible: !isSuspiciousTime,
      time: time
    };

    const newMessageRef = push(ref(db, 'messages'));
    await set(newMessageRef, message);

    // Increment user points
    const pointsRef = ref(db, `points/${uid}`);
    const pointsSnapshot = await get(pointsRef);
    const currentPoints = pointsSnapshot.val() || 0;
    await set(pointsRef, currentPoints + 1);

    return newMessageRef.key;
  } catch (error) {
    console.error("❌ Error saving message:", error);
    throw error;
  }
}

export async function getMessages() {
  try {
    const snapshot = await get(ref(db, 'messages'));
    if (snapshot.exists()) {
      const messages = [];
      snapshot.forEach((child) => {
        messages.push({
          id: child.key,
          ...child.val()
        });
      });
      // Sort by timestamp (newest first)
      return messages.sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  } catch (error) {
    console.error("❌ Error getting messages:", error);
    return [];
  }
}

export function onMessagesUpdate(callback) {
  const messagesRef = ref(db, 'messages');
  return onValue(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const messages = [];
      snapshot.forEach((child) => {
        messages.push({
          id: child.key,
          ...child.val()
        });
      });
      // Sort by timestamp (newest first)
      callback(messages.sort((a, b) => b.timestamp - a.timestamp));
    } else {
      callback([]);
    }
  });
}

export async function saveAvatar(uid, imageData) {
  try {
    await set(ref(db, `avatars/${uid}`), imageData);
    console.log("✓ Avatar saved");
  } catch (error) {
    console.error("❌ Error saving avatar:", error);
    throw error;
  }
}

export async function getAvatar(uid) {
  try {
    const snapshot = await get(ref(db, `avatars/${uid}`));
    return snapshot.val();
  } catch (error) {
    console.error("❌ Error getting avatar:", error);
    return null;
  }
}

export async function submitPendingSignup(name, phone, code, birthYear) {
  try {
    const newSignupRef = push(ref(db, 'pendingSignups'));
    await set(newSignupRef, {
      name: name,
      phone: phone,
      code: code,
      birthYear: birthYear,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
    console.log("✓ Signup submitted");
    return newSignupRef.key;
  } catch (error) {
    console.error("❌ Error submitting signup:", error);
    throw error;
  }
}

export async function getPendingSignups() {
  try {
    const snapshot = await get(ref(db, 'pendingSignups'));
    if (snapshot.exists()) {
      const signups = [];
      snapshot.forEach((child) => {
        signups.push({
          id: child.key,
          ...child.val()
        });
      });
      return signups;
    }
    return [];
  } catch (error) {
    console.error("❌ Error getting signups:", error);
    return [];
  }
}

export async function approveSignup(signupId, name, phone, code, birthYear) {
  try {
    const email = `${name.toLowerCase()}@vatneli.no`;
    const password = Math.random().toString(36).substring(2, 10);

    // Create user account
    await createUser(email, password, name, code, 'student');

    // Delete from pending
    await remove(ref(db, `pendingSignups/${signupId}`));

    console.log("✓ Signup approved for:", name);
    return { email, password };
  } catch (error) {
    console.error("❌ Error approving signup:", error);
    throw error;
  }
}

export async function rejectSignup(signupId) {
  try {
    await remove(ref(db, `pendingSignups/${signupId}`));
    console.log("✓ Signup rejected");
  } catch (error) {
    console.error("❌ Error rejecting signup:", error);
    throw error;
  }
}

export async function deleteMessage(messageId) {
  try {
    await remove(ref(db, `messages/${messageId}`));
    console.log("✓ Message deleted");
  } catch (error) {
    console.error("❌ Error deleting message:", error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const snapshot = await get(ref(db, 'users'));
    if (snapshot.exists()) {
      const users = [];
      snapshot.forEach((child) => {
        users.push({
          uid: child.key,
          ...child.val()
        });
      });
      return users;
    }
    return [];
  } catch (error) {
    console.error("❌ Error getting users:", error);
    return [];
  }
}

export async function getPoints(uid) {
  try {
    const snapshot = await get(ref(db, `points/${uid}`));
    return snapshot.val() || 0;
  } catch (error) {
    console.error("❌ Error getting points:", error);
    return 0;
  }
}

export async function submitSurvey(uid, surveyData) {
  try {
    await set(ref(db, `survey/${uid}`), {
      ...surveyData,
      timestamp: new Date().toISOString()
    });
    console.log("✓ Survey submitted");
  } catch (error) {
    console.error("❌ Error submitting survey:", error);
    throw error;
  }
}

export async function getSurvey(uid) {
  try {
    const snapshot = await get(ref(db, `survey/${uid}`));
    return snapshot.val();
  } catch (error) {
    console.error("❌ Error getting survey:", error);
    return null;
  }
}

export function getCurrentUserFromSession() {
  return {
    name: sessionStorage.getItem('userName'),
    role: sessionStorage.getItem('userRole'),
    code: sessionStorage.getItem('userCode')
  };
}

console.log("✓ Firebase initialized successfully");