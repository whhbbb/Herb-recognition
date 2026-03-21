/**
 * 历史记录页面
 * 展示用户的识别历史记录
 */
import React from 'react';
import { ArrowLeft, Clock, Trash2, Eye } from 'lucide-react';
import { useAtom } from 'jotai';
import { recognitionHistoryAtom, currentPageAtom, currentRecognitionAtom, currentHerbDetailAtom, detailBackTargetAtom } from '../../store/atoms';

const HistoryPage: React.FC = () => {
  const [recognitionHistory, setRecognitionHistory] = useAtom(recognitionHistoryAtom);
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [, setCurrentRecognition] = useAtom(currentRecognitionAtom);
  const [, setCurrentHerbDetail] = useAtom(currentHerbDetailAtom);
  const [, setDetailBackTarget] = useAtom(detailBackTargetAtom);

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
      setDetailBackTarget('history');
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

  const handleSpotlightMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  return (
    <div className="app-shell">
      <div className="page-wrap desktop-balance">
        <div className="glass-card mb-4 reveal-up [animation-delay:40ms]">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentPage('home')}
                className="btn-quiet"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="ml-3 page-title">识别历史</h1>
            </div>
            
            {recognitionHistory.length > 0 && (
              <button
                onClick={clearAllHistory}
                className="text-rose-500 text-sm hover:text-rose-600 transition-colors font-medium"
              >
                清空记录
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:flex items-end justify-between mb-4 reveal-up [animation-delay:70ms]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-800/70 mb-2">History Console</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">识别历史</h2>
            <p className="mt-1.5 text-slate-600">回溯识别记录并快速回到结果与详情</p>
          </div>
          <div className="glass-card-soft px-4 py-3 text-right">
            <p className="text-xs text-slate-500">总记录数</p>
            <p className="text-2xl font-bold text-slate-900">{recognitionHistory.length}</p>
          </div>
        </div>

        {recognitionHistory.length === 0 ? (
          <div className="glass-card py-8 text-center reveal-up [animation-delay:120ms]">
            <Clock className="w-14 h-14 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无识别记录</h3>
            <p className="text-slate-500 mb-6">开始识别中草药，记录会显示在这里</p>
            <button
              onClick={() => setCurrentPage('home')}
              className="btn-main px-6 py-3 rounded-xl inline-block w-auto"
            >
              开始识别
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            <section className="xl:col-span-8 grid grid-cols-1 xl:grid-cols-2 gap-3.5">
              {recognitionHistory.map((record, index) => {
                const { date, time } = formatDate(record.timestamp);
                
                return (
                  <div
                    key={record.id}
                    className="glass-card hover-lift interactive-spotlight reveal-up"
                    style={{ animationDelay: `${120 + (index % 8) * 45}ms` }}
                    onMouseMove={handleSpotlightMove}
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={record.originalImage}
                        alt="识别图片"
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0 ring-1 ring-emerald-900/10"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-800 truncate">
                            {record.result ? record.result.name : '识别失败'}
                          </h3>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center text-sm text-slate-500 mb-2">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{date} {time}</span>
                          {record.result && (
                            <span className="ml-2 tag-chip">
                              {Math.round(record.confidence * 100)}% 匹配
                            </span>
                          )}
                        </div>
                        
                        {record.result && (
                          <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                            {record.result.scientificName}
                          </p>
                        )}
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewResult(record)}
                            className="flex-1 btn-sub px-3 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4 mr-1 text-cyan-700" />
                            查看结果
                          </button>
                          
                          {record.result && (
                            <button
                              onClick={() => handleViewDetail(record)}
                              className="flex-1 btn-main px-3 py-1.5 rounded-lg text-sm font-medium"
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
            </section>

            <aside className="xl:col-span-4 xl:sticky xl:top-4 reveal-up [animation-delay:180ms]">
              <div className="glass-card space-y-4">
                <div className="glass-card-soft">
                  <p className="text-xs text-slate-500">记录总数</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{recognitionHistory.length}</p>
                </div>
                <div className="glass-card-soft">
                  <p className="text-xs text-slate-500">有识别结果</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {recognitionHistory.filter((item) => item.result).length}
                  </p>
                </div>
                <button
                  onClick={clearAllHistory}
                  className="w-full btn-sub text-rose-700 border-rose-200/70"
                >
                  清空全部记录
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
