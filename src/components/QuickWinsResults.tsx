import React, { useState } from 'react';
import { Download, Zap, Clock, AlertTriangle, CheckCircle, FileText, Settings, Globe, TrendingUp, Target, List, Activity, Calendar } from 'lucide-react';
import { QuickWinsResult, QuickWin } from '../utils/quickWinsAnalyzer';

interface QuickWinsResultsProps {
  result: QuickWinsResult;
  darkMode: boolean;
  onDownloadCSV: () => void;
}

const QuickWinsResults: React.FC<QuickWinsResultsProps> = ({ result, darkMode, onDownloadCSV }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'implementation-plan' | 'all-checks' | 'timeline'>('overview');

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

  const getStatusIcon = (status: 'passed' | 'needs-improvement' | 'critical') => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'needs-improvement':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }: any) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : `text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} hover:bg-gray-100 ${darkMode ? 'dark:hover:bg-gray-700' : ''}`
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
              SEO Quick Wins Analysis
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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
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
              {result.summary.totalTimeEstimate}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Time</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          <TabButton
            id="overview"
            label="Overview"
            icon={Activity}
            isActive={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            id="implementation-plan"
            label="Implementation Plan"
            icon={Target}
            isActive={activeTab === 'implementation-plan'}
            onClick={setActiveTab}
          />
          <TabButton
            id="all-checks"
            label="All Checks"
            icon={List}
            isActive={activeTab === 'all-checks'}
            onClick={setActiveTab}
          />
          <TabButton
            id="timeline"
            label="Timeline"
            icon={Calendar}
            isActive={activeTab === 'timeline'}
            onClick={setActiveTab}
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Wins by Priority */}
          <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
            <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
              <TrendingUp className="w-5 h-5 mr-2" />
              Quick Wins by Priority ({result.quickWins.length})
            </h3>
            
            <div className="space-y-4">
              {result.quickWins.map((win, index) => (
                <div key={index} className={`border-l-4 pl-4 py-3 ${
                  win.impact === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  win.impact === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                } rounded-r-lg`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getCategoryIcon(win.category)}
                        <h4 className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                          {win.issue}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(win.impact)}`}>
                          {win.impact} impact
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffortColor(win.effort)}`}>
                          {win.effort}
                        </span>
                      </div>
                      
                      <p className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mb-2`}>
                        <strong>🔧 Action:</strong> {win.recommendation}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>⏱️ {win.timeToImplement}</span>
                        <span>📈 {win.expectedImpact}</span>
                      </div>
                      
                      {win.element && (
                        <code className={`text-xs bg-gray-100 ${darkMode ? 'dark:bg-gray-700' : ''} px-2 py-1 rounded mt-2 inline-block max-w-full overflow-hidden`}>
                          {win.element.length > 80 ? win.element.substring(0, 80) + '...' : win.element}
                        </code>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <div className={`text-lg font-bold ${
                        win.priority >= 8 ? 'text-red-600' :
                        win.priority >= 6 ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        #{win.priority}
                      </div>
                      <div className="text-xs text-gray-500">Priority</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'implementation-plan' && (
        <div className="space-y-6">
          {/* Immediate Actions */}
          {result.implementationPlan.immediate.length > 0 && (
            <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-green-500" />
                <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                  Immediate Actions ({result.implementationPlan.immediate.length})
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Can be completed in minutes
                </span>
              </div>
              
              <div className="space-y-3">
                {result.implementationPlan.immediate.map((win, index) => (
                  <div key={index} className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 pl-4 py-3 rounded-r-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getCategoryIcon(win.category)}
                          <span className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                            {win.checkName}
                          </span>
                          <span className="text-sm text-green-600 font-medium">
                            ⏱️ {win.timeToImplement}
                          </span>
                        </div>
                        <p className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                          {win.recommendation}
                        </p>
                      </div>
                      <div className="ml-4 text-green-600 font-bold">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Short-term Actions */}
          {result.implementationPlan.shortTerm.length > 0 && (
            <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-yellow-500" />
                <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                  Short-term Actions ({result.implementationPlan.shortTerm.length})
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Can be completed in hours/days
                </span>
              </div>
              
              <div className="space-y-3">
                {result.implementationPlan.shortTerm.map((win, index) => (
                  <div key={index} className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 pl-4 py-3 rounded-r-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getCategoryIcon(win.category)}
                          <span className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                            {win.checkName}
                          </span>
                          <span className="text-sm text-yellow-600 font-medium">
                            ⏱️ {win.timeToImplement}
                          </span>
                        </div>
                        <p className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                          {win.recommendation}
                        </p>
                      </div>
                      <div className="ml-4 text-yellow-600 font-bold">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Long-term Actions */}
          {result.implementationPlan.longTerm.length > 0 && (
            <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                  Long-term Projects ({result.implementationPlan.longTerm.length})
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Requires significant planning and development
                </span>
              </div>
              
              <div className="space-y-3">
                {result.implementationPlan.longTerm.map((win, index) => (
                  <div key={index} className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 pl-4 py-3 rounded-r-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getCategoryIcon(win.category)}
                          <span className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                            {win.checkName}
                          </span>
                          <span className="text-sm text-red-600 font-medium">
                            ⏱️ {win.timeToImplement}
                          </span>
                        </div>
                        <p className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                          {win.recommendation}
                        </p>
                      </div>
                      <div className="ml-4 text-red-600 font-bold">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'all-checks' && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
          <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
            <List className="w-5 h-5 mr-2" />
            All SEO Checks ({result.allChecks.length})
          </h3>
          
          <div className="space-y-3">
            {result.allChecks.map((check, index) => (
              <div key={index} className={`p-4 border border-gray-200 ${darkMode ? 'dark:border-gray-600' : ''} rounded-lg`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                          {check.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          check.status === 'passed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          check.status === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {check.status.replace('-', ' ')}
                        </span>
                      </div>
                      <p className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mb-1`}>
                        {check.description}
                      </p>
                      <p className={`text-sm font-medium text-gray-800 ${darkMode ? 'dark:text-gray-200' : ''}`}>
                        Result: {check.result}
                      </p>
                      {check.recommendation && (
                        <p className={`text-sm text-blue-600 ${darkMode ? 'dark:text-blue-400' : ''} mt-1`}>
                          💡 {check.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
          <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
            <Calendar className="w-5 h-5 mr-2" />
            Implementation Timeline
          </h3>
          
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Week 1 */}
              <div className="relative flex items-start space-x-4 pb-6">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-2`}>
                    Week 1: Immediate Wins
                  </h4>
                  <div className="space-y-2">
                    {result.implementationPlan.immediate.slice(0, 5).map((win, index) => (
                      <div key={index} className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} flex items-center space-x-2`}>
                        <span>•</span>
                        <span>{win.checkName} ({win.timeToImplement})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Week 2-3 */}
              {result.implementationPlan.shortTerm.length > 0 && (
                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2-3
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-2`}>
                      Weeks 2-3: Short-term Improvements
                    </h4>
                    <div className="space-y-2">
                      {result.implementationPlan.shortTerm.map((win, index) => (
                        <div key={index} className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} flex items-center space-x-2`}>
                          <span>•</span>
                          <span>{win.checkName} ({win.timeToImplement})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Month 2+ */}
              {result.implementationPlan.longTerm.length > 0 && (
                <div className="relative flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2+
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-2`}>
                      Month 2+: Long-term Projects
                    </h4>
                    <div className="space-y-2">
                      {result.implementationPlan.longTerm.map((win, index) => (
                        <div key={index} className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} flex items-center space-x-2`}>
                          <span>•</span>
                          <span>{win.checkName} ({win.timeToImplement})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {result.quickWins.length === 0 && activeTab === 'overview' && (
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