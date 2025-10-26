/**
 * 全局状态管理
 * 管理中草药识别app的全局状态，包括识别历史、当前识别结果等
 */
import { atom } from 'jotai';

// 中草药信息接口
export interface HerbInfo {
  id: string;
  name: string;
  scientificName: string;
  properties: string;
  functions: string[];
  usage: string;
  cautions: string[];
  image: string;
  description: string;
  category: string;
}

// 识别记录接口
export interface RecognitionRecord {
  id: string;
  timestamp: number;
  originalImage: string;
  result: HerbInfo | null;
  confidence: number;
}

// 当前识别结果
export const currentRecognitionAtom = atom<RecognitionRecord | null>(null);

// 识别历史记录
export const recognitionHistoryAtom = atom<RecognitionRecord[]>([]);

// 当前页面状态
export const currentPageAtom = atom<'home' | 'result' | 'history' | 'search' | 'detail' | 'test'>('test');

// 当前查看的中草药详情
export const currentHerbDetailAtom = atom<HerbInfo | null>(null);

// 搜索关键词
export const searchKeywordAtom = atom<string>('');

// 加载状态
export const isLoadingAtom = atom<boolean>(false);

// 添加新的导入
export * from './modelAtoms';