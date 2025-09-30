import fs from 'fs';
import path from 'path';
import { Inquiry } from '@/types/inquiry';

const INQUIRY_FILE_PATH = path.join(process.cwd(), 'src/data/inquiries.json');

export function readInquiries(): Inquiry[] {
  try {
    const data = fs.readFileSync(INQUIRY_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading inquiries:', error);
    return [];
  }
}

export function writeInquiries(inquiries: Inquiry[]): void {
  try {
    fs.writeFileSync(INQUIRY_FILE_PATH, JSON.stringify(inquiries, null, 2));
  } catch (error) {
    console.error('Error writing inquiries:', error);
    throw new Error('Failed to save inquiry data');
  }
}

export function createInquiry(inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt'>): Inquiry {
  const inquiries = readInquiries();
  const newId = Date.now().toString();
  const now = new Date().toISOString();

  const newInquiry: Inquiry = {
    id: newId,
    ...inquiryData,
    createdAt: now,
    updatedAt: now,
  };

  inquiries.push(newInquiry);
  writeInquiries(inquiries);

  return newInquiry;
}

export function getInquiryById(id: string): Inquiry | null {
  const inquiries = readInquiries();
  return inquiries.find(inquiry => inquiry.id === id) || null;
}

export function updateInquiry(id: string, updates: Partial<Omit<Inquiry, 'id' | 'createdAt'>>): Inquiry | null {
  const inquiries = readInquiries();
  const index = inquiries.findIndex(inquiry => inquiry.id === id);

  if (index === -1) {
    return null;
  }

  const updatedInquiry = {
    ...inquiries[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  inquiries[index] = updatedInquiry;
  writeInquiries(inquiries);

  return updatedInquiry;
}

export function deleteInquiry(id: string): boolean {
  const inquiries = readInquiries();
  const filteredInquiries = inquiries.filter(inquiry => inquiry.id !== id);

  if (filteredInquiries.length === inquiries.length) {
    return false; // No inquiry was deleted
  }

  writeInquiries(filteredInquiries);
  return true;
}

export function getInquiriesByUserId(userId: string): Inquiry[] {
  const inquiries = readInquiries();
  return inquiries.filter(inquiry => inquiry.userId === userId);
}

export function getInquiriesByStatus(status: Inquiry['status']): Inquiry[] {
  const inquiries = readInquiries();
  return inquiries.filter(inquiry => inquiry.status === status);
}