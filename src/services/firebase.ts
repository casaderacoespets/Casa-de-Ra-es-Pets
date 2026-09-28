import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';

/**
 * Configuração Oficial do Firebase Web App para o projeto Pet's Family
 * Permite override por variáveis de ambiente se presentes.
 */
export const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCQDpgpOGohDee-ZX_z3o2DtJ-3W037N58").trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pets-casa-de-racoes.firebaseapp.com").trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || "pets-casa-de-racoes").trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pets-casa-de-racoes.firebasestorage.app").trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "198036422908").trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || "1:198036422908:web:525bdc04953ab01663d779").trim(),
  measurementId: "G-V9BTTC66T9"
};

/**
  * Valida se a configuração está ativa e possui o projectId configurado
  */
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.startsWith('AIzaSy') &&
    firebaseConfig.projectId
  );
};

let appInstance: FirebaseApp;
let authInstance: Auth;
let dbInstance: Firestore;
let googleProviderInstance: GoogleAuthProvider;

try {
  appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(appInstance);
  try {
    dbInstance = initializeFirestore(appInstance, {
      ignoreUndefinedProperties: true,
    });
  } catch {
    dbInstance = getFirestore(appInstance);
  }
  googleProviderInstance = new GoogleAuthProvider();
  googleProviderInstance.setCustomParameters({ prompt: 'select_account' });
} catch (error) {
  console.error('[Firebase] Erro ao inicializar Firebase App:', error);
  // Fallback seguro caso ocorra erro inesperado
  appInstance = getApps().length > 0 ? getApp() : ({} as FirebaseApp);
  authInstance = ({} as Auth);
  dbInstance = ({} as Firestore);
  googleProviderInstance = new GoogleAuthProvider();
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const googleProvider = googleProviderInstance;

