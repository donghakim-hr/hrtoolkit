import fs from 'fs';
import path from 'path';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  legal: string;
}

export interface FaqCategory {
  id: string;
  category: string;
  icon: string;
  color: string;
  bgColor: string;
  items: FaqItem[];
}

const FAQ_FILE_PATH = path.join(process.cwd(), 'src/data/faq.json');

export function readFaq(): FaqCategory[] {
  try {
    const data = fs.readFileSync(FAQ_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading FAQ data:', error);
    return [];
  }
}

export function writeFaq(faqData: FaqCategory[]): void {
  try {
    fs.writeFileSync(FAQ_FILE_PATH, JSON.stringify(faqData, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing FAQ data:', error);
    throw error;
  }
}

export function createFaqItem(categoryId: string, item: Omit<FaqItem, 'id'>): FaqItem {
  const faqData = readFaq();
  const category = faqData.find(cat => cat.id === categoryId);

  if (!category) {
    throw new Error('Category not found');
  }

  const newId = `${categoryId}-${Date.now()}`;
  const newItem: FaqItem = {
    id: newId,
    ...item
  };

  category.items.push(newItem);
  writeFaq(faqData);

  return newItem;
}

export function updateFaqItem(categoryId: string, itemId: string, updates: Partial<Omit<FaqItem, 'id'>>): FaqItem {
  const faqData = readFaq();
  const category = faqData.find(cat => cat.id === categoryId);

  if (!category) {
    throw new Error('Category not found');
  }

  const itemIndex = category.items.findIndex(item => item.id === itemId);
  if (itemIndex === -1) {
    throw new Error('FAQ item not found');
  }

  category.items[itemIndex] = { ...category.items[itemIndex], ...updates };
  writeFaq(faqData);

  return category.items[itemIndex];
}

export function deleteFaqItem(categoryId: string, itemId: string): boolean {
  const faqData = readFaq();
  const category = faqData.find(cat => cat.id === categoryId);

  if (!category) {
    throw new Error('Category not found');
  }

  const itemIndex = category.items.findIndex(item => item.id === itemId);
  if (itemIndex === -1) {
    throw new Error('FAQ item not found');
  }

  category.items.splice(itemIndex, 1);
  writeFaq(faqData);

  return true;
}

export function createFaqCategory(category: Omit<FaqCategory, 'id' | 'items'>): FaqCategory {
  const faqData = readFaq();

  const newId = `category-${Date.now()}`;
  const newCategory: FaqCategory = {
    id: newId,
    ...category,
    items: []
  };

  faqData.push(newCategory);
  writeFaq(faqData);

  return newCategory;
}

export function updateFaqCategory(categoryId: string, updates: Partial<Omit<FaqCategory, 'id' | 'items'>>): FaqCategory {
  const faqData = readFaq();
  const categoryIndex = faqData.findIndex(cat => cat.id === categoryId);

  if (categoryIndex === -1) {
    throw new Error('Category not found');
  }

  faqData[categoryIndex] = { ...faqData[categoryIndex], ...updates };
  writeFaq(faqData);

  return faqData[categoryIndex];
}

export function deleteFaqCategory(categoryId: string): boolean {
  const faqData = readFaq();
  const categoryIndex = faqData.findIndex(cat => cat.id === categoryId);

  if (categoryIndex === -1) {
    throw new Error('Category not found');
  }

  faqData.splice(categoryIndex, 1);
  writeFaq(faqData);

  return true;
}