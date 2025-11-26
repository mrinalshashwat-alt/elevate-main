'use client';

import '../globals.css';
import AppProviders from '../components/AppProviders';

const ElevateApp = ({ Component, pageProps }) => {
  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
};

export default ElevateApp;

