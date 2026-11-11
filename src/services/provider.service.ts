import { api } from './api.service';

export interface PublicProviderProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  serviceType?: string;
  registrationNumber?: string;
  createdAt: string;
  status: string;
}

export const providerService = {
  getPublicProfile: async (id: string): Promise<PublicProviderProfile> => {
    const res = await api.get<{ provider: PublicProviderProfile }>(`/services/provider-profile/${id}`);
    return res.provider;
  },
};