import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export const ADMIN_EMAILS: readonly string[] = [
  'casaderacoespets@gmail.com',
  'fernandes.wesley@gmail.com',
];

/**
 * Checks if a given Firebase user has admin privileges.
 * Strictly verifies against authorized administrator email accounts:
 * - casaderacoespets@gmail.com
 * - fernandes.wesley@gmail.com
 * Anonymous accounts and unauthorized emails are strictly denied.
 */
export const checkIsUserAdmin = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  if (user.isAnonymous) return false;

  const email = (user.email || '').toLowerCase().trim();
  if (!email) return false;

  return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email);
};

/**
 * Sign in with Email and Password using Firebase Auth.
 * Uses the exact email provided by the user.
 * Strictly checks that the authenticated user is one of the authorized administrators.
 * If unauthorized, immediately signs out and denies access.
 */
export const signInWithEmail = async (email: string, pass: string): Promise<User> => {
  if (!auth) {
    throw new Error('Serviço Firebase Auth não configurado.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanEmail || !cleanPass) {
    throw new Error('Informe o e-mail e a senha de acesso.');
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
    const isAdmin = await checkIsUserAdmin(credential.user);

    if (!isAdmin) {
      await signOut(auth);
      const notAuthErr: any = new Error(
        'Acesso não autorizado. Esta conta não possui privilégios de administrador.'
      );
      notAuthErr.code = 'auth/unauthorized-admin';
      throw notAuthErr;
    }

    return credential.user;
  } catch (err: any) {
    if (err.code === 'auth/unauthorized-admin') {
      throw err;
    }

    if (
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/wrong-password' ||
      err.code === 'auth/user-not-found'
    ) {
      const passErr: any = new Error('E-mail ou senha incorretos. Verifique os dados e tente novamente.');
      passErr.code = 'auth/invalid-credential';
      throw passErr;
    }

    if (err.code === 'auth/invalid-email') {
      const emailErr: any = new Error('Formato de e-mail inválido.');
      emailErr.code = 'auth/invalid-email';
      throw emailErr;
    }

    throw err;
  }
};

/**
 * Sign in with Google using Firebase Auth.
 * Strictly validates that the authenticated Google account belongs to one of the authorized admins.
 * If unauthorized, immediately signs out and denies access.
 */
export const signInWithGoogle = async (): Promise<User> => {
  if (!auth || !googleProvider) {
    throw new Error('Autenticação com Google requer credenciais ativas do Firebase.');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const isAdmin = await checkIsUserAdmin(result.user);

    if (!isAdmin) {
      await signOut(auth);
      const notAuthErr: any = new Error(
        'Acesso não autorizado. A conta Google informada não possui privilégios de administrador.'
      );
      notAuthErr.code = 'auth/unauthorized-admin';
      throw notAuthErr;
    }

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
      if (isAdmin) {
        callback(user, true);
      } else {
        callback(null, false);
      }
    } else {
      callback(null, false);
    }
  });
};
