export interface Enquiry {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}
