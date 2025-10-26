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
import { herbRecognitionModel } from '../../models/herbRecognitionModel';
import { RecognitionRecord } from '../../store/atoms';

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
      const success = await herbRecognitionModel.loadModel();
      setModelLoaded(success);
      if (success) {
        toast.success('AI识别模型加载成功');
      }
    } catch (error) {
      console.error('AI模型加载失败:', error);
      toast.error('AI模型加载失败');
    } finally {
      setModelLoading(false);
    }
  };

  const processImage = async (imageData: string) => {
    try {
      setIsLoading(true);
      
      if (!modelLoaded) {
        toast.error('AI模型尚未加载完成');
        return;
      }

      // 创建图像元素用于AI识别
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          // 使用TensorFlow模型进行识别
          const modelMetrics = await herbRecognitionModel.predict(img);
          
          // 获取最佳预测结果
          const bestPrediction = modelMetrics.predictions[0];
          const result = herbDatabase.find(herb => herb.id === bestPrediction.herbId);
          
          // 创建识别记录
          const record: RecognitionRecord = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            originalImage: imageData,
            result,
            confidence: bestPrediction.confidence
          };

          // 更新状态
          setCurrentRecognition(record);
          setCurrentPrediction(modelMetrics);
          setRecognitionHistory(prev => [record, ...prev]);
          setPerformanceHistory(prev => [modelMetrics, ...prev]);
          
          // 跳转到结果页面
          setCurrentPage('result');
          
          if (result) {
            toast.success(`AI识别成功：${result.name} (${(bestPrediction.confidence * 100).toFixed(1)}%)`);
          } else {
            toast.error('识别失败，请尝试其他图片');
          }
        } catch (error) {
          console.error('AI识别过程出错:', error);
          toast.error('AI识别过程出现错误');
        }
      };
      
      img.onerror = () => {
        toast.error('图片加载失败');
        setIsLoading(false);
      };
      
      img.src = imageData;
    } catch (error) {
      console.error('识别过程出错:', error);
      toast.error('识别过程出现错误');
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
      processImage(imageData);
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