import React from 'react';
import { FileText, AlertCircle, CheckCircle, Clock, BarChart3, Eye, Link, Image, TrendingDown, TrendingUp } from 'lucide-react';
import { BlogContentResult, BlogContentIssue, BlogPost } from '../utils/blogContentAnalyzer';

interface BlogContentResultsProps {
  result: BlogContentResult;
  darkMode: boolean;
}

const BlogContentResults: React.FC<BlogContentResultsProps> = ({ result, darkMode }) => {
  const getIssueIcon = (type: BlogContentIssue['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getContentQualityColor = (quality: BlogPost['contentQuality']) => {
    switch (quality) {
      case 'thin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'adequate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'comprehensive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: BlogContentIssue['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
              Blog Content Audit Results
            </h2>
            <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mt-1`}>
              {result.url}
            </p>
            {result.blogUrl && (
              <p className={`text-sm text-blue-600 ${darkMode ? 'dark:text-blue-400' : ''} mt-1`}>
                Blog found: {result.blogUrl}
              </p>
            )}
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
              {result.score}
            </div>
            <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
              Content Score
            </div>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-semibold text-blue-600">
              {result.scannedPosts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Posts Scanned</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-semibold text-green-600">
              {result.summary.averageWordCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Avg Words</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-lg font-semibold text-purple-600">
              {result.summary.averageReadingTime}m
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Avg Read Time</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-lg font-semibold text-red-600">
              {result.summary.thinContent}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Thin Content</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-lg font-semibold text-yellow-600">
              {result.summary.missingMetaDescriptions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Missing Meta</div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-lg font-semibold text-orange-600">
              {result.summary.poorStructure}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Poor Structure</div>
          </div>
        </div>
      </div>

      {/* Issues */}
      {result.issues.length > 0 && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
          <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
            <AlertCircle className="w-5 h-5 mr-2" />
            Content Issues Found ({result.issues.length})
          </h3>
          
          <div className="space-y-4">
            {result.issues.map((issue, index) => (
              <div key={index} className={`border-l-4 pl-4 py-3 ${
                issue.type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                issue.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
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
                    
                    <p className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mb-2`}>
                      💡 {issue.recommendation}
                    </p>
                    
                    {issue.affectedPosts.length > 0 && (
                      <div className="mt-2">
                        <p className={`text-xs font-medium text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''} mb-1`}>
                          Affected Posts ({issue.affectedPosts.length}):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {issue.affectedPosts.slice(0, 5).map((post, idx) => (
                            <span key={idx} className={`px-2 py-1 bg-gray-100 ${darkMode ? 'dark:bg-gray-700' : ''} rounded text-xs`}>
                              {post.length > 30 ? post.substring(0, 30) + '...' : post}
                            </span>
                          ))}
                          {issue.affectedPosts.length > 5 && (
                            <span className={`px-2 py-1 bg-gray-100 ${darkMode ? 'dark:bg-gray-700' : ''} rounded text-xs`}>
                              +{issue.affectedPosts.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Blog Posts */}
      <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
        <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-4 flex items-center`}>
          <FileText className="w-5 h-5 mr-2" />
          Individual Post Analysis ({result.posts.length})
        </h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {result.posts.map((post, index) => (
            <div key={index} className={`p-4 border border-gray-200 ${darkMode ? 'dark:border-gray-600' : ''} rounded-lg`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className={`font-medium text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-1`}>
                    {post.title}
                  </h4>
                  <a href={post.url} target="_blank" rel="noopener noreferrer" 
                     className={`text-sm text-blue-600 ${darkMode ? 'dark:text-blue-400' : ''} hover:underline`}>
                    {post.url.length > 60 ? post.url.substring(0, 60) + '...' : post.url}
                  </a>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContentQualityColor(post.contentQuality)}`}>
                  {post.contentQuality}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                <div className="flex items-center space-x-1">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                  <span className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                    {post.wordCount} words
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                    {post.readingTime}m read
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                    H1: {post.h1Count}, H2: {post.h2Count}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Image className="w-4 h-4 text-gray-500" />
                  <span className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                    {post.imageCount} images
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Link className="w-4 h-4 text-gray-500" />
                  <span className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                    {post.internalLinks} internal
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {post.hasMetaDescription ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                    Meta desc
                  </span>
                </div>
              </div>

              {/* Top Keywords */}
              {Object.keys(post.keywordDensity).length > 0 && (
                <div className="mt-3">
                  <p className={`text-xs font-medium text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''} mb-1`}>
                    Top Keywords:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(post.keywordDensity).slice(0, 5).map(([keyword, density]) => (
                      <span key={keyword} className={`px-2 py-1 bg-blue-100 ${darkMode ? 'dark:bg-blue-900' : ''} text-blue-800 ${darkMode ? 'dark:text-blue-300' : ''} rounded text-xs`}>
                        {keyword} ({density.toFixed(1)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {result.posts.length === 0 && (
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-8 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''} text-center`}>
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className={`text-xl font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-2`}>
            No Blog Content Found
          </h3>
          <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
            Unable to locate blog posts on this website. The site may not have a blog or it may be structured differently.
          </p>
        </div>
      )}
    </div>
  );
};

export default BlogContentResults;