import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

/**
 * Configuração Oficial e Canônica do Firebase Web App para o projeto pets-casa-de-racoes
 * Fonte de verdade: firebase-applet-config.json
 *
 * Filtra e descarta expressamente valores fictícios ou truncados injetados pelo ambiente
 * (como VITE_FIREBASE_API_KEY = "AIzaSy..." e VITE_FIREBASE_PROJECT_ID = "pets-family").
 */
const CANONICAL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCQDpgpOGohDee-ZX_z3o2DtJ-3W037N58",
  authDomain: "pets-casa-de-racoes.firebaseapp.com",
  projectId: "pets-casa-de-racoes",
  storageBucket: "pets-casa-de-racoes.firebasestorage.app",
  messagingSenderId: "198036422908",
  appId: "1:198036422908:web:525bdc04953ab01663d779",
  measurementId: "G-V9BTTC66T9",
};

/**
 * Retorna o valor de configuração legítimo, descartando placeholders inválidos
 */
const resolveConfigValue = (
  envValue: string | undefined,
  canonicalValue: string,
  invalidPlaceholders: string[] = []
): string => {
  if (!envValue) return canonicalValue;
  const val = envValue.trim();
  if (!val || val === canonicalValue) return canonicalValue;
  if (invalidPlaceholders.includes(val) || val.includes('...') || val.length < 15) {
    return canonicalValue;
  }
  return val;
};

export const firebaseConfig = {
  apiKey: resolveConfigValue(
    import.meta.env.VITE_FIREBASE_API_KEY,
    CANONICAL_FIREBASE_CONFIG.apiKey,
    ['AIzaSy...', 'AIzaSy']
  ),
  authDomain: resolveConfigValue(
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    CANONICAL_FIREBASE_CONFIG.authDomain,
    ['pets-family.firebaseapp.com']
  ),
  projectId: resolveConfigValue(
    import.meta.env.VITE_FIREBASE_PROJECT_ID,
    CANONICAL_FIREBASE_CONFIG.projectId,
    ['pets-family']
  ),
  storageBucket: resolveConfigValue(
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    CANONICAL_FIREBASE_CONFIG.storageBucket,
    ['pets-family.firebasestorage.app']
  ),
  messagingSenderId: resolveConfigValue(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    CANONICAL_FIREBASE_CONFIG.messagingSenderId,
    ['000000000000']
  ),
  appId: resolveConfigValue(
    import.meta.env.VITE_FIREBASE_APP_ID,
    CANONICAL_FIREBASE_CONFIG.appId,
    ['1:000000000000:web:0000000000000000000000']
  ),
  measurementId: CANONICAL_FIREBASE_CONFIG.measurementId,
};

/**
 * Valida se a configuração está ativa e possui a API Key legítima e o projectId correto
 */
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.startsWith('AIzaSy') &&
    firebaseConfig.apiKey.length > 20 &&
    firebaseConfig.projectId === 'pets-casa-de-racoes'
  );
};

let appInstance: FirebaseApp;
let authInstance: Auth;
let dbInstance: Firestore;
let storageInstance: FirebaseStorage;
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
  try {
    storageInstance = getStorage(appInstance);
  } catch {
    storageInstance = ({} as FirebaseStorage);
  }
  googleProviderInstance = new GoogleAuthProvider();
  googleProviderInstance.setCustomParameters({ prompt: 'select_account' });
} catch (error) {
  console.error('[Firebase] Erro ao inicializar Firebase App:', error);
  appInstance = getApps().length > 0 ? getApp() : ({} as FirebaseApp);
  authInstance = ({} as Auth);
  dbInstance = ({} as Firestore);
  storageInstance = ({} as FirebaseStorage);
  googleProviderInstance = new GoogleAuthProvider();
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
export const googleProvider = googleProviderInstance;
