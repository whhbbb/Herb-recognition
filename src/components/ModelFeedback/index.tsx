/**
 * 模型反馈组件
 * 收集用户对识别结果的反馈，用于模型改进
 */
import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { Star, MessageCircle, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { userFeedbackAtom, currentPredictionAtom } from '../../store/modelAtoms';
import { UserFeedback } from '../../store/modelAtoms';

const ModelFeedback: React.FC = () => {
  const [userFeedback, setUserFeedback] = useAtom(userFeedbackAtom);
  const [currentPrediction] = useAtom(currentPredictionAtom);
  const [feedbackForm, setFeedbackForm] = useState({
    isCorrect: null as boolean | null,
    actualHerbName: '',
    rating: 0,
    comments: '',
  });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const handleRatingClick = (rating: number) => {
    setFeedbackForm(prev => ({ ...prev, rating }));
  };

  const handleSubmitFeedback = () => {
    if (!currentPrediction || feedbackForm.isCorrect === null) {
      toast.error('请完整填写反馈信息');
      return;
    }

    const feedback: UserFeedback = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      predictionId: Date.now().toString(),
      actualHerbName: feedbackForm.actualHerbName || currentPrediction.predictions[0].herbName,
      predictedHerbName: currentPrediction.predictions[0].herbName,
      isCorrect: feedbackForm.isCorrect,
      confidence: currentPrediction.predictions[0].confidence,
      userRating: feedbackForm.rating,
      comments: feedbackForm.comments,
    };

    setUserFeedback(prev => [feedback, ...prev]);
    setFeedbackForm({
      isCorrect: null,
      actualHerbName: '',
      rating: 0,
      comments: '',
    });
    setShowFeedbackForm(false);
    toast.success('感谢您的反馈！这将帮助我们改进模型');
  };

  const recentFeedback = userFeedback.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 反馈收集 */}
      {currentPrediction && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">对识别结果进行反馈</h3>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">模型识别结果：</p>
            <p className="font-medium text-gray-800">
              {currentPrediction.predictions[0].herbName} 
              <span className="ml-2 text-sm text-green-600">
                ({(currentPrediction.predictions[0].confidence * 100).toFixed(1)}% 置信度)
              </span>
            </p>
          </div>

          {!showFeedbackForm ? (
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setFeedbackForm(prev => ({ ...prev, isCorrect: true }));
                  setShowFeedbackForm(true);
                }}
                className="flex-1 flex items-center justify-center bg-green-100 text-green-700 py-3 rounded-lg hover:bg-green-200 transition-colors"
              >
                <ThumbsUp className="w-5 h-5 mr-2" />
                识别正确
              </button>
              
              <button
                onClick={() => {
                  setFeedbackForm(prev => ({ ...prev, isCorrect: false }));
                  setShowFeedbackForm(true);
                }}
                className="flex-1 flex items-center justify-center bg-red-100 text-red-700 py-3 rounded-lg hover:bg-red-200 transition-colors"
              >
                <ThumbsDown className="w-5 h-5 mr-2" />
                识别错误
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 如果识别错误，让用户输入正确答案 */}
              {feedbackForm.isCorrect === false && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    请输入正确的中草药名称：
                  </label>
                  <input
                    type="text"
                    value={feedbackForm.actualHerbName}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, actualHerbName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="例如：当归"
                  />
                </div>
              )}

              {/* 评分 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  请为识别体验评分：
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingClick(star)}
                      className={`p-1 ${
                        star <= feedbackForm.rating ? 'text-yellow-400' : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* 评论 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  其他建议（可选）：
                </label>
                <textarea
                  value={feedbackForm.comments}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, comments: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={3}
                  placeholder="请分享您的使用体验或改进建议..."
                />
              </div>

              {/* 提交按钮 */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSubmitFeedback}
                  disabled={feedbackForm.rating === 0}
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  提交反馈
                </button>
                
                <button
                  onClick={() => setShowFeedbackForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 反馈历史 */}
      {recentFeedback.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">最近反馈记录</h3>
          
          <div className="space-y-3">
            {recentFeedback.map((feedback) => (
              <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {feedback.isCorrect ? (
                      <ThumbsUp className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <ThumbsDown className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <span className={`text-sm font-medium ${
                      feedback.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {feedback.isCorrect ? '识别正确' : '识别错误'}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    {Array.from({ length: feedback.userRating }).map((_, index) => (
                      <Star key={index} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">预测：</span>{feedback.predictedHerbName}
                  {!feedback.isCorrect && (
                    <>
                      <span className="mx-2">→</span>
                      <span className="font-medium">实际：</span>{feedback.actualHerbName}
                    </>
                  )}
                </div>
                
                <div className="text-sm text-gray-500 mb-2">
                  置信度：{(feedback.confidence * 100).toFixed(1)}% | 
                  {new Date(feedback.timestamp).toLocaleDateString('zh-CN')}
                </div>
                
                {feedback.comments && (
                  <div className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                    <MessageCircle className="w-4 h-4 inline mr-1" />
                    {feedback.comments}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelFeedback;
