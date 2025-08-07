import React, { useState } from 'react';
import { Search, BarChart3, FileText, Settings, Moon, Sun, Download, AlertCircle, CheckCircle, Clock, Zap, Target, User } from 'lucide-react';
import { TechnicalSEOAnalyzer, TechnicalSEOResult } from './utils/technicalSeoAnalyzer';
import { QuickWinsAnalyzer, QuickWinsResult } from './utils/quickWinsAnalyzer';
import { BlogContentAnalyzer, BlogContentResult } from './utils/blogContentAnalyzer';
import { PageSpeedAnalyzer, PageSpeedResult } from './utils/pageSpeedAnalyzer';
import { SiteAnalyzer, SiteAnalysisResult } from './utils/siteAnalyzer';
import TechnicalSEOResults from './components/TechnicalSEOResults';
import QuickWinsResults from './components/QuickWinsResults';
import BlogContentResults from './components/BlogContentResults';
import PageSpeedResults from './components/PageSpeedResults';
import SiteAnalysisResults from './components/SiteAnalysisResults';

interface TechnicalAuditResult extends TechnicalSEOResult {
  id: string;
}

interface QuickWinsAuditResult extends QuickWinsResult {
  id: string;
}

interface BlogContentAuditResult extends BlogContentResult {
  id: string;
}

interface PageSpeedAuditResult extends PageSpeedResult {
  id: string;
}

interface SiteAnalysisAuditResult extends SiteAnalysisResult {
  id: string;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [technicalResults, setTechnicalResults] = useState<TechnicalAuditResult[]>([]);
  const [quickWinsResults, setQuickWinsResults] = useState<QuickWinsAuditResult[]>([]);
  const [blogContentResults, setBlogContentResults] = useState<BlogContentAuditResult[]>([]);
  const [pageSpeedResults, setPageSpeedResults] = useState<PageSpeedAuditResult[]>([]);
  const [siteAnalysisResults, setSiteAnalysisResults] = useState<SiteAnalysisAuditResult[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditUrl, setAuditUrl] = useState('');
  const [currentTechnicalResult, setCurrentTechnicalResult] = useState<TechnicalAuditResult | null>(null);
  const [currentQuickWinsResult, setCurrentQuickWinsResult] = useState<QuickWinsAuditResult | null>(null);
  const [currentBlogContentResult, setCurrentBlogContentResult] = useState<BlogContentAuditResult | null>(null);
  const [currentPageSpeedResult, setCurrentPageSpeedResult] = useState<PageSpeedAuditResult | null>(null);
  const [currentSiteAnalysisResult, setCurrentSiteAnalysisResult] = useState<SiteAnalysisAuditResult | null>(null);
  
  const technicalAnalyzer = new TechnicalSEOAnalyzer();
  const quickWinsAnalyzer = new QuickWinsAnalyzer();
  const blogContentAnalyzer = new BlogContentAnalyzer();
  const pageSpeedAnalyzer = new PageSpeedAnalyzer();
  const siteAnalyzer = new SiteAnalyzer();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const runTechnicalAudit = async (url: string) => {
    setIsAuditing(true);
    setCurrentTechnicalResult(null);
    
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const result = await technicalAnalyzer.analyzePage(url);
      const auditResult: TechnicalAuditResult = {
        ...result,
        id: Date.now().toString()
      };
      
      setTechnicalResults(prev => [auditResult, ...prev]);
      setCurrentTechnicalResult(auditResult);
      setCurrentView('technical-results');
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  const runQuickWinsAudit = async (url: string) => {
    setIsAuditing(true);
    setCurrentQuickWinsResult(null);
    
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const result = await quickWinsAnalyzer.analyzeQuickWins(url);
      const auditResult: QuickWinsAuditResult = {
        ...result,
        id: Date.now().toString()
      };
      
      setQuickWinsResults(prev => [auditResult, ...prev]);
      setCurrentQuickWinsResult(auditResult);
      setCurrentView('quick-wins-results');
    } catch (error) {
      console.error('Quick wins audit failed:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  const runBlogContentAudit = async (url: string) => {
    setIsAuditing(true);
    setCurrentBlogContentResult(null);
    
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const result = await blogContentAnalyzer.analyzeContent(url);
      const auditResult: BlogContentAuditResult = {
        ...result,
        id: Date.now().toString()
      };
      
      setBlogContentResults(prev => [auditResult, ...prev]);
      setCurrentBlogContentResult(auditResult);
      setCurrentView('blog-content-results');
    } catch (error) {
      console.error('Blog content audit failed:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  const runPageSpeedAudit = async (url: string) => {
    setIsAuditing(true);
    setCurrentPageSpeedResult(null);
    
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const result = await pageSpeedAnalyzer.analyzePage(url);
      const auditResult: PageSpeedAuditResult = {
        ...result,
        id: Date.now().toString()
      };
      
      setPageSpeedResults(prev => [auditResult, ...prev]);
      setCurrentPageSpeedResult(auditResult);
      setCurrentView('page-speed-results');
    } catch (error) {
      console.error('Page speed audit failed:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  const runSiteAnalysisAudit = async (url: string) => {
    setIsAuditing(true);
    setCurrentSiteAnalysisResult(null);
    
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const result = await siteAnalyzer.analyzeSite(url);
      const auditResult: SiteAnalysisAuditResult = {
        ...result,
        id: Date.now().toString()
      };
      
      setSiteAnalysisResults(prev => [auditResult, ...prev]);
      setCurrentSiteAnalysisResult(auditResult);
      setCurrentView('site-analysis-results');
    } catch (error) {
      console.error('Site analysis audit failed:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  const downloadQuickWinsCSV = () => {
    if (!currentQuickWinsResult) return;
    
    const csvContent = quickWinsAnalyzer.generateCSVReport(currentQuickWinsResult);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `seo-quick-wins-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const AuditCard = ({ title, description, icon: Icon, onClick, color = 'blue' }: any) => (
    <div 
      className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''} group`}
      onClick={onClick}
    >
      <div className={`w-12 h-12 bg-${color}-100 ${darkMode ? `dark:bg-${color}-900` : ''} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 text-${color}-600 ${darkMode ? `dark:text-${color}-400` : ''}`} />
      </div>
      <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-2`}>{title}</h3>
      <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} text-sm`}>{description}</p>
    </div>
  );

  const Dashboard = () => (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className={`text-4xl font-bold text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>
              Charlie's SEO Suite
            </h1>
            <p className={`text-lg text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
              Professional SEO Analysis Platform
            </p>
          </div>
        </div>
        <p className={`text-xl text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
          Comprehensive SEO analysis tools for technical optimization, content auditing, and performance insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AuditCard
          title="Technical SEO"
          description="Comprehensive technical SEO analysis including indexability, canonicalization, and structured data"
          icon={Settings}
          onClick={() => setCurrentView('technical-audit')}
          color="teal"
        />
        <AuditCard
          title="Quick Wins"
          description="Easy-to-implement SEO improvements with immediate impact and downloadable action plan"
          icon={Target}
          onClick={() => setCurrentView('quick-wins-audit')}
          color="green"
        />
        <AuditCard
          title="Blog Content Audit"
          description="Scan blog posts for thin content, missing meta descriptions, and content quality issues"
          icon={FileText}
          onClick={() => setCurrentView('content-audit')}
          color="blue"
        />
        <AuditCard
          title="Page Speed"
          description="Performance analysis and optimization recommendations"
          icon={Zap}
          onClick={() => setCurrentView('page-speed-audit')}
          color="orange"
        />
        <AuditCard
          title="Site Crawling"
          description="Robots.txt, sitemap, and crawl status verification"
          icon={Search}
          onClick={() => setCurrentView('site-analysis')}
          color="purple"
        />
        <AuditCard
          title="Reports"
          description="Download detailed PDF and CSV reports"
          icon={Download}
          onClick={() => setCurrentView('reports')}
          color="green"
        />
        <AuditCard
          title="Changelog"
          description="View latest updates and version history"
          icon={BarChart3}
          onClick={() => setCurrentView('changelog')}
          color="red"
        />
      </div>

      {(technicalResults.length > 0 || quickWinsResults.length > 0 || blogContentResults.length > 0) && (
        <div className="mt-12">
          <h2 className={`text-2xl font-bold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-6`}>Charlie's Recent Audits</h2>
          <div className="grid gap-4">
            {[...technicalResults, ...quickWinsResults, ...blogContentResults, ...pageSpeedResults, ...siteAnalysisResults]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 3)
              .map((result) => (
              <div key={result.id} className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>{result.url}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    ('overallScore' in result ? result.overallScore : result.score) >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    ('overallScore' in result ? result.overallScore : result.score) >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    Score: {'overallScore' in result ? result.overallScore : result.score}
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                  <span>
                    {'quickWins' in result ? `${result.quickWins.length} quick wins` : 
                     'posts' in result ? `${result.scannedPosts} posts scanned` :
                     'coreWebVitals' in result ? `${result.actionableItems.length} performance issues` :
                     'crawlability' in result ? `${result.actionableItems.length} crawl issues` :
                     `${result.issues.length} issues found`}
                  </span>
                  <span>{new Date(result.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const AuditForm = ({ title, description, onSubmit }: { title: string; description: string; onSubmit: (url: string) => void }) => (
    <div className="max-w-2xl mx-auto">
      <h2 className={`text-3xl font-bold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-8 text-center`}>{title}</h2>
      <p className={`text-center text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mb-8`}>{description}</p>
      <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-8 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''} mb-2`}>
              Website URL
            </label>
            <input
              type="url"
              value={auditUrl}
              onChange={(e) => setAuditUrl(e.target.value)}
              placeholder="example.com or https://example.com"
              className={`w-full px-4 py-3 border border-gray-300 ${darkMode ? 'dark:border-gray-600 dark:bg-gray-700 dark:text-white' : ''} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <button
            onClick={() => onSubmit(auditUrl)}
            disabled={!auditUrl || isAuditing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isAuditing ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Start Audit</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {isAuditing && (
        <div className={`mt-6 bg-blue-50 ${darkMode ? 'dark:bg-blue-900/20' : ''} p-4 rounded-lg`}>
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <p className={`font-medium text-blue-900 ${darkMode ? 'dark:text-blue-300' : ''}`}>
                Analyzing your website...
              </p>
              <p className={`text-sm text-blue-700 ${darkMode ? 'dark:text-blue-400' : ''}`}>
                Checking meta tags, headers, images, links, and more
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const Changelog = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className={`text-3xl font-bold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-8 text-center`}>Changelog</h2>
      <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-8 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
        <div className="space-y-8">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">1.0</span>
            </div>
            <div>
              <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-2`}>
                Version 1.0.0 - Charlie's SEO Suite Launch
              </h3>
              <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''} mb-3`}>January 2025</p>
              <ul className={`text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''} space-y-1`}>
                <li>• Blog content audit with automatic post discovery and analysis</li>
                <li>• Technical SEO analysis with indexability checks</li>
                <li>• Quick wins analyzer with downloadable CSV reports</li>
                <li>• Dark mode support and responsive design</li>
                <li>• Personalized interface designed for Charlie</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Reports = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className={`text-3xl font-bold text-gray-900 ${darkMode ? 'dark:text-white' : ''} mb-8 text-center`}>Reports</h2>
      <div className="grid gap-6">
        {[...technicalResults, ...quickWinsResults, ...blogContentResults]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map((result) => (
          <div key={result.id} className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} p-6 rounded-xl shadow-lg border border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-lg font-semibold text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>{result.url}</h3>
                <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>{new Date(result.timestamp).toLocaleDateString()}</p>
                <p className={`text-sm text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''}`}>
                  {'quickWins' in result ? 'Quick Wins Analysis' : 
                   'posts' in result ? 'Blog Content Audit' :
                   'Technical SEO Audit'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                {'quickWins' in result && (
                  <button 
                    onClick={() => {
                      const csvContent = quickWinsAnalyzer.generateCSVReport(result);
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      const url = URL.createObjectURL(blob);
                      link.setAttribute('href', url);
                      link.setAttribute('download', `seo-quick-wins-${new Date(result.timestamp).toISOString().split('T')[0]}.csv`);
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>CSV</span>
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`text-2xl font-bold ${
                  ('overallScore' in result ? result.overallScore : result.score) >= 80 ? 'text-green-600' :
                  ('overallScore' in result ? result.overallScore : result.score) >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {'overallScore' in result ? result.overallScore : result.score}
                </div>
                <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>Overall Score</div>
              </div>
              {'quickWins' in result ? (
                <>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {'posts' in result ? result.scannedPosts : result.summary.easyWins}
                    </div>
                    <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                      {'posts' in result ? 'Posts Scanned' : 'Easy Wins'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {'posts' in result ? result.summary.thinContent : result.summary.highImpact}
                    </div>
                    <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                      {'posts' in result ? 'Thin Content' : 'High Impact'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{result.issues.filter(i => i.type === 'error').length}</div>
                    <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>Errors</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{result.issues.filter(i => i.type === 'warning').length}</div>
                    <div className={`text-sm text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>Warnings</div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        {technicalResults.length === 0 && quickWinsResults.length === 0 && blogContentResults.length === 0 && (
          <div className={`text-center py-12 text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''}`}>
            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No reports available yet, Charlie. Run your first audit to get started!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'technical-audit':
        return (
          <AuditForm 
            title="Technical SEO Audit" 
            description="Comprehensive analysis of indexability, canonicalization, structured data, and technical SEO factors"
            onSubmit={runTechnicalAudit} 
          />
        );
      case 'quick-wins-audit':
        return (
          <AuditForm 
            title="SEO Quick Wins Analysis" 
            description="Identify easy-to-implement SEO improvements with high impact and generate downloadable action plans"
            onSubmit={runQuickWinsAudit} 
          />
        );
      case 'content-audit':
        return (
          <AuditForm 
            title="Blog Content Audit" 
            description="Automatically find and analyze blog posts for content quality, SEO optimization, and structure"
            onSubmit={runBlogContentAudit} 
          />
        );
      case 'page-speed-audit':
        return (
          <AuditForm 
            title="Page Speed Audit" 
            description="Performance analysis and optimization recommendations"
            onSubmit={runPageSpeedAudit} 
          />
        );
      case 'site-analysis':
        return (
          <AuditForm 
            title="Site Analysis" 
            description="Robots.txt, sitemap, and crawl status verification"
            onSubmit={runSiteAnalysisAudit} 
          />
        );
      case 'technical-results':
        return currentTechnicalResult ? <TechnicalSEOResults result={currentTechnicalResult} darkMode={darkMode} /> : <Dashboard />;
      case 'quick-wins-results':
        return currentQuickWinsResult ? <QuickWinsResults result={currentQuickWinsResult} darkMode={darkMode} onDownloadCSV={downloadQuickWinsCSV} /> : <Dashboard />;
      case 'blog-content-results':
        return currentBlogContentResult ? <BlogContentResults result={currentBlogContentResult} darkMode={darkMode} /> : <Dashboard />;
      case 'page-speed-results':
        return currentPageSpeedResult ? <PageSpeedResults result={currentPageSpeedResult} darkMode={darkMode} /> : <Dashboard />;
      case 'site-analysis-results':
        return currentSiteAnalysisResult ? <SiteAnalysisResults result={currentSiteAnalysisResult} darkMode={darkMode} /> : <Dashboard />;
      case 'reports':
        return <Reports />;
      case 'changelog':
        return <Changelog />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <header className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} shadow-sm border-b border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold text-gray-900 ${darkMode ? 'dark:text-white' : ''}`}>Charlie's SEO Suite</h1>
                <p className={`text-xs text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''}`}>v1.0.0</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''} hover:text-blue-600 ${darkMode ? 'dark:hover:text-blue-400' : ''} transition-colors ${currentView === 'dashboard' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('reports')}
                className={`text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''} hover:text-blue-600 ${darkMode ? 'dark:hover:text-blue-400' : ''} transition-colors ${currentView === 'reports' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}`}
              >
                Reports
              </button>
              {(currentTechnicalResult || currentQuickWinsResult || currentBlogContentResult) && (
                <button
                  onClick={() => setCurrentView(
                    currentBlogContentResult ? 'blog-content-results' :
                    currentQuickWinsResult ? 'quick-wins-results' : 'technical-results'
                  )}
                  className={`text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''} hover:text-blue-600 ${darkMode ? 'dark:hover:text-blue-400' : ''} transition-colors ${(currentView === 'technical-results' || currentView === 'quick-wins-results' || currentView === 'blog-content-results') ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}`}
                >
                  Latest Results
                </button>
              )}
              <button
                onClick={() => setCurrentView('changelog')}
                className={`text-gray-700 ${darkMode ? 'dark:text-gray-300' : ''} hover:text-blue-600 ${darkMode ? 'dark:hover:text-blue-400' : ''} transition-colors ${currentView === 'changelog' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}`}
              >
                Changelog
              </button>
            </nav>

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:bg-gray-200 ${darkMode ? 'dark:hover:bg-gray-600' : ''} transition-colors`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>

      <footer className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} border-t border-gray-200 ${darkMode ? 'dark:border-gray-700' : ''} mt-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-400' : ''}`}>
              Charlie's SEO Suite - Professional SEO Analysis Platform
            </p>
            <p className={`text-sm text-gray-500 ${darkMode ? 'dark:text-gray-500' : ''} mt-2`}>
              Crafted for Charlie with React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;