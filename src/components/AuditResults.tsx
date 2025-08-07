import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, Clock, Globe, Image, Link, FileText, Settings } from 'lucide-react';
import { SEOAuditResult, SEOIssue } from '../utils/seoAnalyzer';

interface AuditResultsProps {
  result: SEOAuditResult;
  darkMode: boolean;
}

const AuditResults: React.FC<AuditResultsProps> = ({ result, darkMode }) => {
  const getIssueIcon = (type: SEOIssue['type']) => {
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

  const getCategoryIcon = (category: SEOIssue['category']) => {
    switch (category) {
      case 'meta':
        return <FileText className="w-4 h-4" />;
      case 'headers':
        return <FileText className="w-4 h-4" />;
      case 'images':
        return <Image className="w-4 h-4" />;
      case 'links':
        return <Link className="w-4 h-4" />;
      case 'performance':
        return <Clock className="w-4 h-4" />;
      case 'structure':
        return <Settings className="w-4 h-4" />;
      case 'indexability':
        return <Globe className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: SEOIssue['priority']) => {
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
  }, {} as Record<string, SEOIssue[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-2xl font-bold text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
              SEO Audit Results
            </h2>
            <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mt-1`}>
              {result.url}
            </p>
          </div>
          <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
            {result.score}
          </div>
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {result.metrics.titleLength}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Title Length</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {result.metrics.h1Count}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">H1 Tags</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {result.metrics.imageCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Images</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {result.metrics.loadTime}ms
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Load Time</div>
          </div>
        </div>
      </div>

      {/* Issues by Category */}
      {Object.entries(groupedIssues).map(([category, issues]) => (
        <div key={category} className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
          <div className="flex items-center space-x-2 mb-4">
            {getCategoryIcon(category as SEOIssue['category'])}
            <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} capitalize`}>
              {category.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${darkMode ? 'dark:bg-gray-700 dark:text-gray-300' : ''}`}>
              {issues.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                issue.type === 'error' ? 'bg-red-50 dark:bg-red-900/20' :
                issue.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                issue.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20' :
                'bg-green-50 dark:bg-green-900/20'
              }`}>
                {getIssueIcon(issue.type)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
                      {issue.message}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </span>
                  </div>
                  {issue.recommendation && (
                    <p className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                      💡 {issue.recommendation}
                    </p>
                  )}
                  {issue.element && (
                    <code className={`text-xs bg-gray-100 ${darkMode ? 'dark:bg-gray-700' : ''} px-2 py-1 rounded mt-1 inline-block`}>
                      {issue.element}
                    </code>
                  )}
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
            Perfect SEO Score!
          </h3>
          <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
            No issues found. Your page follows SEO best practices.
          </p>
        </div>
      )}
    </div>
  );
};

export default AuditResults;