/**
 * 搜索页面
 * 提供中草药手动搜索功能
 */
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, BookOpen } from 'lucide-react';
import { useAtom } from 'jotai';
import { currentPageAtom, currentHerbDetailAtom, searchKeywordAtom } from '../../store/atoms';
import { searchHerbs, herbDatabase } from '../../data/herbDatabase';
import { HerbInfo } from '../../store/atoms';

const SearchPage: React.FC = () => {
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [, setCurrentHerbDetail] = useAtom(currentHerbDetailAtom);
  const [searchKeyword, setSearchKeyword] = useAtom(searchKeywordAtom);
  const [searchResults, setSearchResults] = useState<HerbInfo[]>(herbDatabase);

  useEffect(() => {
    const results = searchHerbs(searchKeyword);
    setSearchResults(results);
  }, [searchKeyword]);

  const handleViewDetail = (herb: HerbInfo) => {
    setCurrentHerbDetail(herb);
    setCurrentPage('detail');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* 头部导航 */}
      <div className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center mb-4">
          <button
            onClick={() => setCurrentPage('home')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="ml-3 text-lg font-semibold text-gray-800">中草药搜索</h1>
        </div>
        
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索中草药名称、功效、分类..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* 搜索结果统计 */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm">
            {searchKeyword ? `找到 ${searchResults.length} 个相关结果` : `共 ${searchResults.length} 种中草药`}
          </p>
        </div>

        {/* 搜索结果列表 */}
        <div className="space-y-4">
          {searchResults.map((herb) => (
            <div key={herb.id} className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                {/* 图片 */}
                <img
                  src={herb.image}
                  alt={herb.name}
                  className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                />
                
                {/* 内容区 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{herb.name}</h3>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      {herb.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2 italic">{herb.scientificName}</p>
                  
                  <div className="mb-3">
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">性味：</span>{herb.properties}
                    </p>
                  </div>
                  
                  {/* 功效标签 */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {herb.functions.slice(0, 3).map((func, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                      >
                        {func}
                      </span>
                    ))}
                    {herb.functions.length > 3 && (
                      <span className="text-gray-500 text-xs px-2 py-1">
                        +{herb.functions.length - 3}
                      </span>
                    )}
                  </div>
                  
                  {/* 查看详情按钮 */}
                  <button
                    onClick={() => handleViewDetail(herb)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
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
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">未找到相关结果</h3>
            <p className="text-gray-500 mb-4">
              没有找到与"{searchKeyword}"相关的中草药
            </p>
            <p className="text-gray-500 text-sm">
              建议：检查拼写，尝试其他关键词，或浏览所有中草药
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
