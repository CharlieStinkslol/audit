import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, Shield, Search, FileText, Settings, Globe, Link2, Zap } from 'lucide-react';
import { TechnicalSEOResult, TechnicalSEOIssue } from '../utils/technicalSeoAnalyzer';

interface TechnicalSEOResultsProps {
  result: TechnicalSEOResult;
  darkMode: boolean;
}

const TechnicalSEOResults: React.FC<TechnicalSEOResultsProps> = ({ result, darkMode }) => {
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
    security: 'Security'
  };

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
        
        {/* Technical Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-lg font-semibold ${result.metrics.httpsEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {result.metrics.httpsEnabled ? 'HTTPS' : 'HTTP'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Security</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-lg font-semibold ${result.metrics.canonicalPresent ? 'text-green-600' : 'text-red-600'}`}>
              {result.metrics.canonicalPresent ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Canonical</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {result.metrics.structuredDataCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Schema</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-lg font-semibold ${
              result.metrics.responseCode === 200 ? 'text-green-600' :
              result.metrics.responseCode >= 300 && result.metrics.responseCode < 400 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {result.metrics.responseCode}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Status</div>
          </div>
        </div>
      </div>

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

      {result.issues.length === 0 && (
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