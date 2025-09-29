export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId?: string; // Optional for non-member posts
  boardType: 'free-board' | 'hr-chat';
  createdAt: string;
  updatedAt?: string;
  views: number;
  isAnonymous: boolean;
}

export interface CommunityComment {
  id: string;
  postId: string;
  content: string;
  author: string;
  authorId?: string; // Optional for non-member comments
  createdAt: string;
  isAnonymous: boolean;
}

export interface BoardInfo {
  id: 'free-board' | 'hr-chat';
  name: string;
  description: string;
  icon: string;
}