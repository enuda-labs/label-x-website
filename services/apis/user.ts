'use client';

import { AxiosClient } from '@/utils/axios';
import { UserData } from './auth';

const axiosClient = new AxiosClient();

/**
 * Fetch current user’s details (id, username, email, etc.)
 */
export const getUserDetails = async () => {
  const response = await axiosClient.get<{
    status: string;
    user: UserData;
  }>('/account/user/detail/');
  return response.data;
};

/**
 * Change only the username
 */
export const updateUsername = async (username: string) => {
  const response = await axiosClient.post<{ username: string }>(
    '/account/update-username/',
    { username }
  );
  return response.data;
};

/**
 * Change the user’s password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  const response = await axiosClient.post(
    '/account/change-password/',
    {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }
  );
  return response.data;
};
