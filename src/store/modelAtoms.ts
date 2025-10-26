/**
 * 模型相关的全局状态管理
 * 管理TensorFlow模型的状态和预测结果
 */
import { atom } from 'jotai';
import { ModelMetrics, ModelPrediction } from '../models/herbRecognitionModel';

// 模型加载状态
export const modelLoadingAtom = atom<boolean>(false);
export const modelLoadedAtom = atom<boolean>(false);

// 当前预测结果
export const currentPredictionAtom = atom<ModelMetrics | null>(null);

// 模型性能历史
export const modelPerformanceHistoryAtom = atom<ModelMetrics[]>([]);

// 数据增强结果
export const dataAugmentationResultsAtom = atom<HTMLCanvasElement[]>([]);

// 用户反馈数据
export interface UserFeedback {
  id: string;
  timestamp: number;
  predictionId: string;
  actualHerbName: string;
  predictedHerbName: string;
  isCorrect: boolean;
  confidence: number;
  userRating: number; // 1-5 星评分
  comments?: string;
}

export const userFeedbackAtom = atom<UserFeedback[]>([]);

// 模型统计信息
export const modelStatsAtom = atom((get) => {
  const performanceHistory = get(modelPerformanceHistoryAtom);
  const feedbacks = get(userFeedbackAtom);
  
  if (performanceHistory.length === 0) {
    return {
      averageAccuracy: 0,
      averageProcessingTime: 0,
      totalPredictions: 0,
      userSatisfaction: 0,
      correctPredictions: 0,
    };
  }

  const totalPredictions = performanceHistory.length;
  const averageAccuracy = performanceHistory.reduce((sum, p) => sum + p.accuracy, 0) / totalPredictions;
  const averageProcessingTime = performanceHistory.reduce((sum, p) => sum + p.processingTime, 0) / totalPredictions;
  
  const correctPredictions = feedbacks.filter(f => f.isCorrect).length;
  const userSatisfaction = feedbacks.length > 0 
    ? feedbacks.reduce((sum, f) => sum + f.userRating, 0) / feedbacks.length 
    : 0;

  return {
    averageAccuracy,
    averageProcessingTime,
    totalPredictions,
    userSatisfaction,
    correctPredictions,
  };
});
