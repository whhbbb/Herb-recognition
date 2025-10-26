/**
 * 中草药详情页面
 * 展示中草药的详细信息
 */
import React from 'react';
import { ArrowLeft, Tag, Book, AlertCircle, Package } from 'lucide-react';
import { useAtom } from 'jotai';
import { currentHerbDetailAtom, currentPageAtom } from '../../store/atoms';

const DetailPage: React.FC = () => {
  const [currentHerbDetail] = useAtom(currentHerbDetailAtom);
  const [, setCurrentPage] = useAtom(currentPageAtom);

  if (!currentHerbDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">暂无详情信息</p>
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

  const herb = currentHerbDetail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* 头部导航 */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center">
        <button
          onClick={() => setCurrentPage('result')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="ml-3 text-lg font-semibold text-gray-800">详细信息</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* 头部信息 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{herb.name}</h1>
            <p className="text-gray-600 italic">{herb.scientificName}</p>
            <div className="inline-flex items-center bg-green-100 px-3 py-1 rounded-full mt-2">
              <Tag className="w-4 h-4 text-green-700 mr-1" />
              <span className="text-green-700 text-sm font-medium">{herb.category}</span>
            </div>
          </div>
          
          <img
            src={herb.image}
            alt={herb.name}
            className="w-full h-48 object-cover rounded-xl mb-4"
          />
          
          <p className="text-gray-700 text-sm leading-relaxed">{herb.description}</p>
        </div>

        {/* 基本信息 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Book className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">基本信息</h2>
          </div>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">性味归经</h3>
              <p className="text-gray-600">{herb.properties}</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">主要功效</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {herb.functions.map((func, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                  >
                    {func}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">用法用量</h3>
              <div className="flex items-center">
                <Package className="w-4 h-4 text-purple-500 mr-2" />
                <p className="text-gray-600">{herb.usage}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <h2 className="text-lg font-semibold text-red-700">使用禁忌</h2>
          </div>
          
          <div className="space-y-2">
            {herb.cautions.map((caution, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-red-700 text-sm">{caution}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 温馨提示 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
          <h3 className="text-yellow-800 font-semibold mb-2">温馨提示</h3>
          <p className="text-yellow-700 text-sm leading-relaxed">
            本信息仅供参考学习，不能替代专业医疗建议。使用中草药前请咨询专业中医师，并在医师指导下使用。如有身体不适，请及时就医。
          </p>
        </div>

        {/* 返回按钮 */}
        <button
          onClick={() => setCurrentPage('result')}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          返回识别结果
        </button>
      </div>
    </div>
  );
};

export default DetailPage;
