'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC54Dec_xb4xIFnUd6KQd912VYHoVMH4dw',
  authDomain: 'elevateai-b2d36.firebaseapp.com',
  projectId: 'elevateai-b2d36',
  storageBucket: 'elevateai-b2d36.firebasestorage.app',
  messagingSenderId: '788681990653',
  appId: '1:788681990653:web:61302af26ca77caeb2f994',
  measurementId: 'G-88VSG8WXW3',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseApp = app;
export const auth = getAuth(app);

