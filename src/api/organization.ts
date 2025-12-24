import axiosInstance from './axiosInstance';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  org_type: 'company' | 'college' | 'platform';
  subscription_tier: string;
  max_seats: number;
  member_count: number;
  is_active: boolean;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  joined_at: string;
}

export const fetchOrganizations = async () => {
  const { data } = await axiosInstance.get('/organizations/');
  return data;
};

export const createOrganization = async (payload: {
  name: string;
  org_type: 'company' | 'college' | 'platform';
  subscription_tier?: string;
  max_seats?: number;
  max_assessments_per_month?: number;
  contact_email?: string;
  contact_phone?: string;
}) => {
  const { data } = await axiosInstance.post('/organizations/create/', payload);
  return data;
};

export const fetchOrganizationMembers = async (orgId: string) => {
  const { data } = await axiosInstance.get(`/organizations/${orgId}/members/`);
  return data;
};

export const addOrganizationMember = async (orgId: string, userId: string, role: string = 'member') => {
  const { data } = await axiosInstance.post(`/organizations/${orgId}/add-member/`, {
    user_id: userId,
    role,
  });
  return data;
};

export const removeOrganizationMember = async (orgId: string, userId: string) => {
  const { data } = await axiosInstance.delete(`/organizations/${orgId}/remove-member/${userId}/`);
  return data;
};

export const inviteOrganizationMember = async (orgId: string, email: string, role: string = 'member') => {
  const { data } = await axiosInstance.post(`/organizations/${orgId}/invite/`, {
    email,
    role,
  });
  return data;
};

export const bulkInviteOrganizationMembers = async (orgId: string, emails: string[], role: string = 'member') => {
  const { data } = await axiosInstance.post(`/organizations/${orgId}/bulk-invite/`, {
    emails,
    role,
  });
  return data;
};
