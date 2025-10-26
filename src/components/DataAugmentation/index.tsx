/**
 * 数据增强预览组件
 * 展示图像数据增强的效果
 */
import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { RotateCw, Sun, FlipHorizontal, Zap } from 'lucide-react';
import { dataAugmentationResultsAtom } from '../../store/modelAtoms';
import { herbRecognitionModel } from '../../models/herbRecognitionModel';

interface DataAugmentationProps {
  originalImage: string | null;
}

const DataAugmentation: React.FC<DataAugmentationProps> = ({ originalImage }) => {
  const [augmentationResults, setAugmentationResults] = useAtom(dataAugmentationResultsAtom);
  const [isProcessing, setIsProcessing] = useState(false);
  const [augmentationTypes] = useState([
    { name: '原始图像', icon: Zap, description: '未经处理的原始图像' },
    { name: '水平翻转', icon: FlipHorizontal, description: '镜像翻转增强数据多样性' },
    { name: '旋转变换', icon: RotateCw, description: '小角度旋转模拟不同拍摄角度' },
    { name: '亮度调整', icon: Sun, description: '调整亮度适应不同光照条件' },
  ]);

  useEffect(() => {
    if (originalImage) {
      applyDataAugmentation();
    }
  }, [originalImage]);

  const applyDataAugmentation = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          const results = await herbRecognitionModel.applyDataAugmentation(img);
          setAugmentationResults(results);
        } catch (error) {
          console.error('数据增强处理失败:', error);
        } finally {
          setIsProcessing(false);
        }
      };
      
      img.onerror = () => {
        console.error('图片加载失败');
        setIsProcessing(false);
      };
      
      img.src = originalImage;
    } catch (error) {
      console.error('数据增强处理失败:', error);
      setIsProcessing(false);
    }
  };

  const downloadAugmentedImage = (canvas: HTMLCanvasElement, filename: string) => {
    try {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('下载图片失败:', error);
    }
  };

  if (!originalImage) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg text-center">
        <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">数据增强预览</h3>
        <p className="text-gray-500">请先上传图片以查看数据增强效果</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">数据增强预览</h3>
        <button
          onClick={applyDataAugmentation}
          disabled={isProcessing}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isProcessing ? '处理中...' : '重新处理'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {isProcessing ? (
          // 加载状态
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))
        ) : (
          // 增强结果
          augmentationResults.map((canvas, index) => {
            const augType = augmentationTypes[index];
            if (!augType) return null;
            
            const IconComponent = augType.icon;
            
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="relative group">
                  <img
                    src={canvas.toDataURL()}
                    alt={augType.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <button
                    onClick={() => downloadAugmentedImage(canvas, `${augType.name}.png`)}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center mb-2">
                  <IconComponent className="w-5 h-5 text-blue-500 mr-2" />
                  <h4 className="font-medium text-gray-800">{augType.name}</h4>
                </div>
                
                <p className="text-sm text-gray-600">{augType.description}</p>
              </div>
            );
          })
        )}
      </div>

      {augmentationResults.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">数据增强说明</h4>
          <p className="text-sm text-blue-700">
            数据增强技术通过对原始图像进行各种变换，增加训练数据的多样性，提高模型的泛化能力和鲁棒性。
            这些增强技术模拟了现实世界中的各种拍摄条件，帮助模型更好地适应不同的输入情况。
          </p>
        </div>
      )}
    </div>
  );
};

export default DataAugmentation;