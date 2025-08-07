import React, { useState } from 'react';
import { Search, Globe, FileText, AlertTriangle, CheckCircle, Shield, Link, Target, List, Activity, Settings } from 'lucide-react';
import { SiteAnalysisResult, SiteAnalysisIssue } from '../utils/siteAnalyzer';

interface SiteAnalysisResultsProps {
  result: SiteAnalysisResult;
  darkMode: boolean;
}

const SiteAnalysisResults: React.FC<SiteAnalysisResultsProps> = ({ result, darkMode }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'crawlability' | 'indexability' | 'actionables' | 'all-checks'>('overview');

  const getIssueIcon = (type: SiteAnalysisIssue['type']) => {
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

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-red-500" />
    );
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
              Site Crawling & Indexing Analysis
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
              Crawlability Score
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
        <div className="flex flex-wrap gap-2">
          <TabButton
            id="overview"
            label="Overview"
            icon={Activity}
            isActive={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            id="crawlability"
            label="Crawlability"
            icon={Search}
            isActive={activeTab === 'crawlability'}
            onClick={setActiveTab}
          />
          <TabButton
            id="indexability"
            label="Indexability"
            icon={Globe}
            isActive={activeTab === 'indexability'}
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
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Site Issues */}
          <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
            <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
              <AlertTriangle className="w-5 h-5 mr-2" />
              Site Analysis Issues ({result.issues.length})
            </h3>
            
            {result.issues.length > 0 ? (
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
                          <p className={`text-sm text-blue-700 ${darkMode ? 'dark:text-blue-300' : ''}`}>
                            <strong>🔧 Fix:</strong> {issue.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-2`}>
                  Excellent Site Structure!
                </h4>
                <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  No crawling or indexing issues found.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'crawlability' && (
        <div className="space-y-6">
          {/* Robots.txt Analysis */}
          <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
            <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
              <Shield className="w-5 h-5 mr-2" />
              Robots.txt Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {getStatusIcon(result.crawlability.robotsTxtExists)}
                <div>
                  <div className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                    File Exists
                  </div>
                  <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                    {result.crawlability.robotsTxtExists ? 'Found' : 'Not found'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {getStatusIcon(result.crawlability.robotsTxtAccessible)}
                <div>
                  <div className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                    Accessible
                  </div>
                  <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                    {result.crawlability.robotsTxtAccessible ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {getStatusIcon(result.crawlability.robotsTxtValid)}
                <div>
                  <div className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                    Valid Syntax
                  </div>
                  <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                    {result.crawlability.robotsTxtValid ? 'Valid' : 'Invalid'}
                  </div>
                </div>
              </div>
            </div>

            {result.crawlability.crawlDirectives.length > 0 && (
              <div>
                <h4 className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-2`}>
                  Crawl Directives
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <code className={`text-sm text-gray-800 ${darkMode ? 'dark:text-gray-200' : ''}`}>
                    {result.crawlability.crawlDirectives.map((directive, index) => (
                      <div key={index}>{directive}</div>
                    ))}
                  </code>
                </div>
              </div>
            )}
          </div>

          {/* XML Sitemap Analysis */}
          <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
            <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
              <FileText className="w-5 h-5 mr-2" />
              XML Sitemap Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {getStatusIcon(result.crawlability.sitemapExists)}
                <div>
                  <div className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                    Sitemap Exists
                  </div>
                  <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                    {result.crawlability.sitemapExists ? 'Found' : 'Not found'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {getStatusIcon(result.crawlability.sitemapAccessible)}
                <div>
                  <div className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                    Accessible
                  </div>
                  <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                    {result.crawlability.sitemapAccessible ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {getStatusIcon(result.crawlability.sitemapValid)}
                <div>
                  <div className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                    Valid XML
                  </div>
                  <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                    {result.crawlability.sitemapValid ? 'Valid' : 'Invalid'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'indexability' && (
        <div className="space-y-6">
          {/* Indexability Overview */}
          <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
            <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
              <Globe className="w-5 h-5 mr-2" />
              Indexability Status
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {result.indexability.indexablePages}
                </div>
                <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Indexable Pages
                </div>
              </div>
              
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {result.indexability.blockedPages}
                </div>
                <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Blocked Pages
                </div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {result.indexability.redirects}
                </div>
                <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Redirects
                </div>
              </div>
              
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {result.indexability.errors}
                </div>
                <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Errors
                </div>
              </div>
            </div>
          </div>

          {/* Site Structure */}
          <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
            <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
              <Settings className="w-5 h-5 mr-2" />
              Site Structure
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {result.siteStructure.internalLinks}
                </div>
                <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Internal Links
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {result.siteStructure.externalLinks}
                </div>
                <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  External Links
                </div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {result.siteStructure.depth}
                </div>
                <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Site Depth
                </div>
              </div>
              
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {result.siteStructure.brokenLinks}
                </div>
                <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                  Broken Links
                </div>
              </div>
            </div>
          </div>
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
                No Action Required
              </h4>
              <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                All crawling and indexing checks are passing.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'all-checks' && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
          <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
            <List className="w-5 h-5 mr-2" />
            All Site Checks ({result.allChecks.length})
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

export default SiteAnalysisResults;