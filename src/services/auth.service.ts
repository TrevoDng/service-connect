import { api } from './api.service';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'client' | 'employee' | 'admin';
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return api.post('/auth/login', { email, password });
  },

  register: async (data: any) => {
    return api.post('/auth/register', data);
  },

  logout: async () => {
    return api.post('/auth/logout', {});
  },

  verifyEmail: async (code: string) => {
    return api.post('/auth/verify-email', { code });
  },

  resendVerification: async (email: string) => {
    return api.post('/auth/resend-verification', { email });
  },
};
