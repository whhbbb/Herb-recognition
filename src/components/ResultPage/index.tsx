/**
 * 识别结果页面
 * 展示中草药识别结果和基本信息
 */
import React, { useState } from 'react';
import { ArrowLeft, Eye, BookOpen, AlertTriangle, TrendingUp, Zap, MessageCircle } from 'lucide-react';
import { useAtom } from 'jotai';
import { currentRecognitionAtom, currentPageAtom, currentHerbDetailAtom, currentPredictionAtom } from '../../store/atoms';
import ModelVisualization from '../ModelVisualization';
import DataAugmentation from '../DataAugmentation';
import ModelFeedback from '../ModelFeedback';

const ResultPage: React.FC = () => {
  const [currentRecognition] = useAtom(currentRecognitionAtom);
  const [currentPrediction] = useAtom(currentPredictionAtom);
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [, setCurrentHerbDetail] = useAtom(currentHerbDetailAtom);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showDataAugmentation, setShowDataAugmentation] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!currentRecognition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">暂无识别结果</p>
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-green-500 text-white px-6 py-2 rounded-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const { result, confidence, originalImage } = currentRecognition;

  const handleViewDetail = () => {
    if (result) {
      setCurrentHerbDetail(result);
      setCurrentPage('detail');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* 头部导航 */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setCurrentPage('home')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="ml-3 text-lg font-semibold text-gray-800">AI识别结果</h1>
        </div>
        
        {/* AI功能切换按钮 */}
        <div className="flex space-x-2">
          <button
            onClick={() => setShowVisualization(!showVisualization)}
            className={`p-2 rounded-lg transition-colors ${
              showVisualization ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowDataAugmentation(!showDataAugmentation)}
            className={`p-2 rounded-lg transition-colors ${
              showDataAugmentation ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Zap className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className={`p-2 rounded-lg transition-colors ${
              showFeedback ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* 原始图片 */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">上传的图片</h3>
          <img
            src={originalImage}
            alt="上传的图片"
            className="w-full h-48 object-cover rounded-xl"
          />
        </div>

        {/* AI功能面板 */}
        {showVisualization && (
          <div className="mb-6">
            <ModelVisualization />
          </div>
        )}
        
        {showDataAugmentation && (
          <div className="mb-6">
            <DataAugmentation originalImage={originalImage} />
          </div>
        )}
        
        {showFeedback && (
          <div className="mb-6">
            <ModelFeedback />
          </div>
        )}

        {/* AI性能指标 */}
        {currentPrediction && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">AI性能指标</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-blue-600 text-sm font-medium">处理时间</p>
                <p className="text-blue-800 text-lg font-bold">{currentPrediction.processingTime.toFixed(0)}ms</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-green-600 text-sm font-medium">置信度</p>
                <p className="text-green-800 text-lg font-bold">{(currentPrediction.accuracy * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {result ? (
          <>
            {/* 识别结果卡片 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{result.name}</h2>
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  <span className="text-green-700 text-sm font-medium">
                    {Math.round(confidence * 100)}% 匹配
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 italic">{result.scientificName}</p>
              
              <img
                src={result.image}
                alt={result.name}
                className="w-full h-40 object-cover rounded-xl mb-4"
              />
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-gray-500 text-sm min-w-16">性味:</span>
                  <span className="text-gray-700 text-sm">{result.properties}</span>
                </div>
                
                <div className="flex items-start">
                  <span className="text-gray-500 text-sm min-w-16">功效:</span>
                  <div className="flex flex-wrap gap-1">
                    {result.functions.map((func, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                      >
                        {func}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-gray-500 text-sm min-w-16">用法:</span>
                  <span className="text-gray-700 text-sm">{result.usage}</span>
                </div>
              </div>
            </div>

            {/* 注意事项 */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                <h3 className="text-orange-700 font-semibold">使用注意</h3>
              </div>
              <ul className="space-y-1">
                {result.cautions.map((caution, index) => (
                  <li key={index} className="text-orange-700 text-sm">• {caution}</li>
                ))}
              </ul>
            </div>

            {/* 操作按钮 */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleViewDetail}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                <span className="font-medium">查看详情</span>
              </button>
              
              <button
                onClick={() => setCurrentPage('home')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
              >
                <Eye className="w-5 h-5 mr-2" />
                <span className="font-medium">再次识别</span>
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">识别失败</h3>
            <p className="text-gray-600 mb-4">
              很抱歉，我们无法识别出这张图片中的中草药。请尝试：
            </p>
            <ul className="text-gray-600 text-sm space-y-1 mb-6 text-left">
              <li>• 确保图片清晰，光线充足</li>
              <li>• 拍摄角度正面，避免倾斜</li>
              <li>• 确保中草药在图片中央</li>
              <li>• 避免背景杂乱</li>
            </ul>
            <button
              onClick={() => setCurrentPage('home')}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              重新识别
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;