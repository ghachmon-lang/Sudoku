import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import type { UserData, GameHistory } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyCz13y1K_gFaCu5_jRsnmaJsNAIW_cXXp4",
  authDomain: "sudoku-78f00.firebaseapp.com",
  projectId: "sudoku-78f00",
  storageBucket: "sudoku-78f00.firebasestorage.app",
  messagingSenderId: "1001282879092",
  appId: "1:1001282879092:web:afe16748306475550b9b21",
  measurementId: "G-GV2QS5MFN1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------------------------------------------------------------------------
// User Data (settings + stats)
// ---------------------------------------------------------------------------

export async function syncUserToCloud(userData: UserData): Promise<void> {
  try {
    const ref = doc(db, 'users', userData.pin);
    await setDoc(ref, {
      pin: userData.pin,
      createdAt: userData.createdAt,
      settings: userData.settings,
      stats: userData.stats,
    }, { merge: true });
  } catch (e) {
    console.error('Failed to sync user to cloud:', e);
  }
}

export async function fetchUserFromCloud(pin: string): Promise<UserData | null> {
  try {
    const ref = doc(db, 'users', pin);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as UserData;
  } catch (e) {
    console.error('Failed to fetch user from cloud:', e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Game History
// ---------------------------------------------------------------------------

export async function syncHistoryToCloud(pin: string, entry: GameHistory): Promise<void> {
  try {
    const ref = collection(db, 'users', pin, 'history');
    await addDoc(ref, entry);
  } catch (e) {
    console.error('Failed to sync history to cloud:', e);
  }
}

export async function fetchHistoryFromCloud(pin: string): Promise<GameHistory[]> {
  try {
    const ref = collection(db, 'users', pin, 'history');
    const q = query(ref, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as GameHistory);
  } catch (e) {
    console.error('Failed to fetch history from cloud:', e);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Full restore from PIN
// ---------------------------------------------------------------------------

export async function restoreFromPin(pin: string): Promise<{
  userData: UserData;
  history: GameHistory[];
} | null> {
  const userData = await fetchUserFromCloud(pin);
  if (!userData) return null;
  const history = await fetchHistoryFromCloud(pin);
  return { userData, history };
}
