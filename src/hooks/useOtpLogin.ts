import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

type AuthContextShape = {
  requestOtp: (email: string) => Promise<unknown>;
  verifyOtp: (params: { email: string; otp: string; rememberMe?: boolean }) => Promise<unknown>;
};

const extractErrorMessage = (error: any, fallback: string) => {
  const responseData = error?.response?.data;
  if (!responseData) return error?.message || fallback;

  if (typeof responseData.detail === 'string') {
    return responseData.detail;
  }

  if (typeof responseData.message === 'string') {
    return responseData.message;
  }

  if (responseData.message && typeof responseData.message === 'object') {
    const firstEntry = Object.values(responseData.message)[0];
    if (Array.isArray(firstEntry) && firstEntry.length > 0) {
      return firstEntry[0];
    }
    if (typeof firstEntry === 'string') {
      return firstEntry;
    }
  }

  if (responseData.details) {
    if (typeof responseData.details === 'string') {
      return responseData.details;
    }
    if (typeof responseData.details === 'object') {
      const detailEntry = Object.values(responseData.details)[0];
      if (Array.isArray(detailEntry) && detailEntry.length > 0) {
        return detailEntry[0];
      }
      if (typeof detailEntry === 'string') {
        return detailEntry;
      }
    }
  }

  return fallback;
};

export const useOtpLogin = () => {
  const { requestOtp, verifyOtp } = useAuth() as AuthContextShape;

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [otpRequested, setOtpRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const startOtpRequest = useCallback(async (): Promise<boolean> => {
    if (!email.trim()) {
      setError('Please enter your email to continue.');
      return false;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await requestOtp(email.trim());
      setOtpRequested(true);
      setIsSuccess(true);
      setSuccessMessage(
        email.trim().toLowerCase().endsWith('@elevatecareer.ai')
          ? "Dev shortcut active. Use code 000000 to sign in."
          : 'Login code sent! Please check your email for the OTP.'
      );
      return true;
    } catch (err) {
      setIsSuccess(false);
      setError(extractErrorMessage(err, 'Unable to send login code right now. Please try again.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [email, requestOtp]);

  const verifyOtpCode = useCallback(async (): Promise<boolean> => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Enter the 6-digit code we sent to your email.');
      return false;
    }

    setIsLoading(true);
    setError('');

    try {
      await verifyOtp({
        email: email.trim(),
        otp: otpCode.trim(),
        rememberMe,
      });
      setIsSuccess(true);
      setSuccessMessage('Signed in successfully! Redirecting you now.');
      return true;
    } catch (err) {
      setIsSuccess(false);
      setError(extractErrorMessage(err, 'Unable to sign in right now. Please try again.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [email, otpCode, rememberMe, verifyOtp]);

  const resetOtpFlow = useCallback(() => {
    setOtpRequested(false);
    setOtpCode('');
    setSuccessMessage('');
    setError('');
    setIsSuccess(false);
  }, []);

  return {
    email,
    setEmail,
    otpCode,
    setOtpCode,
    rememberMe,
    setRememberMe,
    otpRequested,
    isLoading,
    error,
    successMessage,
    isSuccess,
    startOtpRequest,
    verifyOtpCode,
    resetOtpFlow,
    setErrorMessage: setError,
  };
};

