/**
 * 历史记录页面
 * 展示用户的识别历史记录
 */
import React from 'react';
import { ArrowLeft, Clock, Trash2, Eye } from 'lucide-react';
import { useAtom } from 'jotai';
import { recognitionHistoryAtom, currentPageAtom, currentRecognitionAtom, currentHerbDetailAtom } from '../../store/atoms';

const HistoryPage: React.FC = () => {
  const [recognitionHistory, setRecognitionHistory] = useAtom(recognitionHistoryAtom);
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [, setCurrentRecognition] = useAtom(currentRecognitionAtom);
  const [, setCurrentHerbDetail] = useAtom(currentHerbDetailAtom);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('zh-CN'),
      time: date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleViewResult = (record: any) => {
    setCurrentRecognition(record);
    setCurrentPage('result');
  };

  const handleViewDetail = (record: any) => {
    if (record.result) {
      setCurrentHerbDetail(record.result);
      setCurrentPage('detail');
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    setRecognitionHistory(prev => prev.filter(record => record.id !== recordId));
  };

  const clearAllHistory = () => {
    if (window.confirm('确定要清空所有历史记录吗？')) {
      setRecognitionHistory([]);
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
          <h1 className="ml-3 text-lg font-semibold text-gray-800">识别历史</h1>
        </div>
        
        {recognitionHistory.length > 0 && (
          <button
            onClick={clearAllHistory}
            className="text-red-500 text-sm hover:text-red-600 transition-colors"
          >
            清空记录
          </button>
        )}
      </div>

      <div className="p-4 max-w-md mx-auto">
        {recognitionHistory.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">暂无识别记录</h3>
            <p className="text-gray-500 mb-6">开始识别中草药，记录会显示在这里</p>
            <button
              onClick={() => setCurrentPage('home')}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              开始识别
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recognitionHistory.map((record) => {
              const { date, time } = formatDate(record.timestamp);
              
              return (
                <div key={record.id} className="bg-white rounded-2xl shadow-lg p-4">
                  <div className="flex items-start space-x-4">
                    {/* 图片缩略图 */}
                    <img
                      src={record.originalImage}
                      alt="识别图片"
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    {/* 内容区 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {record.result ? record.result.name : '识别失败'}
                        </h3>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{date} {time}</span>
                        {record.result && (
                          <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                            {Math.round(record.confidence * 100)}% 匹配
                          </span>
                        )}
                      </div>
                      
                      {record.result && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {record.result.scientificName}
                        </p>
                      )}
                      
                      {/* 操作按钮 */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewResult(record)}
                          className="flex-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          查看结果
                        </button>
                        
                        {record.result && (
                          <button
                            onClick={() => handleViewDetail(record)}
                            className="flex-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                          >
                            详细信息
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
