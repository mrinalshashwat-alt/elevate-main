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

type LoginPayload = {
  email: string;
  password: string;
  remember_me?: boolean;
};

type PasswordResetRequestPayload = {
  email: string;
};

type PasswordResetConfirmPayload = {
  email: string;
  otp: string;
  new_password: string;
};

export const signup = async (payload: SignupPayload) => {
  const { data } = await axiosInstance.post('/auth/signup/', payload, {
    transformRequest: [(data, headers) => {
      // Remove auth header for public endpoint
      delete headers.Authorization;
      headers['Content-Type'] = 'application/json';
      return JSON.stringify(data);
    }],
  });
  return data;
};

export const requestOtp = async (payload: RequestOtpPayload) => {
  const { data } = await axiosInstance.post('/auth/request-otp/', payload, {
    transformRequest: [(data, headers) => {
      // Remove auth header for public endpoint
      delete headers.Authorization;
      headers['Content-Type'] = 'application/json';
      return JSON.stringify(data);
    }],
  });
  return data;
};

export const verifyOtp = async (payload: VerifyOtpPayload) => {
  const { data } = await axiosInstance.post('/auth/verify-otp/', payload, {
    transformRequest: [(data, headers) => {
      // Remove auth header for public endpoint
      delete headers.Authorization;
      headers['Content-Type'] = 'application/json';
      return JSON.stringify(data);
    }],
  });
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

export const login = async (payload: LoginPayload) => {
  const { data } = await axiosInstance.post('/auth/login/', payload, {
    transformRequest: [(data, headers) => {
      // Remove auth header for public endpoint
      delete headers.Authorization;
      headers['Content-Type'] = 'application/json';
      return JSON.stringify(data);
    }],
  });
  return data;
};

export const requestPasswordReset = async (payload: PasswordResetRequestPayload) => {
  const { data } = await axiosInstance.post('/auth/password-reset/request/', payload, {
    transformRequest: [(data, headers) => {
      // Remove auth header for public endpoint
      delete headers.Authorization;
      headers['Content-Type'] = 'application/json';
      return JSON.stringify(data);
    }],
  });
  return data;
};

export const confirmPasswordReset = async (payload: PasswordResetConfirmPayload) => {
  const { data } = await axiosInstance.post('/auth/password-reset/confirm/', payload, {
    transformRequest: [(data, headers) => {
      // Remove auth header for public endpoint
      delete headers.Authorization;
      headers['Content-Type'] = 'application/json';
      return JSON.stringify(data);
    }],
  });
  return data;
};

// =====================================================
// Role Management APIs (Super Admin only)
// =====================================================

/**
 * Fetch all available roles in the system
 */
export const fetchAvailableRoles = async () => {
  const { data } = await axiosInstance.get('/auth/roles/');
  return data.roles || data || [];
};

/**
 * Assign a role to a user
 * @param userId - User UUID
 * @param roleName - Name of the role (e.g., "Super Admin", "Recruiter Admin")
 */
export const assignRole = async (userId: string, roleName: string) => {
  const { data } = await axiosInstance.post(`/auth/users/${userId}/assign-role/`, {
    role: roleName,
  });
  return data;
};

/**
 * Remove a role from a user
 * @param userId - User UUID
 * @param roleName - Name of the role to remove
 */
export const removeRole = async (userId: string, roleName: string) => {
  const { data } = await axiosInstance.post(`/auth/users/${userId}/remove-role/`, {
    role: roleName,
  });
  return data;
};

