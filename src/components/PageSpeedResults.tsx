import React, { useState } from 'react';
import { Zap, Clock, AlertTriangle, CheckCircle, TrendingUp, Target, List, Activity, BarChart3 } from 'lucide-react';
import { PageSpeedResult, PageSpeedIssue } from '../utils/pageSpeedAnalyzer';

interface PageSpeedResultsProps {
  result: PageSpeedResult;
  darkMode: boolean;
}

const PageSpeedResults: React.FC<PageSpeedResultsProps> = ({ result, darkMode }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'core-web-vitals' | 'actionables' | 'opportunities' | 'all-checks'>('overview');

  const getIssueIcon = (type: PageSpeedIssue['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingColor = (rating: 'good' | 'needs-improvement' | 'poor') => {
    switch (rating) {
      case 'good':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'poor':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
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
              Page Speed Analysis
            </h2>
            <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mt-1`}>
              {result.url}
            </p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
              {result.score}
            </div>
            <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
              Performance Score
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-semibold text-blue-600">
              {result.metrics.loadTime}ms
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Load Time</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-semibold text-green-600">
              {result.actionableItems.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Actionable</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-lg font-semibold text-purple-600">
              {result.optimizationOpportunities.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Opportunities</div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-lg font-semibold text-orange-600">
              {result.metrics.totalSize}KB
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Page Size</div>
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
            id="core-web-vitals"
            label="Core Web Vitals"
            icon={BarChart3}
            isActive={activeTab === 'core-web-vitals'}
            onClick={setActiveTab}
          />
          <TabButton
            id="actionables"
            label="Actionables"
            icon={Target}
            isActive={activeTab === 'actionables'}
            onClick={setActiveTab}
          />
          <TabButton
            id="opportunities"
            label="Opportunities"
            icon={TrendingUp}
            isActive={activeTab === 'opportunities'}
            onClick={setActiveTab}
          />
          <TabButton
            id="all-checks"
            label="All Checks"
            icon={List}
            isActive={activeTab === 'all-checks'}
            onClick={setActiveTab}
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Performance Issues */}
          <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
            <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
              <Zap className="w-5 h-5 mr-2" />
              Performance Issues ({result.issues.length})
            </h3>
            
            <div className="space-y-4">
              {result.issues.map((issue, index) => (
                <div key={index} className={`border-l-4 pl-4 py-3 ${
                  issue.type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  issue.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  issue.type === 'info' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                  'border-green-500 bg-green-50 dark:bg-green-900/20'
                } rounded-r-lg`}>
                  <div className="flex items-start space-x-3">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                          {issue.message}
                        </p>
                        {issue.actionable && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            Actionable
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-sm text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''} mb-2`}>
                        <strong>Impact:</strong> {issue.impact}
                      </p>
                      
                      {issue.recommendation && (
                        <p className={`text-sm text-blue-700 ${darkMode ? 'dark:text-blue-300' : ''} mb-2`}>
                          <strong>🔧 Fix:</strong> {issue.recommendation}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>⏱️ {issue.timeToFix}</span>
                        <span>📈 {issue.expectedImprovement}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'core-web-vitals' && (
        <div className="space-y-6">
          {/* Core Web Vitals */}
          <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
            <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
              <BarChart3 className="w-5 h-5 mr-2" />
              Core Web Vitals
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* LCP */}
              <div className="text-center p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="mb-4">
                  <div className={`text-3xl font-bold ${
                    result.coreWebVitals.lcp.rating === 'good' ? 'text-green-600' :
                    result.coreWebVitals.lcp.rating === 'needs-improvement' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {result.coreWebVitals.lcp.value.toFixed(0)}ms
                  </div>
                  <div className={`text-sm font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-2`}>
                    Largest Contentful Paint
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRatingColor(result.coreWebVitals.lcp.rating)}`}>
                    {result.coreWebVitals.lcp.rating.replace('-', ' ')}
                  </span>
                </div>
                <p className={`text-xs text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Measures loading performance. Good: ≤2.5s
                </p>
              </div>

              {/* FID */}
              <div className="text-center p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="mb-4">
                  <div className={`text-3xl font-bold ${
                    result.coreWebVitals.fid.rating === 'good' ? 'text-green-600' :
                    result.coreWebVitals.fid.rating === 'needs-improvement' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {result.coreWebVitals.fid.value.toFixed(0)}ms
                  </div>
                  <div className={`text-sm font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-2`}>
                    First Input Delay
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRatingColor(result.coreWebVitals.fid.rating)}`}>
                    {result.coreWebVitals.fid.rating.replace('-', ' ')}
                  </span>
                </div>
                <p className={`text-xs text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Measures interactivity. Good: ≤100ms
                </p>
              </div>

              {/* CLS */}
              <div className="text-center p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="mb-4">
                  <div className={`text-3xl font-bold ${
                    result.coreWebVitals.cls.rating === 'good' ? 'text-green-600' :
                    result.coreWebVitals.cls.rating === 'needs-improvement' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {result.coreWebVitals.cls.value.toFixed(2)}
                  </div>
                  <div className={`text-sm font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-2`}>
                    Cumulative Layout Shift
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRatingColor(result.coreWebVitals.cls.rating)}`}>
                    {result.coreWebVitals.cls.rating.replace('-', ' ')}
                  </span>
                </div>
                <p className={`text-xs text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Measures visual stability. Good: ≤0.1
                </p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
            <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4`}>
              Performance Metrics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {result.metrics.firstContentfulPaint.toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">First Contentful Paint</div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {result.metrics.domContentLoaded.toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">DOM Content Loaded</div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {result.metrics.totalBlockingTime}ms
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Blocking Time</div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {result.metrics.resourceCount.images + result.metrics.resourceCount.scripts + result.metrics.resourceCount.stylesheets}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Resources</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'actionables' && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
          <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
            <Target className="w-5 h-5 mr-2" />
            Actionable Performance Improvements ({result.actionableItems.length})
          </h3>
          
          {result.actionableItems.length > 0 ? (
            <div className="space-y-4">
              {result.actionableItems
                .sort((a, b) => {
                  const priorityOrder = { high: 3, medium: 2, low: 1 };
                  return priorityOrder[b.priority] - priorityOrder[a.priority];
                })
                .map((item, index) => (
                <div key={index} className={`p-4 border-l-4 ${
                  item.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  item.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                } rounded-r-lg`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                          {item.checkName}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {item.priority} priority
                        </span>
                      </div>
                      <p className={`text-sm text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''} mb-2`}>
                        <strong>Issue:</strong> {item.message}
                      </p>
                      <p className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mb-2`}>
                        <strong>Impact:</strong> {item.impact}
                      </p>
                      {item.recommendation && (
                        <p className={`text-sm text-blue-700 ${darkMode ? 'dark:text-blue-300' : ''} mb-2`}>
                          <strong>🔧 Action:</strong> {item.recommendation}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>⏱️ {item.timeToFix}</span>
                        <span>📈 {item.expectedImprovement}</span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className={`text-lg font-bold ${
                        item.priority === 'high' ? 'text-red-600' :
                        item.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-2`}>
                Great Performance!
              </h4>
              <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                No immediate performance issues found that require action.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'opportunities' && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
          <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
            <TrendingUp className="w-5 h-5 mr-2" />
            Optimization Opportunities ({result.optimizationOpportunities.length})
          </h3>
          
          <div className="space-y-4">
            {result.optimizationOpportunities.map((opportunity, index) => (
              <div key={index} className={`p-4 border border-gray-200 ${darkMode ? 'dark:border-gray-600' : ''} rounded-lg`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                        {opportunity.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        opportunity.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        opportunity.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {opportunity.difficulty}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {opportunity.category}
                      </span>
                    </div>
                    <p className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mb-2`}>
                      {opportunity.description}
                    </p>
                    <p className={`text-sm font-medium text-green-700 ${darkMode ? 'dark:text-green-300' : ''}`}>
                      💰 Potential savings: {opportunity.potentialSavings}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-lg font-bold text-blue-600">
                      #{opportunity.priority}
                    </div>
                    <div className="text-xs text-gray-500">Priority</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'all-checks' && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
          <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
            <List className="w-5 h-5 mr-2" />
            All Performance Checks ({result.allChecks.length})
          </h3>
          
          <div className="space-y-3">
            {result.allChecks.map((check, index) => (
              <div key={index} className={`p-4 border border-gray-200 ${darkMode ? 'dark:border-gray-600' : ''} rounded-lg`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-4 h-4 rounded-full mt-0.5 ${
                      check.status === 'passed' ? 'bg-green-500' :
                      check.status === 'failed' ? 'bg-red-500' :
                      check.status === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                          {check.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          check.status === 'passed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          check.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                          check.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {check.status}
                        </span>
                      </div>
                      <p className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mb-1`}>
                        {check.description}
                      </p>
                      <p className={`text-sm font-medium text-gray-800 ${darkMode ? 'dark:text-gray-200' : ''} mb-1`}>
                        Result: {check.result}
                      </p>
                      <p className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                        Impact: {check.impact}
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
    </div>
  );
};

export default PageSpeedResults;