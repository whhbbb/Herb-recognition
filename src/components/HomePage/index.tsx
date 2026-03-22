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
  const sceneRef = useRef<HTMLDivElement>(null);
  
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

  const handleDesktopMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    event.currentTarget.style.setProperty('--dx', `${dx}px`);
    event.currentTarget.style.setProperty('--dy', `${dy}px`);
  };

  const resetDesktopMove = (event: React.MouseEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--dx', '0px');
    event.currentTarget.style.setProperty('--dy', '0px');
  };

  const handleSceneMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const sx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const sy = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    sceneRef.current.style.setProperty('--bgx', `${x}%`);
    sceneRef.current.style.setProperty('--bgy', `${y}%`);
    sceneRef.current.style.setProperty('--sx', `${sx}`);
    sceneRef.current.style.setProperty('--sy', `${sy}`);
  };

  const resetSceneMove = () => {
    if (!sceneRef.current) return;
    sceneRef.current.style.setProperty('--bgx', '50%');
    sceneRef.current.style.setProperty('--bgy', '40%');
    sceneRef.current.style.setProperty('--sx', '0');
    sceneRef.current.style.setProperty('--sy', '0');
  };

  return (
    <div
      ref={sceneRef}
      className="app-shell relative overflow-hidden home-scene"
      onMouseMove={handleSceneMove}
      onMouseLeave={resetSceneMove}
    >
      <div className="home-bg-interactive pointer-events-none absolute inset-0" />
      <div className="home-bg-orb home-bg-orb-1 pointer-events-none absolute" />
      <div className="home-bg-orb home-bg-orb-2 pointer-events-none absolute" />
      <div className="home-bg-orb home-bg-orb-3 pointer-events-none absolute" />

      <div className="page-wrap desktop-balance">
        {/* Mobile */}
        <div className="lg:hidden min-h-[calc(100svh-2rem)] flex flex-col justify-center">
          <div className="reveal-up [animation-delay:40ms]">
            <div className="glass-card text-center mb-6 pt-6 pb-6">
              <div className="icon-pill mx-auto mb-4">
                <Leaf className="w-7 h-7 text-emerald-800" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">中草药识别</h1>
              <p className="page-subtitle">一拍即识，快速可靠。</p>
            </div>

            <div className="grid grid-cols-1 gap-3.5 mb-6">
              <button
                onClick={handleCameraClick}
                disabled={isLoading}
                className="btn-main hover-lift disabled:opacity-60 disabled:transform-none"
              >
                <Camera className="w-7 h-7 mx-auto mb-2" />
                <span className="text-lg font-semibold">拍照识别</span>
              </button>

              <button
                onClick={handleUploadClick}
                disabled={isLoading}
                className="btn-sub hover-lift disabled:opacity-60 disabled:transform-none"
              >
                <Upload className="w-7 h-7 mx-auto mb-2" />
                <span className="text-lg font-semibold">上传图片</span>
              </button>
            </div>
          </div>
          <div className="space-y-3.5 reveal-up [animation-delay:140ms]">
            <div className="grid grid-cols-2 gap-3.5">
              <button
                onClick={() => setCurrentPage('history')}
                className="glass-card-soft hover-lift text-slate-700"
              >
                <History className="w-6 h-6 mx-auto mb-2 text-emerald-700" />
                <span className="text-sm font-medium">识别历史</span>
              </button>

              <button
                onClick={() => setCurrentPage('search')}
                className="glass-card-soft hover-lift text-slate-700"
              >
                <Search className="w-6 h-6 mx-auto mb-2 text-cyan-700" />
                <span className="text-sm font-medium">手动搜索</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div
          className="hidden lg:grid min-h-[calc(100vh-2rem)] grid-cols-12 gap-6 items-center parallax-stage"
          onMouseMove={handleDesktopMove}
          onMouseLeave={resetDesktopMove}
        >
          <section className="col-span-7 reveal-up [animation-delay:30ms] parallax-hero">
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="icon-pill">
                <Leaf className="w-7 h-7 text-emerald-800" />
              </div>
              <p className="uppercase tracking-[0.28em] text-xs text-emerald-800/70">Herb Vision Studio</p>
            </div>

            <h1 className="text-5xl xl:text-6xl leading-[1.06] font-extrabold tracking-tight text-slate-900 max-w-2xl">
              一拍即识，草药即现
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed">
              以专业影像识别流程为参考，重构中草药识别的交互节奏。
              <br />
              从拍摄到结果解读，尽量减少干扰，让每一步都直观、可信、可回看。
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
              <button
                onClick={() => setCurrentPage('history')}
                className="glass-card-soft hover-lift text-slate-700"
              >
                <History className="w-5 h-5 mx-auto mb-2 text-emerald-700" />
                <span className="text-sm font-medium">识别历史</span>
              </button>
              <button
                onClick={() => setCurrentPage('search')}
                className="glass-card-soft hover-lift text-slate-700"
              >
                <Search className="w-5 h-5 mx-auto mb-2 text-cyan-700" />
                <span className="text-sm font-medium">手动搜索</span>
              </button>
            </div>
          </section>

          <section className="col-span-5 reveal-up [animation-delay:120ms] parallax-panel">
            <div className="glass-card p-6">
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Quick Start</p>
                <p className="text-sm text-slate-700 mt-1">选择一种方式开始识别</p>
              </div>
              <div className="space-y-3.5">
                <button
                  onClick={handleCameraClick}
                  disabled={isLoading}
                  className="btn-main hover-lift disabled:opacity-60 disabled:transform-none"
                >
                  <Camera className="w-7 h-7 mx-auto mb-2" />
                  <span className="text-lg font-semibold">拍照识别</span>
                </button>
                <button
                  onClick={handleUploadClick}
                  disabled={isLoading}
                  className="btn-sub hover-lift disabled:opacity-60 disabled:transform-none"
                >
                  <Upload className="w-7 h-7 mx-auto mb-2" />
                  <span className="text-lg font-semibold">上传图片</span>
                </button>
              </div>
            </div>
          </section>
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
          <div className="fixed inset-0 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="glass-card w-full max-w-xs text-center py-7">
              <div className="w-11 h-11 border-[3px] border-emerald-500/80 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-800 font-semibold">正在识别中草药...</p>
              <p className="text-slate-500 text-sm mt-1">请稍候</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
