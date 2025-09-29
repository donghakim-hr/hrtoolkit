import fs from 'fs';
import path from 'path';
import { CommunityPost, CommunityComment, BoardInfo } from '@/types/community';

const postsFilePath = path.join(process.cwd(), 'src/data/community-posts.json');

// Board configurations
export const boardConfigs: BoardInfo[] = [
  {
    id: 'free-board',
    name: '자유게시판',
    description: '자유롭게 이야기를 나누는 공간입니다',
    icon: '💬'
  },
  {
    id: 'hr-chat',
    name: 'HR수다',
    description: 'HR 업무와 관련된 이야기를 나누는 공간입니다',
    icon: '👥'
  }
];

// Read posts from file
export function readPosts(): CommunityPost[] {
  try {
    if (!fs.existsSync(postsFilePath)) {
      return [];
    }
    const data = fs.readFileSync(postsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading posts:', error);
    return [];
  }
}

// Write posts to file
export function writePosts(posts: CommunityPost[]): void {
  try {
    fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error('Error writing posts:', error);
    throw error;
  }
}

// Get posts by board type
export function getPostsByBoard(boardType: 'free-board' | 'hr-chat'): CommunityPost[] {
  const posts = readPosts();
  return posts
    .filter(post => post.boardType === boardType)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Get single post by ID
export function getPostById(id: string): CommunityPost | null {
  const posts = readPosts();
  return posts.find(post => post.id === id) || null;
}

// Create new post
export function createPost(postData: Omit<CommunityPost, 'id' | 'createdAt' | 'views'>): CommunityPost {
  const posts = readPosts();
  const newPost: CommunityPost = {
    id: Date.now().toString(),
    ...postData,
    createdAt: new Date().toISOString(),
    views: 0
  };

  posts.push(newPost);
  writePosts(posts);
  return newPost;
}

// Update post views
export function incrementPostViews(id: string): boolean {
  const posts = readPosts();
  const postIndex = posts.findIndex(post => post.id === id);

  if (postIndex === -1) {
    return false;
  }

  posts[postIndex].views += 1;
  writePosts(posts);
  return true;
}

// Generate anonymous author name
export function generateAnonymousName(): string {
  const adjectives = ['익명의', '친절한', '열정적인', '성실한', '진지한', '활발한'];
  const nouns = ['HR담당자', '신입사원', '선배', '동료', '전문가', '지원자'];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;

  return `${adjective} ${noun}${number}`;
}