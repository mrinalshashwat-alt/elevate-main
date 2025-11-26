'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchCurrentUser,
  logout as logoutApi,
  requestOtp as requestOtpApi,
  signup as signupApi,
  verifyOtp as verifyOtpApi,
} from '../api/auth';

const AuthContext = createContext(undefined);

const toUsername = (email, name) => {
  const baseFromEmail = email?.split('@')?.[0] || '';
  const fallback = name?.replace(/\s+/g, '').toLowerCase() || 'user';
  const cleaned = (baseFromEmail || fallback).replace(/[^a-zA-Z0-9_.-]/g, '');
  const trimmed = cleaned.slice(0, 20) || 'user';
  const suffix = Date.now().toString(36).slice(-4);
  return `${trimmed}-${suffix}`;
};

const normalizeUserProfile = (profile) => {
  if (!profile) return null;
  const fallbackName = profile.name || profile.username || (profile.email ? profile.email.split('@')[0] : 'User');
  const primaryRole = Array.isArray(profile.roles) && profile.roles.length > 0 ? profile.roles[0] : 'user';

  return {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    name: fallbackName,
    role: primaryRole,
    roles: profile.roles || [primaryRole],
    profilePicUrl: profile.profile_pic_url,
    isStaff: profile.is_staff,
    isActive: profile.is_active,
  };
};

const getLocalStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch (error) {
    console.warn('Unable to access localStorage', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const storage = getLocalStorage();

  const persistUser = useCallback(
    (nextUser) => {
      if (!storage) return;
      if (nextUser) {
        storage.setItem('user', JSON.stringify(nextUser));
      } else {
        storage.removeItem('user');
      }
    },
    [storage]
  );

  const persistToken = useCallback(
    (nextToken) => {
      if (!storage) return;
      if (nextToken) {
        storage.setItem('token', nextToken);
      } else {
        storage.removeItem('token');
      }
    },
    [storage]
  );

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    persistUser(null);
    persistToken(null);
  }, [persistToken, persistUser]);

  const establishSession = useCallback(
    async (tokenValue) => {
      if (!tokenValue) {
        clearSession();
        return null;
      }

      setToken(tokenValue);
      persistToken(tokenValue);

      try {
        const profile = await fetchCurrentUser(tokenValue);
        const normalized = normalizeUserProfile(profile);
        setUser(normalized);
        persistUser(normalized);
        return normalized;
      } catch (error) {
        console.error('Unable to fetch user profile', error);
        clearSession();
        throw error;
      }
    },
    [clearSession, persistToken, persistUser]
  );

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (!storage) {
        setIsLoading(false);
        return;
      }

      const existingToken = storage.getItem('token');
      const storedUser = storage.getItem('user');

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (isMounted) {
            setUser(parsedUser);
          }
        } catch (error) {
          console.warn('Failed to parse stored user', error);
          storage.removeItem('user');
        }
      }

      if (existingToken) {
        try {
          await establishSession(existingToken);
        } catch {
          // already handled
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [establishSession, storage]);

  const requestOtp = useCallback(async (email) => {
    if (!email) {
      throw new Error('Email is required to request an OTP.');
    }
    const sanitizedEmail = email.trim().toLowerCase();
    return requestOtpApi({ email: sanitizedEmail });
  }, []);

  const verifyOtp = useCallback(
    async ({ email, otp, rememberMe = false }) => {
      if (!email || !otp) {
        throw new Error('Both email and OTP are required.');
      }

      const payload = {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        remember_me: rememberMe,
      };

      const authResponse = await verifyOtpApi(payload);
      await establishSession(authResponse.token);
      return authResponse;
    },
    [establishSession]
  );

  const login = useCallback(
    async (emailOrPayload, maybeOtp, roleOrRememberMe) => {
      if (typeof emailOrPayload === 'object' && emailOrPayload !== null) {
        const { email, otp, rememberMe } = emailOrPayload;
        return verifyOtp({ email, otp, rememberMe });
      }

      const rememberMe = typeof roleOrRememberMe === 'boolean' ? roleOrRememberMe : true;
      return verifyOtp({ email: emailOrPayload, otp: maybeOtp, rememberMe });
    },
    [verifyOtp]
  );

  const register = useCallback(
    async (name, email, password) => {
      if (!email || !password) {
        throw new Error('Email and password are required to register.');
      }

      const payload = {
        email: email.trim().toLowerCase(),
        password,
        name: name?.trim(),
        username: toUsername(email, name),
      };

      await signupApi(payload);
      await requestOtp(payload.email);
    },
    [requestOtp]
  );

  const logout = useCallback(async () => {
    try {
      if (token) {
        await logoutApi(token);
      }
    } catch (error) {
      console.warn('Logout request failed', error);
    } finally {
      clearSession();
    }
  }, [clearSession, token]);

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    return establishSession(token);
  }, [establishSession, token]);

  const value = {
    user,
    login,
    requestOtp,
    verifyOtp,
    register,
    logout,
    refreshProfile,
    isAuthenticated: Boolean(user && token),
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
