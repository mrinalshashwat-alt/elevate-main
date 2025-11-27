'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext(undefined);

const getStoredRole = () => {
  if (typeof window === 'undefined') return 'user';
  return localStorage.getItem('userRole') || 'user';
};

const setStoredRole = (role) => {
  if (typeof window === 'undefined') return;
  if (role) {
    localStorage.setItem('userRole', role);
  } else {
    localStorage.removeItem('userRole');
  }
};

const buildUserProfile = (firebaseUser, roleOverride) => {
  if (!firebaseUser) return null;

  const displayName =
    firebaseUser.displayName ||
    (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User');

  const role = roleOverride || getStoredRole();

  return {
    uid: firebaseUser.uid,
    name: displayName,
    email: firebaseUser.email,
    role,
    avatar:
      firebaseUser.photoURL ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        displayName
      )}&background=f97316&color=fff`,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse stored user', error);
        }
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const normalizedUser = buildUserProfile(firebaseUser);
        setUser(normalizedUser);

        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(normalizedUser));
        }

        try {
          const token = await firebaseUser.getIdToken();
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }
        } catch (error) {
          console.warn('Unable to fetch Firebase ID token', error);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
        }
      } else {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
        setStoredRole(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password, role = 'user') => {
    setIsLoading(true);
    try {
      if (role !== 'user') {
        throw new Error('Admin login is not available yet.');
      }

      await signInWithEmailAndPassword(auth, email, password);
      setStoredRole(role);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (name) {
        try {
          await updateProfile(credential.user, { displayName: name });
        } catch (error) {
          console.warn('Unable to update user profile name', error);
        }
      }

      setStoredRole('user');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      setStoredRole(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // During build/SSR, return a safe default instead of throwing
    if (typeof window === 'undefined') {
      return {
        user: null,
        isLoading: true,
        isAuthenticated: false,
        login: async () => {},
        register: async () => {},
        logout: async () => {},
      };
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
