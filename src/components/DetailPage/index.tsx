/**
 * 中草药详情页面
 * 展示中草药的详细信息
 */
import React from 'react';
import { ArrowLeft, Tag, Book, AlertCircle, Package } from 'lucide-react';
import { useAtom } from 'jotai';
import { currentHerbDetailAtom, currentPageAtom, detailBackTargetAtom } from '../../store/atoms';

const DetailPage: React.FC = () => {
  const [currentHerbDetail] = useAtom(currentHerbDetailAtom);
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [detailBackTarget] = useAtom(detailBackTargetAtom);

  if (!currentHerbDetail) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="glass-card text-center">
          <p className="page-subtitle mb-4">暂无详情信息</p>
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

  const herb = currentHerbDetail;
  const canBackToResult = detailBackTarget === 'result';

  const handleSpotlightMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  return (
    <div className="app-shell lg:flex lg:items-center">
      {/* 头部导航 */}
      <div className="page-wrap desktop-balance w-full lg:py-8">
        <div className="glass-card mb-4 reveal-up [animation-delay:40ms]">
          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage(detailBackTarget)}
              className="btn-quiet"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="ml-3 page-title">详细信息</h1>
          </div>
        </div>

        <div className="hidden lg:flex items-end justify-between mb-4 reveal-up [animation-delay:70ms]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-800/70 mb-2">Herb Profile</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{herb.name}</h2>
            <p className="mt-1.5 text-slate-600">{herb.scientificName}</p>
          </div>
          <div className="glass-card-soft px-4 py-3 text-right">
            <p className="text-xs text-slate-500">分类</p>
            <p className="text-lg font-bold text-slate-900">{herb.category}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          <div className="xl:col-span-5">
            {/* 头部信息 */}
            <div
              className="glass-card mb-4 interactive-spotlight reveal-up [animation-delay:100ms]"
              onMouseMove={handleSpotlightMove}
            >
              <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{herb.name}</h1>
                <p className="text-slate-500 italic">{herb.scientificName}</p>
                <div className="inline-flex items-center tag-chip px-3 py-1 mt-2">
                  <Tag className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">{herb.category}</span>
                </div>
              </div>
              
              <img
                src={herb.image}
                alt={herb.name}
                className="w-full h-48 object-cover rounded-xl mb-4 ring-1 ring-emerald-900/10"
              />
              
              <p className="text-slate-700 text-sm leading-relaxed">{herb.description}</p>
            </div>

          </div>

          <div className="xl:col-span-7">
            {/* 基本信息 */}
            <div
              className="glass-card mb-4 interactive-spotlight reveal-up [animation-delay:180ms]"
              onMouseMove={handleSpotlightMove}
            >
              <div className="flex items-center mb-4">
                <Book className="w-5 h-5 text-cyan-700 mr-2" />
                <h2 className="text-lg font-semibold text-slate-800">基本信息</h2>
              </div>
              
              <div className="space-y-4">
                <div className="border-l-4 border-cyan-600/60 pl-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">性味归经</h3>
                  <p className="text-slate-600">
                    {herb.properties}
                    {herb.meridian ? `；归经：${herb.meridian}` : ''}
                  </p>
                </div>
                
                <div className="border-l-4 border-emerald-600/60 pl-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">主要功效</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {herb.functions.map((func, index) => (
                      <span
                        key={index}
                        className="tag-chip text-sm px-3 py-1"
                      >
                        {func}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="border-l-4 border-amber-600/60 pl-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">用法用量</h3>
                  <div className="flex items-center">
                    <Package className="w-4 h-4 text-amber-700 mr-2" />
                    <p className="text-slate-600">{herb.usage}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 注意事项 */}
            <div
              className="glass-card border-rose-200/70 bg-rose-50/65 mb-4 interactive-spotlight reveal-up [animation-delay:220ms]"
              onMouseMove={handleSpotlightMove}
            >
              <div className="flex items-center mb-4">
                <AlertCircle className="w-5 h-5 text-rose-500 mr-2" />
                <h2 className="text-lg font-semibold text-rose-700">使用禁忌</h2>
              </div>
              
              <div className="space-y-2">
                {herb.cautions.map((caution, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-rose-700 text-sm">{caution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card-soft border border-slate-200/70 mb-4 reveal-up [animation-delay:240ms]">
          <p className="text-slate-700 text-sm leading-relaxed">
            温馨提示：本信息仅供参考学习，不能替代专业医疗建议。使用中草药前请咨询专业中医师，并在医师指导下使用。
          </p>
        </div>

        {/* 返回按钮 */}
        {canBackToResult && (
          <button
            onClick={() => setCurrentPage('result')}
            className="btn-main hover-lift reveal-up [animation-delay:260ms] xl:max-w-xl"
          >
            返回识别结果
          </button>
        )}
      </div>
    </div>
  );
};

export default DetailPage;
