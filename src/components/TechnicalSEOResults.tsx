import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, Shield, Search, FileText, Settings, Globe, Link2, Zap, Target, List, Activity } from 'lucide-react';
import { TechnicalSEOResult, TechnicalSEOIssue } from '../utils/technicalSeoAnalyzer';

interface TechnicalSEOResultsProps {
  result: TechnicalSEOResult;
  darkMode: boolean;
}

const TechnicalSEOResults: React.FC<TechnicalSEOResultsProps> = ({ result, darkMode }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'actionables' | 'all-checks' | 'metrics'>('overview');

  const getIssueIcon = (type: TechnicalSEOIssue['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusIcon = (status: 'passed' | 'failed' | 'warning' | 'info') => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: TechnicalSEOIssue['category']) => {
    switch (category) {
      case 'meta':
        return <FileText className="w-4 h-4" />;
      case 'headers':
        return <FileText className="w-4 h-4" />;
      case 'indexability':
        return <Search className="w-4 h-4" />;
      case 'structure':
        return <Settings className="w-4 h-4" />;
      case 'crawlability':
        return <Globe className="w-4 h-4" />;
      case 'canonicalization':
        return <Link2 className="w-4 h-4" />;
      case 'redirects':
        return <Zap className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'performance':
        return <Zap className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: TechnicalSEOIssue['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const groupedIssues = result.issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = [];
    }
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<string, TechnicalSEOIssue[]>);

  const categoryNames = {
    meta: 'Meta Tags',
    headers: 'Header Structure',
    indexability: 'Indexability',
    structure: 'Page Structure',
    crawlability: 'Crawlability',
    canonicalization: 'Canonicalization',
    redirects: 'Redirects',
    security: 'Security',
    performance: 'Performance'
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
              Technical SEO Audit Results
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
              Technical Score
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-semibold text-green-600">
              {result.allChecks.filter(c => c.status === 'passed').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Passed</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-lg font-semibold text-red-600">
              {result.allChecks.filter(c => c.status === 'failed').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Failed</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-lg font-semibold text-yellow-600">
              {result.allChecks.filter(c => c.status === 'warning').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Warnings</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-semibold text-blue-600">
              {result.actionableItems.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Actionable</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6">
          <TabButton
            id="overview"
            label="Overview"
            icon={Activity}
            isActive={activeTab === 'overview'}
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
            id="all-checks"
            label="All Checks"
            icon={List}
            isActive={activeTab === 'all-checks'}
            onClick={setActiveTab}
          />
          <TabButton
            id="metrics"
            label="Metrics"
            icon={Settings}
            isActive={activeTab === 'metrics'}
            onClick={setActiveTab}
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Issues by Category */}
          {Object.entries(groupedIssues).map(([category, issues]) => (
            <div key={category} className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
              <div className="flex items-center space-x-2 mb-4">
                {getCategoryIcon(category as TechnicalSEOIssue['category'])}
                <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                  {categoryNames[category as keyof typeof categoryNames] || category}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${darkMode ? 'dark:bg-gray-700 dark:text-gray-300' : ''}`}>
                  {issues.length}
                </span>
              </div>
              
              <div className="space-y-4">
                {issues.map((issue, index) => (
                  <div key={index} className={`border-l-4 pl-4 py-3 ${
                    issue.type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                    issue.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                    issue.type === 'info' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                    'border-green-500 bg-green-50 dark:bg-green-900/20'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                            {issue.message}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </span>
                          {issue.actionable && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              Actionable
                            </span>
                          )}
                        </div>
                        
                        <div className={`text-sm text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''} mb-2`}>
                          <strong>Impact:</strong> {issue.impact}
                        </div>
                        
                        {issue.recommendation && (
                          <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mb-2`}>
                            <strong>💡 Recommendation:</strong> {issue.recommendation}
                          </div>
                        )}
                        
                        {issue.element && (
                          <code className={`text-xs bg-gray-100 ${darkMode ? 'dark:bg-gray-700' : ''} px-2 py-1 rounded mt-1 inline-block max-w-full overflow-hidden`}>
                            {issue.element.length > 100 ? issue.element.substring(0, 100) + '...' : issue.element}
                          </code>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'actionables' && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
          <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
            <Target className="w-5 h-5 mr-2" />
            Actionable Items ({result.actionableItems.length})
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
                        {getCategoryIcon(item.category)}
                        <h4 className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                          {item.checkName}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
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
                        <p className={`text-sm text-blue-700 ${darkMode ? 'dark:text-blue-300' : ''}`}>
                          <strong>🔧 Action:</strong> {item.recommendation}
                        </p>
                      )}
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
                No Actionable Items
              </h4>
              <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                Great! All technical SEO checks are passing or only have informational notes.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'all-checks' && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
          <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
            <List className="w-5 h-5 mr-2" />
            All Technical Checks ({result.allChecks.length})
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

      {activeTab === 'metrics' && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
          <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
            <Settings className="w-5 h-5 mr-2" />
            Technical Metrics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Title Length
                </span>
                <span className={`text-lg font-bold ${
                  result.metrics.titleLength >= 30 && result.metrics.titleLength <= 60 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {result.metrics.titleLength}
                </span>
              </div>
              <div className={`text-xs text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''} mt-1`}>
                Optimal: 30-60 characters
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Meta Description
                </span>
                <span className={`text-lg font-bold ${
                  result.metrics.descriptionLength >= 120 && result.metrics.descriptionLength <= 160 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {result.metrics.descriptionLength}
                </span>
              </div>
              <div className={`text-xs text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''} mt-1`}>
                Optimal: 120-160 characters
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  H1 Tags
                </span>
                <span className={`text-lg font-bold ${
                  result.metrics.h1Count === 1 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.metrics.h1Count}
                </span>
              </div>
              <div className={`text-xs text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''} mt-1`}>
                Should be exactly 1
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  HTTPS
                </span>
                <span className={`text-lg font-bold ${
                  result.metrics.httpsEnabled ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.metrics.httpsEnabled ? 'Yes' : 'No'}
                </span>
              </div>
              <div className={`text-xs text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''} mt-1`}>
                Security protocol
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Canonical Tag
                </span>
                <span className={`text-lg font-bold ${
                  result.metrics.canonicalPresent ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {result.metrics.canonicalPresent ? 'Yes' : 'No'}
                </span>
              </div>
              <div className={`text-xs text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''} mt-1`}>
                Duplicate content prevention
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Structured Data
                </span>
                <span className={`text-lg font-bold ${
                  result.metrics.structuredDataCount > 0 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {result.metrics.structuredDataCount}
                </span>
              </div>
              <div className={`text-xs text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''} mt-1`}>
                Schema.org implementations
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  HTTP Status
                </span>
                <span className={`text-lg font-bold ${
                  result.metrics.responseCode === 200 ? 'text-green-600' :
                  result.metrics.responseCode >= 300 && result.metrics.responseCode < 400 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {result.metrics.responseCode}
                </span>
              </div>
              <div className={`text-xs text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''} mt-1`}>
                Server response code
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Open Graph Tags
                </span>
                <span className={`text-lg font-bold ${
                  result.metrics.openGraphCount >= 4 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {result.metrics.openGraphCount}
                </span>
              </div>
              <div className={`text-xs text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''} mt-1`}>
                Social media optimization
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Hreflang Tags
                </span>
                <span className={`text-lg font-bold text-blue-600`}>
                  {result.metrics.hreflangCount}
                </span>
              </div>
              <div className={`text-xs text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''} mt-1`}>
                International SEO
              </div>
            </div>
          </div>
        </div>
      )}

      {result.issues.length === 0 && activeTab === 'overview' && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-8 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''} text-center`}>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className={`text-xl font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-2`}>
            Perfect Technical SEO!
          </h3>
          <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
            No technical issues found. Your page follows technical SEO best practices.
          </p>
        </div>
      )}
    </div>
  );
};

export default TechnicalSEOResults;