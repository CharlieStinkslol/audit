export interface SiteAnalysisIssue {
  type: 'error' | 'warning' | 'info' | 'success';
  category: 'crawling' | 'indexing' | 'sitemap' | 'robots' | 'redirects' | 'structure';
  message: string;
  priority: 'high' | 'medium' | 'low';
  element?: string;
  recommendation?: string;
  impact: string;
  actionable: boolean;
  checkName: string;
  status: 'passed' | 'failed' | 'warning' | 'info';
}

export interface SiteAnalysisResult {
  url: string;
  score: number;
  issues: SiteAnalysisIssue[];
  actionableItems: SiteAnalysisIssue[];
  allChecks: {
    name: string;
    status: 'passed' | 'failed' | 'warning' | 'info';
    description: string;
    result: string;
    impact: string;
    recommendation?: string;
  }[];
  crawlability: {
    robotsTxtExists: boolean;
    robotsTxtAccessible: boolean;
    robotsTxtValid: boolean;
    sitemapExists: boolean;
    sitemapAccessible: boolean;
    sitemapValid: boolean;
    crawlDirectives: string[];
    blockedResources: string[];
  };
  indexability: {
    indexablePages: number;
    blockedPages: number;
    redirects: number;
    errors: number;
    canonicalIssues: number;
  };
  siteStructure: {
    depth: number;
    internalLinks: number;
    externalLinks: number;
    brokenLinks: number;
    orphanPages: number;
  };
  timestamp: string;
}

export class SiteAnalyzer {
  private corsProxies = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
  ];

  private allChecks: {
    name: string;
    status: 'passed' | 'failed' | 'warning' | 'info';
    description: string;
    result: string;
    impact: string;
    recommendation?: string;
  }[] = [];

  private async fetchWithProxy(url: string, timeout = 15000): Promise<{ content: string; status: number }> {
    try {
      const response = await this.fetchWithTimeout(url, 5000);
      const content = await response.text();
      return { content, status: response.status };
    } catch (directError) {
      console.log('Direct fetch failed, trying proxies...');
    }

    for (const proxy of this.corsProxies) {
      try {
        const proxyUrl = proxy + encodeURIComponent(url);
        const response = await this.fetchWithTimeout(proxyUrl, timeout);
        
        let content: string;
        let status = 200;
        
        if (proxy.includes('allorigins.win')) {
          const data = await response.json();
          content = data.contents;
          status = data.status?.http_code || 200;
        } else {
          content = await response.text();
          status = response.status;
        }
        
        return { content, status };
      } catch (error) {
        console.log(`Proxy ${proxy} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All proxy attempts failed.');
  }

  private async fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEO-Analyzer/1.0)'
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private addCheck(name: string, status: 'passed' | 'failed' | 'warning' | 'info', description: string, result: string, impact: string, recommendation?: string) {
    this.allChecks.push({
      name,
      status,
      description,
      result,
      impact,
      recommendation
    });
  }

  private async analyzeRobotsTxt(baseUrl: string): Promise<{ issues: SiteAnalysisIssue[]; robotsData: any }> {
    const issues: SiteAnalysisIssue[] = [];
    const robotsUrl = new URL('/robots.txt', baseUrl).href;
    
    try {
      const { content, status } = await this.fetchWithProxy(robotsUrl);
      
      if (status === 404) {
        this.addCheck('Robots.txt File', 'warning', 'Check for robots.txt file existence', 'File not found (404)', 'Search engines may crawl unintended pages', 'Create a robots.txt file to guide search engine crawling');
        issues.push({
          type: 'warning',
          category: 'robots',
          message: 'robots.txt file not found',
          priority: 'medium',
          impact: 'Search engines may crawl unintended pages or waste crawl budget',
          recommendation: 'Create a robots.txt file to guide search engine crawling',
          actionable: true,
          checkName: 'Robots.txt File',
          status: 'warning'
        });
        
        return {
          issues,
          robotsData: {
            exists: false,
            accessible: false,
            valid: false,
            directives: [],
            sitemaps: []
          }
        };
      } else if (status !== 200) {
        this.addCheck('Robots.txt File', 'failed', 'Check for robots.txt file accessibility', `HTTP ${status} error`, 'Robots.txt cannot be accessed by search engines', 'Fix server configuration to serve robots.txt properly');
        issues.push({
          type: 'error',
          category: 'robots',
          message: `robots.txt returns HTTP ${status} error`,
          priority: 'high',
          impact: 'Search engines cannot access crawling instructions',
          recommendation: 'Fix server configuration to serve robots.txt with 200 status',
          actionable: true,
          checkName: 'Robots.txt File',
          status: 'failed'
        });
        
        return {
          issues,
          robotsData: {
            exists: true,
            accessible: false,
            valid: false,
            directives: [],
            sitemaps: []
          }
        };
      }

      // Parse robots.txt content
      const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
      const directives: string[] = [];
      const sitemaps: string[] = [];
      let hasUserAgent = false;
      let hasDisallow = false;

      lines.forEach(line => {
        const [directive, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        
        if (directive.toLowerCase() === 'user-agent') {
          hasUserAgent = true;
          directives.push(`User-agent: ${value}`);
        } else if (directive.toLowerCase() === 'disallow') {
          hasDisallow = true;
          directives.push(`Disallow: ${value}`);
        } else if (directive.toLowerCase() === 'allow') {
          directives.push(`Allow: ${value}`);
        } else if (directive.toLowerCase() === 'sitemap') {
          sitemaps.push(value);
        } else if (directive.toLowerCase() === 'crawl-delay') {
          directives.push(`Crawl-delay: ${value}`);
        }
      });

      if (!hasUserAgent) {
        this.addCheck('Robots.txt Syntax', 'warning', 'Check robots.txt syntax and structure', 'Missing User-agent directive', 'Robots.txt may not work as expected', 'Add User-agent directive to robots.txt');
        issues.push({
          type: 'warning',
          category: 'robots',
          message: 'robots.txt missing User-agent directive',
          priority: 'medium',
          impact: 'Crawling directives may not be applied correctly',
          recommendation: 'Add "User-agent: *" or specific user-agent directives',
          actionable: true,
          checkName: 'Robots.txt Syntax',
          status: 'warning'
        });
      }

      if (sitemaps.length === 0) {
        this.addCheck('Robots.txt Sitemap', 'info', 'Check for sitemap references in robots.txt', 'No sitemap references found', 'Missing opportunity to guide search engines', 'Add sitemap references to robots.txt');
        issues.push({
          type: 'info',
          category: 'robots',
          message: 'No sitemap references in robots.txt',
          priority: 'low',
          impact: 'Missing opportunity to help search engines discover sitemap',
          recommendation: 'Add "Sitemap: [URL]" entries to robots.txt',
          actionable: true,
          checkName: 'Robots.txt Sitemap',
          status: 'info'
        });
      } else {
        this.addCheck('Robots.txt Sitemap', 'passed', 'Check for sitemap references in robots.txt', `${sitemaps.length} sitemap(s) referenced`, 'Good sitemap discovery');
      }

      this.addCheck('Robots.txt File', 'passed', 'Check for robots.txt file existence', 'File exists and accessible', 'Proper crawling guidance for search engines');

      return {
        issues,
        robotsData: {
          exists: true,
          accessible: true,
          valid: hasUserAgent,
          directives,
          sitemaps
        }
      };

    } catch (error) {
      this.addCheck('Robots.txt File', 'failed', 'Check for robots.txt file existence', 'Failed to fetch robots.txt', 'Cannot verify crawling directives', 'Check server configuration and accessibility');
      issues.push({
        type: 'error',
        category: 'robots',
        message: 'Failed to fetch robots.txt',
        priority: 'high',
        impact: 'Cannot verify crawling directives',
        recommendation: 'Check server configuration and ensure robots.txt is accessible',
        actionable: true,
        checkName: 'Robots.txt File',
        status: 'failed'
      });

      return {
        issues,
        robotsData: {
          exists: false,
          accessible: false,
          valid: false,
          directives: [],
          sitemaps: []
        }
      };
    }
  }

  private async analyzeSitemap(baseUrl: string, sitemapUrls: string[] = []): Promise<{ issues: SiteAnalysisIssue[]; sitemapData: any }> {
    const issues: SiteAnalysisIssue[] = [];
    
    // Common sitemap locations
    const commonSitemapUrls = [
      '/sitemap.xml',
      '/sitemap_index.xml',
      '/sitemap.txt',
      '/sitemaps.xml'
    ];

    const urlsToCheck = sitemapUrls.length > 0 ? sitemapUrls : commonSitemapUrls.map(path => new URL(path, baseUrl).href);

    let sitemapFound = false;
    let sitemapAccessible = false;
    let sitemapValid = false;
    let urlCount = 0;

    for (const sitemapUrl of urlsToCheck) {
      try {
        const { content, status } = await this.fetchWithProxy(sitemapUrl);
        
        if (status === 200) {
          sitemapFound = true;
          sitemapAccessible = true;
          
          // Basic XML validation
          if (content.includes('<urlset') || content.includes('<sitemapindex')) {
            sitemapValid = true;
            
            // Count URLs (basic count)
            const urlMatches = content.match(/<url>/g);
            if (urlMatches) {
              urlCount += urlMatches.length;
            }
            
            this.addCheck('XML Sitemap', 'passed', 'Check for XML sitemap existence and validity', `Valid sitemap found with ${urlCount} URLs`, 'Good site structure discovery for search engines');
            break;
          } else {
            this.addCheck('XML Sitemap', 'warning', 'Check for XML sitemap existence and validity', 'Sitemap found but may be invalid', 'Sitemap may not be processed correctly', 'Ensure sitemap follows XML sitemap protocol');
            issues.push({
              type: 'warning',
              category: 'sitemap',
              message: 'Sitemap found but appears to be invalid XML',
              priority: 'medium',
              impact: 'Search engines may not process sitemap correctly',
              recommendation: 'Validate sitemap XML structure and ensure it follows sitemap protocol',
              actionable: true,
              checkName: 'XML Sitemap',
              status: 'warning'
            });
          }
        }
      } catch (error) {
        continue; // Try next sitemap URL
      }
    }

    if (!sitemapFound) {
      this.addCheck('XML Sitemap', 'warning', 'Check for XML sitemap existence and validity', 'No sitemap found', 'Search engines may have difficulty discovering all pages', 'Create and submit an XML sitemap');
      issues.push({
        type: 'warning',
        category: 'sitemap',
        message: 'No XML sitemap found',
        priority: 'medium',
        impact: 'Search engines may have difficulty discovering all pages',
        recommendation: 'Create an XML sitemap and submit it to search engines',
        actionable: true,
        checkName: 'XML Sitemap',
        status: 'warning'
      });
    }

    return {
      issues,
      sitemapData: {
        exists: sitemapFound,
        accessible: sitemapAccessible,
        valid: sitemapValid,
        urlCount
      }
    };
  }

  private async analyzeSiteStructure(url: string): Promise<{ issues: SiteAnalysisIssue[]; structureData: any }> {
    const issues: SiteAnalysisIssue[] = [];
    
    try {
      const { content, status } = await this.fetchWithProxy(url);
      
      if (status !== 200) {
        this.addCheck('Site Accessibility', 'failed', 'Check if main site is accessible', `HTTP ${status} error`, 'Site cannot be crawled', 'Fix server issues to ensure site accessibility');
        issues.push({
          type: 'error',
          category: 'crawling',
          message: `Site returns HTTP ${status} error`,
          priority: 'high',
          impact: 'Site cannot be crawled by search engines',
          recommendation: 'Fix server configuration to return 200 status',
          actionable: true,
          checkName: 'Site Accessibility',
          status: 'failed'
        });
        
        return {
          issues,
          structureData: {
            accessible: false,
            internalLinks: 0,
            externalLinks: 0,
            depth: 0
          }
        };
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      
      // Analyze links
      const links = doc.querySelectorAll('a[href]');
      let internalLinks = 0;
      let externalLinks = 0;
      const baseUrl = new URL(url);

      links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        try {
          if (href.startsWith('http')) {
            const linkUrl = new URL(href);
            if (linkUrl.hostname === baseUrl.hostname) {
              internalLinks++;
            } else {
              externalLinks++;
            }
          } else if (href.startsWith('/') || (!href.includes('://') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:'))) {
            internalLinks++;
          }
        } catch (e) {
          // Invalid URL, skip
        }
      });

      // Check for navigation structure
      const nav = doc.querySelector('nav');
      const menu = doc.querySelector('[role="navigation"]') || doc.querySelector('.menu') || doc.querySelector('.navigation');
      
      if (!nav && !menu) {
        this.addCheck('Navigation Structure', 'warning', 'Check for clear navigation structure', 'No clear navigation found', 'Poor user experience and crawlability', 'Add clear navigation structure with nav element');
        issues.push({
          type: 'warning',
          category: 'structure',
          message: 'No clear navigation structure found',
          priority: 'medium',
          impact: 'Poor user experience and search engine crawlability',
          recommendation: 'Add clear navigation structure using nav element or ARIA roles',
          actionable: true,
          checkName: 'Navigation Structure',
          status: 'warning'
        });
      } else {
        this.addCheck('Navigation Structure', 'passed', 'Check for clear navigation structure', 'Navigation structure found', 'Good site structure for users and search engines');
      }

      // Check for breadcrumbs
      const breadcrumbs = doc.querySelector('[aria-label="breadcrumb"]') || doc.querySelector('.breadcrumb') || doc.querySelector('.breadcrumbs');
      if (!breadcrumbs && internalLinks > 10) {
        this.addCheck('Breadcrumb Navigation', 'info', 'Check for breadcrumb navigation', 'No breadcrumbs found', 'Missing navigation aid for complex sites', 'Consider adding breadcrumb navigation for better UX');
        issues.push({
          type: 'info',
          category: 'structure',
          message: 'No breadcrumb navigation found',
          priority: 'low',
          impact: 'Missing navigation aid for users and search engines',
          recommendation: 'Consider adding breadcrumb navigation for better user experience',
          actionable: true,
          checkName: 'Breadcrumb Navigation',
          status: 'info'
        });
      }

      this.addCheck('Site Accessibility', 'passed', 'Check if main site is accessible', 'Site accessible', 'Site can be properly crawled');

      return {
        issues,
        structureData: {
          accessible: true,
          internalLinks,
          externalLinks,
          depth: 1 // Simplified depth calculation
        }
      };

    } catch (error) {
      this.addCheck('Site Accessibility', 'failed', 'Check if main site is accessible', 'Failed to access site', 'Cannot analyze site structure', 'Check URL and server accessibility');
      issues.push({
        type: 'error',
        category: 'crawling',
        message: 'Failed to access site for analysis',
        priority: 'high',
        impact: 'Cannot analyze site structure and crawlability',
        recommendation: 'Check URL correctness and server accessibility',
        actionable: true,
        checkName: 'Site Accessibility',
        status: 'failed'
      });

      return {
        issues,
        structureData: {
          accessible: false,
          internalLinks: 0,
          externalLinks: 0,
          depth: 0
        }
      };
    }
  }

  public async analyzeSite(url: string): Promise<SiteAnalysisResult> {
    const issues: SiteAnalysisIssue[] = [];
    this.allChecks = [];
    
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const baseUrl = new URL(url).origin;

      // Analyze robots.txt
      const { issues: robotsIssues, robotsData } = await this.analyzeRobotsTxt(baseUrl);
      issues.push(...robotsIssues);

      // Analyze sitemap
      const { issues: sitemapIssues, sitemapData } = await this.analyzeSitemap(baseUrl, robotsData.sitemaps);
      issues.push(...sitemapIssues);

      // Analyze site structure
      const { issues: structureIssues, structureData } = await this.analyzeSiteStructure(url);
      issues.push(...structureIssues);

      const actionableItems = issues.filter(issue => issue.actionable);

      // Calculate score
      let score = 100;
      issues.forEach(issue => {
        switch (issue.type) {
          case 'error':
            score -= issue.priority === 'high' ? 20 : issue.priority === 'medium' ? 12 : 6;
            break;
          case 'warning':
            score -= issue.priority === 'high' ? 10 : issue.priority === 'medium' ? 6 : 3;
            break;
          case 'info':
            score -= 2;
            break;
        }
      });

      score = Math.max(0, Math.min(100, score));

      return {
        url,
        score,
        issues,
        actionableItems,
        allChecks: this.allChecks,
        crawlability: {
          robotsTxtExists: robotsData.exists,
          robotsTxtAccessible: robotsData.accessible,
          robotsTxtValid: robotsData.valid,
          sitemapExists: sitemapData.exists,
          sitemapAccessible: sitemapData.accessible,
          sitemapValid: sitemapData.valid,
          crawlDirectives: robotsData.directives,
          blockedResources: [] // Would need more detailed analysis
        },
        indexability: {
          indexablePages: sitemapData.urlCount || 1,
          blockedPages: 0, // Would need crawling to determine
          redirects: 0, // Would need crawling to determine
          errors: issues.filter(i => i.type === 'error').length,
          canonicalIssues: 0 // Would need page-by-page analysis
        },
        siteStructure: {
          depth: structureData.depth,
          internalLinks: structureData.internalLinks,
          externalLinks: structureData.externalLinks,
          brokenLinks: 0, // Would need link checking
          orphanPages: 0 // Would need full site crawl
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      this.addCheck('Site Analysis', 'failed', 'Analyze site crawlability and structure', 'Analysis failed', 'Unable to perform site analysis', 'Check if the URL is correct and accessible');
      
      issues.push({
        type: 'error',
        category: 'crawling',
        message: `Site analysis failed: ${errorMessage}`,
        priority: 'high',
        impact: 'Unable to perform site analysis',
        recommendation: 'Check if the URL is correct and accessible',
        actionable: true,
        checkName: 'Site Analysis',
        status: 'failed'
      });

      return {
        url,
        score: 0,
        issues,
        actionableItems: issues.filter(issue => issue.actionable),
        allChecks: this.allChecks,
        crawlability: {
          robotsTxtExists: false,
          robotsTxtAccessible: false,
          robotsTxtValid: false,
          sitemapExists: false,
          sitemapAccessible: false,
          sitemapValid: false,
          crawlDirectives: [],
          blockedResources: []
        },
        indexability: {
          indexablePages: 0,
          blockedPages: 0,
          redirects: 0,
          errors: 1,
          canonicalIssues: 0
        },
        siteStructure: {
          depth: 0,
          internalLinks: 0,
          externalLinks: 0,
          brokenLinks: 0,
          orphanPages: 0
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}