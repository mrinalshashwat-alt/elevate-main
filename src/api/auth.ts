import axiosInstance from './axiosInstance';

type SignupPayload = {
  email: string;
  username: string;
  name?: string;
  password: string;
};

type RequestOtpPayload = {
  email: string;
  purpose?: string;
};

type VerifyOtpPayload = {
  email: string;
  otp: string;
  remember_me?: boolean;
  purpose?: string;
};

export const signup = async (payload: SignupPayload) => {
  const { data } = await axiosInstance.post('/auth/signup/', payload);
  return data;
};

export const requestOtp = async (payload: RequestOtpPayload) => {
  const { data } = await axiosInstance.post('/auth/request-otp/', payload);
  return data;
};

export const verifyOtp = async (payload: VerifyOtpPayload) => {
  const { data } = await axiosInstance.post('/auth/verify-otp/', payload);
  return data;
};

export const logout = async (token?: string) => {
  const body = token ? { token } : {};
  const { data } = await axiosInstance.post('/auth/logout/', body);
  return data;
};

export const fetchCurrentUser = async (token?: string) => {
  const config = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : undefined;

  const { data } = await axiosInstance.get('/auth/me/', config);
  return data;
};

