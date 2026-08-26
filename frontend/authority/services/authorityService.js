import { getAuth, onAuthStateChanged } from 'firebase/auth';

/**
 * Thin wrapper around the existing Firebase Auth setup. Member 4 does not
 * own sign-in/sign-up UI (assumed to already exist in the main project) —
 * this just exposes the current authority profile to the dashboard shell.
 */
export const authorityService = {
  subscribe(callback) {
    const auth = getAuth();
    return onAuthStateChanged(auth, (user) => {
      if (!user) return callback(null);
      callback({
        uid: user.uid,
        name: user.displayName || user.email || 'District Authority',
        email: user.email,
      });
    });
  },

  async signOut() {
    const auth = getAuth();
    await auth.signOut();
  },
};
