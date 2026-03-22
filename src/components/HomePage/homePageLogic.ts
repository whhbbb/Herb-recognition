/**
 * 主页逻辑处理
 * 处理图片上传、识别等核心业务逻辑
 */
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import toast from 'react-hot-toast';
import { 
  currentRecognitionAtom, 
  recognitionHistoryAtom, 
  currentPageAtom, 
  isLoadingAtom,
  currentPredictionAtom,
  modelPerformanceHistoryAtom,
  modelLoadingAtom,
  modelLoadedAtom
} from '../../store/atoms';
import { herbDatabase } from '../../data/herbDatabase';
import { RecognitionRecord } from '../../store/atoms';
import { resolveApiBaseUrl } from '../../utils/apiBase';

type InferPrediction = {
  herbId: string;
  confidence: number;
  herbName: string;
};

type InferResponse = {
  runDir: string;
  predictions: InferPrediction[];
  topPrediction: InferPrediction | null;
};

export const useHomePageLogic = () => {
  const [, setCurrentRecognition] = useAtom(currentRecognitionAtom);
  const [recognitionHistory, setRecognitionHistory] = useAtom(recognitionHistoryAtom);
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [, setIsLoading] = useAtom(isLoadingAtom);

  // 添加模型相关的原子
  const [, setCurrentPrediction] = useAtom(currentPredictionAtom);
  const [performanceHistory, setPerformanceHistory] = useAtom(modelPerformanceHistoryAtom);
  const [, setModelLoading] = useAtom(modelLoadingAtom);
  const [modelLoaded, setModelLoaded] = useAtom(modelLoadedAtom);

  // 初始化模型
  useEffect(() => {
    if (!modelLoaded) {
      initializeModel();
    }
  }, [modelLoaded]);

  const initializeModel = async () => {
    setModelLoading(true);
    try {
      const response = await fetch(`${resolveApiBaseUrl()}/infer/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      setModelLoaded(true);
    } catch (error) {
      console.error('后端识别服务连接失败:', error);
      toast.error('后端识别服务连接失败');
      setModelLoaded(false);
    } finally {
      setModelLoading(false);
    }
  };

  const processImage = async (file: File, imageData: string) => {
    try {
      setIsLoading(true);
      
      if (!modelLoaded) {
        toast.error('识别服务尚未就绪');
        return;
      }

      const start = performance.now();
      const form = new FormData();
      form.append('file', file);
      const response = await fetch(`${resolveApiBaseUrl()}/infer/predict?topK=5`, {
        method: 'POST',
        body: form,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const infer = (await response.json()) as InferResponse;

      if (!infer.predictions?.length) {
        throw new Error('未返回识别结果');
      }

      const bestPrediction = infer.predictions[0];
      const result = herbDatabase.find((herb) => herb.id === bestPrediction.herbId) || null;
      const processingTime = performance.now() - start;

      const modelMetrics = {
        accuracy: bestPrediction.confidence,
        processingTime,
        memoryUsage: 0,
        predictions: infer.predictions.map((p) => ({
          herbId: p.herbId,
          herbName: p.herbName,
          confidence: p.confidence,
          features: [],
        })),
      };

      const record: RecognitionRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        originalImage: imageData,
        result,
        confidence: bestPrediction.confidence,
      };

      setCurrentRecognition(record);
      setCurrentPrediction(modelMetrics);
      setRecognitionHistory((prev) => [record, ...prev]);
      setPerformanceHistory((prev) => [modelMetrics, ...prev]);
      setCurrentPage('result');

      if (result) {
        toast.success(`识别成功：${result.name} (${(bestPrediction.confidence * 100).toFixed(1)}%)`);
      } else {
        toast.success(`识别完成：${bestPrediction.herbName} (${(bestPrediction.confidence * 100).toFixed(1)}%)`);
      }
    } catch (error) {
      console.error('识别过程出错:', error);
      toast.error('识别过程出现错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageCapture = () => {
    // 这里实际上会通过文件输入触发
    console.log('准备拍照');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // 验证文件大小（限制10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片文件过大，请选择小于10MB的图片');
      return;
    }

    // 读取文件并转换为base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      void processImage(file, imageData);
    };
    reader.onerror = () => {
      toast.error('图片读取失败');
    };
    reader.readAsDataURL(file);

    // 清空input值，允许重复选择同一文件
    event.target.value = '';
  };

  return {
    handleImageCapture,
    handleFileSelect
  };
};
