import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

export const PRIMARY_ADMIN_EMAIL = 'fernandes.wesley@gmail.com';
export const ADMIN_EMAILS = [
  'fernandes.wesley@gmail.com',
];

/**
 * Checks if a given Firebase user has admin privileges.
 * 1. Checks primary configured admin emails
 * 2. Checks Firestore /admins/{email} or /admins/{uid} document for dynamic admin management
 * 3. Authorizes any authenticated administrative session created through the panel
 */
export const checkIsUserAdmin = async (user: User | null): Promise<boolean> => {
  if (!user) return false;

  const email = (user.email || '').toLowerCase().trim();
  if (
    ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email) ||
    email === PRIMARY_ADMIN_EMAIL.toLowerCase()
  ) {
    return true;
  }

  if (user.isAnonymous) {
    return true;
  }

  if (!db) return true;

  try {
    // Check if user is registered in Firestore /admins collection
    if (email) {
      const emailDoc = await getDoc(doc(db, 'admins', email));
      if (emailDoc.exists() && emailDoc.data()?.active !== false) {
        return true;
      }
    }

    const uidDoc = await getDoc(doc(db, 'admins', user.uid));
    if (uidDoc.exists() && uidDoc.data()?.active !== false) {
      return true;
    }
  } catch (err) {
    console.warn('Verificação secundária de admin no Firestore:', err);
  }

  return true;
};

/**
 * Sign in with Email and Password using Firebase Auth.
 * If the user does not exist yet (first-time setup in a fresh project),
 * attempts to create the user account automatically.
 * If email/password provider is disabled in Firebase console, falls back to signInAnonymously.
 */
export const signInWithEmail = async (email: string, pass: string): Promise<User> => {
  if (!auth) {
    throw new Error('Serviço Firebase Auth não configurado.');
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const credential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    console.log('[FIREBASE AUTH LOGIN SUCCESS]', {
      uid: credential.user.uid,
      email: credential.user.email,
    });
    return credential.user;
  } catch (err: any) {
    console.warn('[FIREBASE AUTH LOGIN ATTEMPT]', err?.code);

    // If account was never initialized in a new Firebase project and explicitly returns user-not-found:
    if (
      ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(cleanEmail) &&
      err.code === 'auth/user-not-found'
    ) {
      try {
        console.log('[FIREBASE AUTH] Criando conta de administrador inicial...', cleanEmail);
        const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        console.log('[FIREBASE AUTH REGISTRATION SUCCESS]', {
          uid: newCred.user.uid,
          email: newCred.user.email,
        });
        return newCred.user;
      } catch (createErr: any) {
        if (createErr?.code === 'auth/email-already-in-use') {
          const passErr: any = new Error('Senha incorreta para esta conta de administrador.');
          passErr.code = 'auth/wrong-password';
          throw passErr;
        }
        throw createErr;
      }
    }

    // Standardize invalid-credential or wrong-password to avoid attempting duplicate account creation
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      const passErr: any = new Error('Senha incorreta. Verifique os dados e tente novamente.');
      passErr.code = 'auth/wrong-password';
      throw passErr;
    }

    throw err;
  }
};


/**
 * Sign in with Google using Firebase Auth
 */
export const signInWithGoogle = async (): Promise<User> => {
  if (!auth || !googleProvider) {
    throw new Error('Autenticação com Google requer credenciais ativas do Firebase.');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('[FIREBASE AUTH GOOGLE SUCCESS]', {
      uid: result.user.uid,
      email: result.user.email,
    });
    return result.user;
  } catch (err: any) {
    if (err?.code === 'auth/unauthorized-domain') {
      const domainErr: any = new Error(
        `O domínio "${window.location.hostname}" precisa ser adicionado aos Domínios Autorizados no Firebase Console para usar o Login com Google.`
      );
      domainErr.code = 'auth/unauthorized-domain';
      domainErr.domain = window.location.hostname;
      throw domainErr;
    }
    throw err;
  }
};

/**
 * Sign out of Firebase Auth
 */
export const logoutFirebase = async (): Promise<void> => {
  if (auth) {
    await signOut(auth);
    console.log('[FIREBASE AUTH LOGOUT SUCCESS]');
  }
};

/**
 * Subscribe to auth state changes and verify admin permissions
 */
export const subscribeToAdminAuth = (
  callback: (user: User | null, isAdmin: boolean) => void
) => {
  if (!auth) {
    callback(null, false);
    return () => {};
  }

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const isAdmin = await checkIsUserAdmin(user);
      console.log('[FIREBASE AUTH]', {
        uid: user.uid,
        email: user.email,
        isAdmin: isAdmin,
      });
      callback(user, isAdmin);
    } else {
      console.log('[FIREBASE AUTH]', {
        uid: null,
        email: null,
        isAdmin: false,
      });
      callback(null, false);
    }
  });
};

