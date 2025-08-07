import React from 'react';
import { Download, Zap, Clock, AlertTriangle, CheckCircle, FileText, Settings, Globe, TrendingUp } from 'lucide-react';
import { QuickWinsResult, QuickWin } from '../utils/quickWinsAnalyzer';

interface QuickWinsResultsProps {
  result: QuickWinsResult;
  darkMode: boolean;
  onDownloadCSV: () => void;
}

const QuickWinsResults: React.FC<QuickWinsResultsProps> = ({ result, darkMode, onDownloadCSV }) => {
  const getCategoryIcon = (category: QuickWin['category']) => {
    switch (category) {
      case 'technical':
        return <Settings className="w-4 h-4" />;
      case 'content':
        return <FileText className="w-4 h-4" />;
      case 'performance':
        return <Zap className="w-4 h-4" />;
      case 'meta':
        return <Globe className="w-4 h-4" />;
    }
  };

  const getEffortIcon = (effort: QuickWin['effort']) => {
    switch (effort) {
      case 'easy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'hard':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getImpactColor = (impact: QuickWin['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getEffortColor = (effort: QuickWin['effort']) => {
    switch (effort) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const easyWins = result.quickWins.filter(win => win.effort === 'easy');
  const mediumWins = result.quickWins.filter(win => win.effort === 'medium');
  const hardWins = result.quickWins.filter(win => win.effort === 'hard');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
              SEO Quick Wins
            </h2>
            <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mt-1`}>
              {result.url}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}
              </div>
              <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                Overall Score
              </div>
            </div>
            <button
              onClick={onDownloadCSV}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-semibold text-green-600">
              {result.summary.easyWins}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Easy Wins</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-lg font-semibold text-yellow-600">
              {result.summary.mediumWins}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Medium</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-lg font-semibold text-red-600">
              {result.summary.hardWins}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Hard</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-lg font-semibold text-red-600">
              {result.summary.highImpact}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">High Impact</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-lg font-semibold text-yellow-600">
              {result.summary.mediumImpact}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Med Impact</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-semibold text-blue-600">
              {result.summary.lowImpact}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Low Impact</div>
          </div>
        </div>
      </div>

      {/* Easy Wins Section */}
      {easyWins.length > 0 && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
              Easy Wins ({easyWins.length})
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Quick fixes with immediate impact
            </span>
          </div>
          
          <div className="space-y-3">
            {easyWins.map((win, index) => (
              <div key={index} className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 pl-4 py-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getCategoryIcon(win.category)}
                      <span className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                        {win.issue}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(win.impact)}`}>
                        {win.impact} impact
                      </span>
                    </div>
                    <p className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mb-2`}>
                      💡 {win.recommendation}
                    </p>
                    {win.element && (
                      <code className={`text-xs bg-gray-100 ${darkMode ? 'dark:bg-gray-700' : ''} px-2 py-1 rounded inline-block max-w-full overflow-hidden`}>
                        {win.element.length > 80 ? win.element.substring(0, 80) + '...' : win.element}
                      </code>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-lg font-bold text-green-600">#{win.priority}</div>
                    <div className="text-xs text-gray-500">Priority</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medium Effort Wins */}
      {mediumWins.length > 0 && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-yellow-500" />
            <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
              Medium Effort Wins ({mediumWins.length})
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Requires some development work
            </span>
          </div>
          
          <div className="space-y-3">
            {mediumWins.map((win, index) => (
              <div key={index} className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 pl-4 py-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getCategoryIcon(win.category)}
                      <span className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                        {win.issue}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(win.impact)}`}>
                        {win.impact} impact
                      </span>
                    </div>
                    <p className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mb-2`}>
                      💡 {win.recommendation}
                    </p>
                    {win.element && (
                      <code className={`text-xs bg-gray-100 ${darkMode ? 'dark:bg-gray-700' : ''} px-2 py-1 rounded inline-block max-w-full overflow-hidden`}>
                        {win.element.length > 80 ? win.element.substring(0, 80) + '...' : win.element}
                      </code>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-lg font-bold text-yellow-600">#{win.priority}</div>
                    <div className="text-xs text-gray-500">Priority</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hard Wins */}
      {hardWins.length > 0 && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
              Complex Improvements ({hardWins.length})
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Requires significant development effort
            </span>
          </div>
          
          <div className="space-y-3">
            {hardWins.map((win, index) => (
              <div key={index} className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 pl-4 py-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getCategoryIcon(win.category)}
                      <span className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                        {win.issue}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(win.impact)}`}>
                        {win.impact} impact
                      </span>
                    </div>
                    <p className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mb-2`}>
                      💡 {win.recommendation}
                    </p>
                    {win.element && (
                      <code className={`text-xs bg-gray-100 ${darkMode ? 'dark:bg-gray-700' : ''} px-2 py-1 rounded inline-block max-w-full overflow-hidden`}>
                        {win.element.length > 80 ? win.element.substring(0, 80) + '...' : win.element}
                      </code>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-lg font-bold text-red-600">#{win.priority}</div>
                    <div className="text-xs text-gray-500">Priority</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.quickWins.length === 0 && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-8 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''} text-center`}>
          <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className={`text-xl font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-2`}>
            Excellent SEO Foundation!
          </h3>
          <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
            No immediate quick wins found. Your site follows SEO best practices well.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickWinsResults;