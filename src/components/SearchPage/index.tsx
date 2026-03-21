/**
 * 搜索页面
 * 提供中草药手动搜索功能
 */
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, BookOpen } from 'lucide-react';
import { useAtom } from 'jotai';
import { currentPageAtom, currentHerbDetailAtom, detailBackTargetAtom, searchKeywordAtom } from '../../store/atoms';
import { searchHerbs, herbDatabase } from '../../data/herbDatabase';
import { HerbInfo } from '../../store/atoms';

const SearchPage: React.FC = () => {
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [, setCurrentHerbDetail] = useAtom(currentHerbDetailAtom);
  const [, setDetailBackTarget] = useAtom(detailBackTargetAtom);
  const [searchKeyword, setSearchKeyword] = useAtom(searchKeywordAtom);
  const [searchResults, setSearchResults] = useState<HerbInfo[]>(herbDatabase);

  useEffect(() => {
    const results = searchHerbs(searchKeyword);
    setSearchResults(results);
  }, [searchKeyword]);

  const handleViewDetail = (herb: HerbInfo) => {
    setCurrentHerbDetail(herb);
    setDetailBackTarget('search');
    setCurrentPage('detail');
  };

  const handleSpotlightMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  return (
    <div className="app-shell">
      <div className="page-wrap desktop-balance">
        <div className="hidden lg:flex items-end justify-between mb-4 reveal-up [animation-delay:30ms]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-800/70 mb-2">Knowledge Console</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">中草药搜索</h1>
            <p className="mt-2 text-slate-600">输入名称、功效或分类，快速定位草药信息</p>
          </div>
          <div className="glass-card-soft px-4 py-3 text-right">
            <p className="text-xs text-slate-500">检索结果</p>
            <p className="text-2xl font-bold text-slate-900">{searchResults.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          <aside className="xl:col-span-4 reveal-up [animation-delay:60ms] xl:sticky xl:top-4">
            <div className="glass-card">
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setCurrentPage('home')}
                  className="btn-quiet"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="ml-3 page-title">搜索面板</h2>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-700/70" />
                <input
                  type="text"
                  placeholder="搜索中草药名称、功效、分类..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="field-input pl-10 pr-4"
                />
              </div>

              <div className="mt-4 glass-card-soft">
                <p className="text-xs text-slate-500">当前状态</p>
                <p className="text-sm text-slate-700 mt-1">
                  {searchKeyword ? `关键词：${searchKeyword}` : '未输入关键词，显示全部草药'}
                </p>
              </div>
            </div>
          </aside>

          <section className="xl:col-span-8">
            {/* 搜索结果统计 */}
            <div className="mb-3 px-1 reveal-up [animation-delay:90ms]">
              <p className="page-subtitle">
                {searchKeyword ? `找到 ${searchResults.length} 个相关结果` : `共 ${searchResults.length} 种中草药`}
              </p>
            </div>

            {/* 搜索结果列表 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
              {searchResults.map((herb, index) => (
                <div
                  key={herb.id}
                  className="glass-card hover-lift interactive-spotlight reveal-up"
                  style={{ animationDelay: `${120 + (index % 8) * 45}ms` }}
                  onMouseMove={handleSpotlightMove}
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={herb.image}
                      alt={herb.name}
                      className="w-20 h-20 object-cover rounded-xl flex-shrink-0 ring-1 ring-emerald-900/10"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{herb.name}</h3>
                        <span className="tag-chip">
                          {herb.category}
                        </span>
                      </div>
                      
                      <p className="text-slate-500 text-sm mb-2 italic">{herb.scientificName}</p>
                      
                      <div className="mb-3">
                        <p className="text-slate-700 text-sm">
                          <span className="font-medium">性味：</span>{herb.properties}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {herb.functions.slice(0, 3).map((func, index) => (
                          <span
                            key={index}
                            className="tag-chip"
                          >
                            {func}
                          </span>
                        ))}
                        {herb.functions.length > 3 && (
                          <span className="text-slate-500 text-xs px-2 py-1">
                            +{herb.functions.length - 3}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleViewDetail(herb)}
                        className="btn-main text-sm py-2.5 px-4 flex items-center justify-center"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        查看详情
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {searchResults.length === 0 && searchKeyword && (
              <div className="glass-card text-center py-8 mt-4">
                <Search className="w-14 h-14 text-emerald-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">未找到相关结果</h3>
                <p className="text-slate-500 mb-3">
                  没有找到与"{searchKeyword}"相关的中草药
                </p>
                <p className="text-slate-500 text-sm">
                  建议：检查拼写，尝试其他关键词，或浏览所有中草药
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
