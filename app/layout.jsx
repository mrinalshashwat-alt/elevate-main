import './globals.css'
import React from 'react'
import AppProviders from '../src/components/AppProviders'

export const metadata = {
  title: 'Elevate Career - AI-Powered Career Excellence',
  description: 'Transform your career with AI-powered coaching, mock interviews, and personalized guidance',
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
