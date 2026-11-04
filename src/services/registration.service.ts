import { api } from './api.service';

export const registrationService = {
  submitRequest: async (data: {
    role: 'EMPLOYEE' | 'PROVIDER';
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    documents: string[];
  }): Promise<any> => {
    return api.post('/registration/submit', data);
  },
};