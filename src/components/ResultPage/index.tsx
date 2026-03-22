/**
 * 识别结果页面
 * 展示中草药识别结果和基本信息
 */
import React, { useState } from 'react';
import { ArrowLeft, Eye, BookOpen, AlertTriangle, TrendingUp, Zap, MessageCircle } from 'lucide-react';
import { useAtom } from 'jotai';
import { currentRecognitionAtom, currentPageAtom, currentHerbDetailAtom, currentPredictionAtom, detailBackTargetAtom } from '../../store/atoms';
import ModelVisualization from '../ModelVisualization';
import DataAugmentation from '../DataAugmentation';
import ModelFeedback from '../ModelFeedback';

const ResultPage: React.FC = () => {
  const [currentRecognition] = useAtom(currentRecognitionAtom);
  const [currentPrediction] = useAtom(currentPredictionAtom);
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [, setCurrentHerbDetail] = useAtom(currentHerbDetailAtom);
  const [, setDetailBackTarget] = useAtom(detailBackTargetAtom);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showDataAugmentation, setShowDataAugmentation] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!currentRecognition) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="glass-card text-center">
          <p className="page-subtitle mb-4">暂无识别结果</p>
          <button
            onClick={() => setCurrentPage('home')}
            className="btn-main px-6 py-2.5 rounded-xl"
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
      setDetailBackTarget('result');
      setCurrentPage('detail');
    }
  };

  const handleSpotlightMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  return (
    <div className="app-shell">
      {/* 头部导航 */}
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
              <h1 className="ml-3 page-title">识别结果</h1>
            </div>
            
            {/* AI功能切换按钮 */}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowVisualization(!showVisualization)}
                className={`btn-quiet ${showVisualization ? '!bg-emerald-100 !text-emerald-800 !border-emerald-300/70' : ''}`}
                title="可视化分析"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDataAugmentation(!showDataAugmentation)}
                className={`btn-quiet ${showDataAugmentation ? '!bg-cyan-100 !text-cyan-800 !border-cyan-300/70' : ''}`}
                title="数据增强"
              >
                <Zap className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowFeedback(!showFeedback)}
                className={`btn-quiet ${showFeedback ? '!bg-amber-100 !text-amber-800 !border-amber-300/70' : ''}`}
                title="反馈"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-end justify-between mb-4 reveal-up [animation-delay:70ms]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-800/70 mb-2">Inference Report</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {result ? result.name : '识别失败'}
            </h2>
            <p className="mt-1.5 text-slate-600">模型输出、结果解读与下一步操作</p>
          </div>
          <div className="glass-card-soft px-4 py-3 text-right">
            <p className="text-xs text-slate-500">匹配度</p>
            <p className="text-2xl font-bold text-slate-900">{Math.round(confidence * 100)}%</p>
          </div>
        </div>
      
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* 原始图片 */}
          <div
            className="glass-card interactive-spotlight reveal-up [animation-delay:100ms] xl:col-span-8"
            onMouseMove={handleSpotlightMove}
          >
            <h3 className="text-base font-semibold text-slate-800 mb-3">上传的图片</h3>
            <img
              src={originalImage}
              alt="上传的图片"
              className="w-full h-48 object-cover rounded-xl ring-1 ring-emerald-900/10"
            />
          </div>

          {/* AI性能指标 */}
          {currentPrediction && (
            <div
              className="glass-card interactive-spotlight reveal-up [animation-delay:140ms] xl:col-span-4"
              onMouseMove={handleSpotlightMove}
            >
              <h3 className="text-base font-semibold text-slate-800 mb-3">性能指标</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="glass-card-soft">
                  <p className="text-cyan-700 text-sm font-medium">处理时间</p>
                  <p className="text-cyan-900 text-lg font-bold">{currentPrediction.processingTime.toFixed(0)}ms</p>
                </div>
                <div className="glass-card-soft">
                  <p className="text-emerald-700 text-sm font-medium">置信度</p>
                  <p className="text-emerald-900 text-lg font-bold">{(currentPrediction.accuracy * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* AI功能面板 */}
          {showVisualization && (
            <div className="mb-1 xl:col-span-12 reveal-up [animation-delay:180ms]">
              <ModelVisualization />
            </div>
          )}
          
          {showDataAugmentation && (
            <div className="mb-1 xl:col-span-12 reveal-up [animation-delay:200ms]">
              <DataAugmentation originalImage={originalImage} />
            </div>
          )}
          
          {showFeedback && (
            <div className="mb-1 xl:col-span-12 reveal-up [animation-delay:220ms]">
              <ModelFeedback />
            </div>
          )}

          {result ? (
            <>
              {/* 识别结果卡片 */}
              <div
                className="glass-card interactive-spotlight reveal-up [animation-delay:240ms] xl:col-span-8"
                onMouseMove={handleSpotlightMove}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-slate-900">{result.name}</h2>
                  <div className="tag-chip px-3 py-1">
                    <span className="text-sm font-semibold">
                      {Math.round(confidence * 100)}% 匹配
                    </span>
                  </div>
                </div>
                
                <p className="text-slate-500 text-sm mb-4 italic">{result.scientificName}</p>
                
                <img
                  src={result.image}
                  alt={result.name}
                  className="w-full h-40 object-cover rounded-xl mb-4 ring-1 ring-emerald-900/10"
                />
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-slate-500 text-sm min-w-16">性味:</span>
                    <span className="text-slate-700 text-sm">
                      {result.properties}
                      {result.meridian ? `；归经：${result.meridian}` : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-slate-500 text-sm min-w-16">功效:</span>
                    <div className="flex flex-wrap gap-1">
                      {result.functions.map((func, index) => (
                        <span
                          key={index}
                          className="tag-chip"
                        >
                          {func}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-slate-500 text-sm min-w-16">用法:</span>
                    <span className="text-slate-700 text-sm">{result.usage}</span>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-4 space-y-4 reveal-up [animation-delay:280ms]">
                {/* 注意事项 */}
                <div
                  className="glass-card border-amber-200/70 bg-amber-50/65 interactive-spotlight"
                  onMouseMove={handleSpotlightMove}
                >
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                    <h3 className="text-amber-800 font-semibold">使用注意</h3>
                  </div>
                  <ul className="space-y-1">
                    {result.cautions.map((caution, index) => (
                      <li key={index} className="text-amber-800 text-sm">• {caution}</li>
                    ))}
                  </ul>
                </div>

                {/* 操作按钮 */}
                <div className="glass-card space-y-3">
                  <button
                    onClick={handleViewDetail}
                    className="btn-sub flex items-center justify-center py-3.5"
                  >
                    <BookOpen className="w-5 h-5 mr-2 text-cyan-800" />
                    <span className="font-medium">查看详情</span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="btn-main flex items-center justify-center py-3.5"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    <span className="font-medium">再次识别</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card text-center py-7 xl:col-span-12 reveal-up [animation-delay:240ms]">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">识别失败</h3>
              <p className="text-slate-600 mb-4">
                很抱歉，我们无法识别出这张图片中的中草药。请尝试：
              </p>
              <ul className="text-slate-600 text-sm space-y-1 mb-6 text-left">
                <li>• 确保图片清晰，光线充足</li>
                <li>• 拍摄角度正面，避免倾斜</li>
                <li>• 确保中草药在图片中央</li>
                <li>• 避免背景杂乱</li>
              </ul>
              <button
                onClick={() => setCurrentPage('home')}
                className="btn-main px-6 py-3 rounded-xl"
              >
                重新识别
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
