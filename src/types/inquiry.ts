export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  content: string;
  isRegistered: boolean;
  userId?: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  adminReply?: string;
  adminReplyAt?: string;
}

export interface CreateInquiryRequest {
  name: string;
  email: string;
  subject: string;
  content: string;
}