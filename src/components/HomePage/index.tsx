/**
 * 主页组件
 * 提供拍照和上传图片功能，是中草药识别的入口页面
 */
import React, { useRef } from 'react';
import { Camera, Upload, History, Search, Leaf } from 'lucide-react';
import { useAtom } from 'jotai';
import { currentPageAtom, isLoadingAtom } from '../../store/atoms';
import { useHomePageLogic } from './homePageLogic';

const HomePage: React.FC = () => {
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [isLoading] = useAtom(isLoadingAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { handleImageCapture, handleFileSelect } = useHomePageLogic();

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto">
        {/* 头部 */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">中草药识别</h1>
          <p className="text-gray-600">拍照或上传图片，快速识别中草药</p>
        </div>

        {/* 主要功能区 */}
        <div className="space-y-4 mb-8">
          {/* 拍照识别 */}
          <button
            onClick={handleCameraClick}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
          >
            <Camera className="w-8 h-8 mx-auto mb-2" />
            <span className="text-lg font-semibold">拍照识别</span>
          </button>

          {/* 上传图片 */}
          <button
            onClick={handleUploadClick}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
          >
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <span className="text-lg font-semibold">上传图片</span>
          </button>
        </div>

        {/* 次要功能区 */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setCurrentPage('history')}
            className="bg-white text-gray-700 p-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <History className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <span className="text-sm font-medium">识别历史</span>
          </button>

          <button
            onClick={() => setCurrentPage('search')}
            className="bg-white text-gray-700 p-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Search className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <span className="text-sm font-medium">手动搜索</span>
          </button>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* 加载状态 */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">正在识别中草药...</p>
              <p className="text-gray-500 text-sm mt-2">请稍候</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
