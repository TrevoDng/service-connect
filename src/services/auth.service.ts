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

  validateSecretCode: async (secretCode: string): Promise<{ isValid: boolean; assignedEmail: string; expireAt: string }> => {
    return api.post('/auth/employee/validate-registration-code', { secretCode });
  },

  verifyEmail: async (token: string): Promise<{ verified: boolean; message: string; role: string }> => {
    return api.get(`/auth/verify-email?token=${token}`);
  },

  resendVerification: async (email: string) => {
    return api.post('/auth/resend-verification', { email });
  },
};
