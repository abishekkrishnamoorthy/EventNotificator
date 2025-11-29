import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Google Auth Provider
  const googleProvider = new GoogleAuthProvider();

  // Sign up with email and password
  const signup = async (email, password, displayName = '', skipEmailVerification = false) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Only send Firebase email verification if not skipped (for OTP flow)
      if (!skipEmailVerification) {
        await sendEmailVerification(userCredential.user);
      }
      
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Resend email verification
  const resendEmailVerification = async () => {
    try {
      setError(null);
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
        return true;
      }
      throw new Error('User not found or already verified');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Send password reset email
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      setError(null);
      if (currentUser) {
        await updateProfile(currentUser, profileData);
        return true;
      }
      throw new Error('No user logged in');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Change password
  const changePassword = async (newPassword, currentPassword) => {
    try {
      setError(null);
      if (currentUser) {
        // Re-authenticate user first
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );
        await reauthenticateWithCredential(currentUser, credential);
        
        // Update password
        await updatePassword(currentUser, newPassword);
        return true;
      }
      throw new Error('No user logged in');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    setError,
    signup,
    login,
    loginWithGoogle,
    logout,
    resendEmailVerification,
    resetPassword,
    updateUserProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

