/**
 * 模型可视化组件
 * 展示识别结果、置信度分布、性能指标等
 */
import React from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useAtom } from 'jotai';
import { currentPredictionAtom, modelPerformanceHistoryAtom, modelStatsAtom } from '../../store/modelAtoms';
import { TrendingUp, Zap, Target, Users } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ModelVisualization: React.FC = () => {
  const [currentPrediction] = useAtom(currentPredictionAtom);
  const [performanceHistory] = useAtom(modelPerformanceHistoryAtom);
  const [modelStats] = useAtom(modelStatsAtom);

  // 置信度分布图表数据
  const confidenceChartData = React.useMemo(() => ({
    labels: currentPrediction?.predictions.slice(0, 5).map(p => p.herbName) || [],
    datasets: [
      {
        label: '置信度',
        data: currentPrediction?.predictions.slice(0, 5).map(p => (p.confidence * 100).toFixed(1)) || [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }), [currentPrediction]);

  // 性能历史图表数据
  const performanceChartData = React.useMemo(() => ({
    labels: performanceHistory.slice(-10).map((_, index) => `预测 ${index + 1}`),
    datasets: [
      {
        label: '准确率 (%)',
        data: performanceHistory.slice(-10).map(p => (p.accuracy * 100).toFixed(1)),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: '处理时间 (ms)',
        data: performanceHistory.slice(-10).map(p => p.processingTime.toFixed(1)),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  }), [performanceHistory]);

  // 模型统计饼图数据
  const statsChartData = React.useMemo(() => ({
    labels: ['正确预测', '错误预测'],
    datasets: [
      {
        data: [modelStats.correctPredictions, Math.max(0, modelStats.totalPredictions - modelStats.correctPredictions)],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 2,
      },
    ],
  }), [modelStats]);

  const chartOptions = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }), []);

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-gray-500 text-sm">平均准确率</p>
              <p className="text-2xl font-bold text-gray-800">
                {(modelStats.averageAccuracy * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center">
            <Zap className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-gray-500 text-sm">处理时间</p>
              <p className="text-2xl font-bold text-gray-800">
                {modelStats.averageProcessingTime.toFixed(0)}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-gray-500 text-sm">总预测次数</p>
              <p className="text-2xl font-bold text-gray-800">
                {modelStats.totalPredictions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-gray-500 text-sm">用户满意度</p>
              <p className="text-2xl font-bold text-gray-800">
                {modelStats.userSatisfaction.toFixed(1)}/5
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 当前预测置信度 */}
      {currentPrediction && currentPrediction.predictions.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">识别结果置信度分布</h3>
          <div className="h-64">
            <Bar data={confidenceChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* 性能历史趋势 */}
      {performanceHistory.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">模型性能趋势</h3>
          <div className="h-64">
            <Line data={performanceChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* 预测准确性统计 */}
      {modelStats.totalPredictions > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">预测准确性统计</h3>
          <div className="h-64 flex justify-center">
            <Doughnut data={statsChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* 详细预测结果 */}
      {currentPrediction && currentPrediction.predictions.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">详细识别结果</h3>
          <div className="space-y-3">
            {currentPrediction.predictions.slice(0, 5).map((prediction, index) => (
              <div key={prediction.herbId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="ml-3 font-medium text-gray-800">{prediction.herbName}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, prediction.confidence * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelVisualization;