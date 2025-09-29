import fs from 'fs';
import path from 'path';
import { Notice } from '@/types';

const NOTICES_FILE_PATH = path.join(process.cwd(), 'src/data/notices.json');

export async function getNotices(): Promise<Notice[]> {
  try {
    const fileContent = await fs.promises.readFile(NOTICES_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent) as Notice[];
  } catch (error) {
    console.error('공지사항을 읽는 중 오류:', error);
    return [];
  }
}

export async function saveNotices(notices: Notice[]): Promise<void> {
  try {
    const sortedNotices = notices.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    await fs.promises.writeFile(
      NOTICES_FILE_PATH,
      JSON.stringify(sortedNotices, null, 2),
      'utf-8'
    );
  } catch (error) {
    console.error('공지사항을 저장하는 중 오류:', error);
    throw new Error('공지사항 저장에 실패했습니다.');
  }
}

export async function addNotice(notice: Omit<Notice, 'id'>): Promise<Notice> {
  const notices = await getNotices();
  const newId = Math.max(0, ...notices.map(n => n.id)) + 1;

  const newNotice: Notice = {
    ...notice,
    id: newId,
    date: notice.date || new Date().toISOString().split('T')[0]
  };

  notices.push(newNotice);
  await saveNotices(notices);

  return newNotice;
}

export async function updateNotice(id: number, updates: Partial<Notice>): Promise<Notice | null> {
  const notices = await getNotices();
  const index = notices.findIndex(n => n.id === id);

  if (index === -1) return null;

  notices[index] = { ...notices[index], ...updates };
  await saveNotices(notices);

  return notices[index];
}

export async function deleteNotice(id: number): Promise<boolean> {
  const notices = await getNotices();
  const filteredNotices = notices.filter(n => n.id !== id);

  if (filteredNotices.length === notices.length) return false;

  await saveNotices(filteredNotices);
  return true;
}