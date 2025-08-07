export interface TechnicalSEOIssue {
  type: 'error' | 'warning' | 'info' | 'success';
  category: 'meta' | 'headers' | 'indexability' | 'structure' | 'crawlability' | 'canonicalization' | 'redirects' | 'security' | 'performance';
  message: string;
  priority: 'high' | 'medium' | 'low';
  element?: string;
  recommendation?: string;
  impact: string;
  actionable: boolean;
  checkName: string;
  status: 'passed' | 'failed' | 'warning' | 'info';
}

export interface TechnicalSEOResult {
  url: string;
  score: number;
  issues: TechnicalSEOIssue[];
  actionableItems: TechnicalSEOIssue[];
  allChecks: {
    name: string;
    status: 'passed' | 'failed' | 'warning' | 'info';
    description: string;
    result: string;
    impact: string;
    recommendation?: string;
  }[];
  metrics: {
    titleLength: number;
    descriptionLength: number;
    h1Count: number;
    canonicalPresent: boolean;
    robotsMetaPresent: boolean;
    structuredDataCount: number;
    httpsEnabled: boolean;
    responseCode: number;
    redirectCount: number;
    xmlSitemapDetected: boolean;
    robotsTxtAccessible: boolean;
    hreflangCount: number;
    openGraphCount: number;
  };
  timestamp: string;
}

export class TechnicalSEOAnalyzer {
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

  private async fetchWithProxy(url: string, timeout = 15000): Promise<{ html: string; status: number; loadTime: number }> {
    const startTime = Date.now();
    
    try {
      const response = await this.fetchWithTimeout(url, 5000);
      const html = await response.text();
      return {
        html,
        status: response.status,
        loadTime: Date.now() - startTime
      };
    } catch (directError) {
      console.log('Direct fetch failed, trying proxies...');
    }

    for (const proxy of this.corsProxies) {
      try {
        const proxyUrl = proxy + encodeURIComponent(url);
        const response = await this.fetchWithTimeout(proxyUrl, timeout);
        
        let html: string;
        let status = 200;
        
        if (proxy.includes('allorigins.win')) {
          const data = await response.json();
          html = data.contents;
          status = data.status?.http_code || 200;
        } else {
          html = await response.text();
          status = response.status;
        }
        
        return {
          html,
          status,
          loadTime: Date.now() - startTime
        };
      } catch (error) {
        console.log(`Proxy ${proxy} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All proxy attempts failed. The website may be blocking requests or temporarily unavailable.');
  }

  private async fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private parseHTML(html: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
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

  private analyzeIndexability(doc: Document, url: string, status: number): TechnicalSEOIssue[] {
    const issues: TechnicalSEOIssue[] = [];

    // HTTP Status Code Check
    if (status >= 400) {
      this.addCheck('HTTP Status Code', 'failed', 'Check if page returns successful HTTP status', `${status} Error`, 'Page cannot be indexed by search engines', 'Fix server configuration to return 200 status code');
      issues.push({
        type: 'error',
        category: 'indexability',
        message: `HTTP ${status} error - Page not accessible`,
        priority: 'high',
        impact: 'Page cannot be indexed by search engines',
        recommendation: 'Fix server configuration to return 200 status code',
        actionable: true,
        checkName: 'HTTP Status Code',
        status: 'failed'
      });
    } else if (status >= 300 && status < 400) {
      this.addCheck('HTTP Status Code', 'warning', 'Check if page returns successful HTTP status', `${status} Redirect`, 'May dilute link equity and slow crawling', 'Minimize redirect chains and use 301 redirects for permanent moves');
      issues.push({
        type: 'warning',
        category: 'redirects',
        message: `HTTP ${status} redirect detected`,
        priority: 'medium',
        impact: 'May dilute link equity and slow crawling',
        recommendation: 'Minimize redirect chains and use 301 redirects for permanent moves',
        actionable: true,
        checkName: 'HTTP Status Code',
        status: 'warning'
      });
    } else {
      this.addCheck('HTTP Status Code', 'passed', 'Check if page returns successful HTTP status', `${status} Success`, 'Page can be properly indexed');
      issues.push({
        type: 'success',
        category: 'indexability',
        message: `HTTP ${status} - Page accessible`,
        priority: 'low',
        impact: 'Page can be properly indexed',
        actionable: false,
        checkName: 'HTTP Status Code',
        status: 'passed'
      });
    }

    // HTTPS Check
    const isHttps = url.startsWith('https://');
    if (!isHttps) {
      this.addCheck('HTTPS Security', 'failed', 'Check if site uses HTTPS encryption', 'HTTP only', 'Security warning in browsers, negative ranking factor', 'Implement SSL certificate and redirect HTTP to HTTPS');
      issues.push({
        type: 'error',
        category: 'security',
        message: 'Site not using HTTPS',
        priority: 'high',
        impact: 'Security warning in browsers, negative ranking factor',
        recommendation: 'Implement SSL certificate and redirect HTTP to HTTPS',
        actionable: true,
        checkName: 'HTTPS Security',
        status: 'failed'
      });
    } else {
      this.addCheck('HTTPS Security', 'passed', 'Check if site uses HTTPS encryption', 'HTTPS enabled', 'Secure connection established');
      issues.push({
        type: 'success',
        category: 'security',
        message: 'HTTPS enabled',
        priority: 'low',
        impact: 'Secure connection established',
        actionable: false,
        checkName: 'HTTPS Security',
        status: 'passed'
      });
    }

    // Robots Meta Tag Check
    const robots = doc.querySelector('meta[name="robots"]');
    if (robots) {
      const robotsContent = robots.getAttribute('content') || '';
      if (robotsContent.includes('noindex')) {
        this.addCheck('Robots Meta - Indexing', 'failed', 'Check if page allows indexing', 'noindex directive found', 'Page will not appear in search results', 'Remove noindex directive if page should be indexed');
        issues.push({
          type: 'error',
          category: 'indexability',
          message: 'Page blocked from indexing (noindex)',
          priority: 'high',
          element: robotsContent,
          impact: 'Page will not appear in search results',
          recommendation: 'Remove noindex directive if page should be indexed',
          actionable: true,
          checkName: 'Robots Meta - Indexing',
          status: 'failed'
        });
      } else {
        this.addCheck('Robots Meta - Indexing', 'passed', 'Check if page allows indexing', 'No noindex directive', 'Page can be indexed');
      }

      if (robotsContent.includes('nofollow')) {
        this.addCheck('Robots Meta - Following', 'warning', 'Check if page allows link following', 'nofollow directive found', 'Search engines won\'t follow links on this page', 'Remove nofollow if links should pass authority');
        issues.push({
          type: 'warning',
          category: 'crawlability',
          message: 'Links blocked from following (nofollow)',
          priority: 'medium',
          element: robotsContent,
          impact: 'Search engines won\'t follow links on this page',
          recommendation: 'Remove nofollow if links should pass authority',
          actionable: true,
          checkName: 'Robots Meta - Following',
          status: 'warning'
        });
      } else {
        this.addCheck('Robots Meta - Following', 'passed', 'Check if page allows link following', 'No nofollow directive', 'Links can be followed');
      }
    } else {
      this.addCheck('Robots Meta - Indexing', 'passed', 'Check if page allows indexing', 'No robots restrictions', 'Page can be freely indexed and crawled');
      this.addCheck('Robots Meta - Following', 'passed', 'Check if page allows link following', 'No robots restrictions', 'Links can be followed');
      issues.push({
        type: 'success',
        category: 'indexability',
        message: 'No robots restrictions found',
        priority: 'low',
        impact: 'Page can be freely indexed and crawled',
        actionable: false,
        checkName: 'Robots Meta',
        status: 'passed'
      });
    }

    return issues;
  }

  private analyzeCanonicalization(doc: Document, url: string): TechnicalSEOIssue[] {
    const issues: TechnicalSEOIssue[] = [];

    const canonical = doc.querySelector('link[rel="canonical"]');
    if (!canonical) {
      this.addCheck('Canonical Tag', 'warning', 'Check for canonical URL specification', 'Missing canonical tag', 'Risk of duplicate content issues', 'Add canonical tag to specify preferred URL version');
      issues.push({
        type: 'warning',
        category: 'canonicalization',
        message: 'Missing canonical tag',
        priority: 'medium',
        impact: 'Risk of duplicate content issues',
        recommendation: 'Add canonical tag to specify preferred URL version',
        actionable: true,
        checkName: 'Canonical Tag',
        status: 'warning'
      });
    } else {
      const canonicalUrl = canonical.getAttribute('href');
      if (!canonicalUrl) {
        this.addCheck('Canonical Tag', 'failed', 'Check for canonical URL specification', 'Empty canonical tag', 'Invalid canonical signal to search engines', 'Add proper URL to canonical tag');
        issues.push({
          type: 'error',
          category: 'canonicalization',
          message: 'Empty canonical tag',
          priority: 'high',
          impact: 'Invalid canonical signal to search engines',
          recommendation: 'Add proper URL to canonical tag',
          actionable: true,
          checkName: 'Canonical Tag',
          status: 'failed'
        });
      } else {
        try {
          const canonicalUrlObj = new URL(canonicalUrl, url);
          const currentUrlObj = new URL(url);
          
          if (canonicalUrlObj.href !== currentUrlObj.href) {
            this.addCheck('Canonical Tag', 'info', 'Check for canonical URL specification', 'Points to different URL', 'This page defers authority to canonical URL', 'Verify canonical URL is correct');
            issues.push({
              type: 'info',
              category: 'canonicalization',
              message: 'Canonical points to different URL',
              priority: 'low',
              element: canonicalUrl,
              impact: 'This page defers authority to canonical URL',
              recommendation: 'Verify canonical URL is correct',
              actionable: false,
              checkName: 'Canonical Tag',
              status: 'info'
            });
          } else {
            this.addCheck('Canonical Tag', 'passed', 'Check for canonical URL specification', 'Self-referencing canonical', 'Clear canonical signal established');
            issues.push({
              type: 'success',
              category: 'canonicalization',
              message: 'Self-referencing canonical tag present',
              priority: 'low',
              element: canonicalUrl,
              impact: 'Clear canonical signal established',
              actionable: false,
              checkName: 'Canonical Tag',
              status: 'passed'
            });
          }
        } catch (e) {
          this.addCheck('Canonical Tag', 'failed', 'Check for canonical URL specification', 'Invalid URL format', 'Search engines cannot process canonical signal', 'Fix canonical URL format');
          issues.push({
            type: 'error',
            category: 'canonicalization',
            message: 'Invalid canonical URL format',
            priority: 'high',
            element: canonicalUrl,
            impact: 'Search engines cannot process canonical signal',
            recommendation: 'Fix canonical URL format',
            actionable: true,
            checkName: 'Canonical Tag',
            status: 'failed'
          });
        }
      }
    }

    return issues;
  }

  private analyzeMetaTags(doc: Document): TechnicalSEOIssue[] {
    const issues: TechnicalSEOIssue[] = [];

    // Title Tag Check
    const title = doc.querySelector('title');
    if (!title || !title.textContent?.trim()) {
      this.addCheck('Title Tag', 'failed', 'Check for page title', 'Missing title tag', 'No title will appear in search results', 'Add descriptive title tag (50-60 characters)');
      issues.push({
        type: 'error',
        category: 'meta',
        message: 'Missing title tag',
        priority: 'high',
        impact: 'No title will appear in search results',
        recommendation: 'Add descriptive title tag (50-60 characters)',
        actionable: true,
        checkName: 'Title Tag',
        status: 'failed'
      });
    } else {
      const titleLength = title.textContent.length;
      if (titleLength < 30) {
        this.addCheck('Title Tag', 'warning', 'Check for page title', `Too short (${titleLength} chars)`, 'Underutilized space in search results', 'Expand title to 50-60 characters');
        issues.push({
          type: 'warning',
          category: 'meta',
          message: `Title too short (${titleLength} characters)`,
          priority: 'medium',
          element: title.textContent,
          impact: 'Underutilized space in search results',
          recommendation: 'Expand title to 50-60 characters',
          actionable: true,
          checkName: 'Title Tag',
          status: 'warning'
        });
      } else if (titleLength > 60) {
        this.addCheck('Title Tag', 'warning', 'Check for page title', `Too long (${titleLength} chars)`, 'Title may be truncated in search results', 'Shorten title to under 60 characters');
        issues.push({
          type: 'warning',
          category: 'meta',
          message: `Title too long (${titleLength} characters)`,
          priority: 'medium',
          element: title.textContent,
          impact: 'Title may be truncated in search results',
          recommendation: 'Shorten title to under 60 characters',
          actionable: true,
          checkName: 'Title Tag',
          status: 'warning'
        });
      } else {
        this.addCheck('Title Tag', 'passed', 'Check for page title', `Optimal length (${titleLength} chars)`, 'Title will display properly in search results');
        issues.push({
          type: 'success',
          category: 'meta',
          message: `Title length optimal (${titleLength} characters)`,
          priority: 'low',
          element: title.textContent,
          impact: 'Title will display properly in search results',
          actionable: false,
          checkName: 'Title Tag',
          status: 'passed'
        });
      }
    }

    // Meta Description Check
    const description = doc.querySelector('meta[name="description"]');
    if (!description || !description.getAttribute('content')?.trim()) {
      this.addCheck('Meta Description', 'failed', 'Check for meta description', 'Missing meta description', 'Search engines will generate description automatically', 'Add compelling meta description (150-160 characters)');
      issues.push({
        type: 'error',
        category: 'meta',
        message: 'Missing meta description',
        priority: 'high',
        impact: 'Search engines will generate description automatically',
        recommendation: 'Add compelling meta description (150-160 characters)',
        actionable: true,
        checkName: 'Meta Description',
        status: 'failed'
      });
    } else {
      const descContent = description.getAttribute('content')!;
      const descLength = descContent.length;
      if (descLength < 120) {
        this.addCheck('Meta Description', 'warning', 'Check for meta description', `Too short (${descLength} chars)`, 'Underutilized space in search results', 'Expand description to 150-160 characters');
        issues.push({
          type: 'warning',
          category: 'meta',
          message: `Meta description too short (${descLength} characters)`,
          priority: 'medium',
          element: descContent,
          impact: 'Underutilized space in search results',
          recommendation: 'Expand description to 150-160 characters',
          actionable: true,
          checkName: 'Meta Description',
          status: 'warning'
        });
      } else if (descLength > 160) {
        this.addCheck('Meta Description', 'warning', 'Check for meta description', `Too long (${descLength} chars)`, 'Description may be truncated in search results', 'Shorten description to under 160 characters');
        issues.push({
          type: 'warning',
          category: 'meta',
          message: `Meta description too long (${descLength} characters)`,
          priority: 'medium',
          element: descContent,
          impact: 'Description may be truncated in search results',
          recommendation: 'Shorten description to under 160 characters',
          actionable: true,
          checkName: 'Meta Description',
          status: 'warning'
        });
      } else {
        this.addCheck('Meta Description', 'passed', 'Check for meta description', `Optimal length (${descLength} chars)`, 'Description will display properly in search results');
        issues.push({
          type: 'success',
          category: 'meta',
          message: `Meta description length optimal (${descLength} characters)`,
          priority: 'low',
          element: descContent,
          impact: 'Description will display properly in search results',
          actionable: false,
          checkName: 'Meta Description',
          status: 'passed'
        });
      }
    }

    // Viewport Meta Tag Check
    const viewport = doc.querySelector('meta[name="viewport"]');
    if (!viewport) {
      this.addCheck('Viewport Meta Tag', 'failed', 'Check for mobile viewport configuration', 'Missing viewport tag', 'Poor mobile user experience, mobile ranking penalty', 'Add viewport meta tag for mobile responsiveness');
      issues.push({
        type: 'error',
        category: 'meta',
        message: 'Missing viewport meta tag',
        priority: 'high',
        impact: 'Poor mobile user experience, mobile ranking penalty',
        recommendation: 'Add viewport meta tag for mobile responsiveness',
        actionable: true,
        checkName: 'Viewport Meta Tag',
        status: 'failed'
      });
    } else {
      this.addCheck('Viewport Meta Tag', 'passed', 'Check for mobile viewport configuration', 'Viewport tag present', 'Mobile-friendly configuration detected');
      issues.push({
        type: 'success',
        category: 'meta',
        message: 'Viewport meta tag present',
        priority: 'low',
        element: viewport.getAttribute('content') || '',
        impact: 'Mobile-friendly configuration detected',
        actionable: false,
        checkName: 'Viewport Meta Tag',
        status: 'passed'
      });
    }

    // Language Declaration Check
    const htmlLang = doc.documentElement.getAttribute('lang');
    if (!htmlLang) {
      this.addCheck('Language Declaration', 'warning', 'Check for HTML language attribute', 'Missing lang attribute', 'Search engines may not understand page language', 'Add lang attribute to HTML element (e.g., lang="en")');
      issues.push({
        type: 'warning',
        category: 'structure',
        message: 'Missing language declaration',
        priority: 'medium',
        impact: 'Search engines may not understand page language',
        recommendation: 'Add lang attribute to HTML element (e.g., lang="en")',
        actionable: true,
        checkName: 'Language Declaration',
        status: 'warning'
      });
    } else {
      this.addCheck('Language Declaration', 'passed', 'Check for HTML language attribute', `Language: ${htmlLang}`, 'Clear language signal for search engines');
      issues.push({
        type: 'success',
        category: 'structure',
        message: `Language declared as "${htmlLang}"`,
        priority: 'low',
        element: htmlLang,
        impact: 'Clear language signal for search engines',
        actionable: false,
        checkName: 'Language Declaration',
        status: 'passed'
      });
    }

    return issues;
  }

  private analyzeHeaders(doc: Document): TechnicalSEOIssue[] {
    const issues: TechnicalSEOIssue[] = [];

    // H1 Tag Check
    const h1Tags = doc.querySelectorAll('h1');
    if (h1Tags.length === 0) {
      this.addCheck('H1 Tag', 'failed', 'Check for main heading tag', 'No H1 tag found', 'No clear page topic signal for search engines', 'Add exactly one H1 tag per page');
      issues.push({
        type: 'error',
        category: 'headers',
        message: 'Missing H1 tag',
        priority: 'high',
        impact: 'No clear page topic signal for search engines',
        recommendation: 'Add exactly one H1 tag per page',
        actionable: true,
        checkName: 'H1 Tag',
        status: 'failed'
      });
    } else if (h1Tags.length > 1) {
      this.addCheck('H1 Tag', 'warning', 'Check for main heading tag', `${h1Tags.length} H1 tags found`, 'Diluted topic focus, confusing for search engines', 'Use only one H1 tag per page');
      issues.push({
        type: 'warning',
        category: 'headers',
        message: `Multiple H1 tags found (${h1Tags.length})`,
        priority: 'medium',
        element: Array.from(h1Tags).map(h1 => h1.textContent?.trim()).slice(0, 3).join(', '),
        impact: 'Diluted topic focus, confusing for search engines',
        recommendation: 'Use only one H1 tag per page',
        actionable: true,
        checkName: 'H1 Tag',
        status: 'warning'
      });
    } else {
      this.addCheck('H1 Tag', 'passed', 'Check for main heading tag', 'Single H1 tag found', 'Clear page topic established');
      issues.push({
        type: 'success',
        category: 'headers',
        message: 'Single H1 tag found',
        priority: 'low',
        element: h1Tags[0].textContent?.trim() || '',
        impact: 'Clear page topic established',
        actionable: false,
        checkName: 'H1 Tag',
        status: 'passed'
      });
    }

    // Header Hierarchy Check
    const headers = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headers.length > 1) {
      let previousLevel = 0;
      let hierarchyIssues = false;

      headers.forEach((header) => {
        const currentLevel = parseInt(header.tagName.charAt(1));
        if (previousLevel > 0 && currentLevel > previousLevel + 1) {
          hierarchyIssues = true;
        }
        previousLevel = currentLevel;
      });

      if (hierarchyIssues) {
        this.addCheck('Header Hierarchy', 'warning', 'Check header structure follows proper hierarchy', 'Improper hierarchy detected', 'Poor content structure understanding for search engines', 'Ensure headers follow proper hierarchy (H1 → H2 → H3, etc.)');
        issues.push({
          type: 'warning',
          category: 'headers',
          message: 'Header hierarchy not properly structured',
          priority: 'medium',
          impact: 'Poor content structure understanding for search engines',
          recommendation: 'Ensure headers follow proper hierarchy (H1 → H2 → H3, etc.)',
          actionable: true,
          checkName: 'Header Hierarchy',
          status: 'warning'
        });
      } else {
        this.addCheck('Header Hierarchy', 'passed', 'Check header structure follows proper hierarchy', `${headers.length} headers properly structured`, 'Clear content structure for search engines');
        issues.push({
          type: 'success',
          category: 'headers',
          message: `Header hierarchy properly structured (${headers.length} headers)`,
          priority: 'low',
          impact: 'Clear content structure for search engines',
          actionable: false,
          checkName: 'Header Hierarchy',
          status: 'passed'
        });
      }
    } else {
      this.addCheck('Header Hierarchy', 'info', 'Check header structure follows proper hierarchy', 'Insufficient headers for hierarchy analysis', 'Consider adding more headers for better content structure');
    }

    return issues;
  }

  private analyzeStructuredData(doc: Document): TechnicalSEOIssue[] {
    const issues: TechnicalSEOIssue[] = [];

    // JSON-LD Structured Data Check
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    let validSchemas = 0;
    let invalidSchemas = 0;

    jsonLdScripts.forEach((script) => {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@context'] && data['@type']) {
          validSchemas++;
        } else {
          invalidSchemas++;
        }
      } catch (e) {
        invalidSchemas++;
      }
    });

    if (validSchemas === 0 && invalidSchemas === 0) {
      this.addCheck('Structured Data', 'warning', 'Check for Schema.org structured data', 'No structured data found', 'Missing rich snippet opportunities', 'Add Schema.org structured data for better search results');
      issues.push({
        type: 'warning',
        category: 'structure',
        message: 'No structured data found',
        priority: 'medium',
        impact: 'Missing rich snippet opportunities',
        recommendation: 'Add Schema.org structured data for better search results',
        actionable: true,
        checkName: 'Structured Data',
        status: 'warning'
      });
    } else if (invalidSchemas > 0) {
      this.addCheck('Structured Data', 'failed', 'Check for Schema.org structured data', `${invalidSchemas} invalid schemas`, 'Broken structured data may cause indexing issues', 'Fix JSON-LD syntax errors in structured data');
      issues.push({
        type: 'error',
        category: 'structure',
        message: `${invalidSchemas} invalid structured data scripts`,
        priority: 'high',
        impact: 'Broken structured data may cause indexing issues',
        recommendation: 'Fix JSON-LD syntax errors in structured data',
        actionable: true,
        checkName: 'Structured Data',
        status: 'failed'
      });
    }

    if (validSchemas > 0) {
      this.addCheck('Structured Data', 'passed', 'Check for Schema.org structured data', `${validSchemas} valid schemas found`, 'Enhanced search result appearance potential');
      issues.push({
        type: 'success',
        category: 'structure',
        message: `${validSchemas} valid structured data schemas found`,
        priority: 'low',
        impact: 'Enhanced search result appearance potential',
        actionable: false,
        checkName: 'Structured Data',
        status: 'passed'
      });
    }

    return issues;
  }

  private analyzeOpenGraph(doc: Document): TechnicalSEOIssue[] {
    const issues: TechnicalSEOIssue[] = [];

    const ogTitle = doc.querySelector('meta[property="og:title"]');
    const ogDescription = doc.querySelector('meta[property="og:description"]');
    const ogImage = doc.querySelector('meta[property="og:image"]');
    const ogUrl = doc.querySelector('meta[property="og:url"]');
    
    let ogCount = 0;
    if (ogTitle) ogCount++;
    if (ogDescription) ogCount++;
    if (ogImage) ogCount++;
    if (ogUrl) ogCount++;

    if (ogCount === 0) {
      this.addCheck('Open Graph Tags', 'warning', 'Check for social media meta tags', 'No Open Graph tags found', 'Poor social media sharing appearance', 'Add og:title, og:description, og:image, and og:url for better social sharing');
      issues.push({
        type: 'warning',
        category: 'meta',
        message: 'No Open Graph tags found',
        priority: 'medium',
        impact: 'Poor social media sharing appearance',
        recommendation: 'Add og:title, og:description, og:image, and og:url for better social sharing',
        actionable: true,
        checkName: 'Open Graph Tags',
        status: 'warning'
      });
    } else if (ogCount < 4) {
      this.addCheck('Open Graph Tags', 'warning', 'Check for social media meta tags', `${ogCount}/4 Open Graph tags found`, 'Incomplete social media optimization', 'Add missing Open Graph tags for complete social media optimization');
      issues.push({
        type: 'warning',
        category: 'meta',
        message: `Incomplete Open Graph tags (${ogCount}/4 found)`,
        priority: 'medium',
        impact: 'Incomplete social media optimization',
        recommendation: 'Add missing Open Graph tags for complete social media optimization',
        actionable: true,
        checkName: 'Open Graph Tags',
        status: 'warning'
      });
    } else {
      this.addCheck('Open Graph Tags', 'passed', 'Check for social media meta tags', 'Complete Open Graph tags found', 'Optimized for social media sharing');
      issues.push({
        type: 'success',
        category: 'meta',
        message: 'Complete Open Graph tags found',
        priority: 'low',
        impact: 'Optimized for social media sharing',
        actionable: false,
        checkName: 'Open Graph Tags',
        status: 'passed'
      });
    }

    return issues;
  }

  public async analyzePage(url: string): Promise<TechnicalSEOResult> {
    const issues: TechnicalSEOIssue[] = [];
    this.allChecks = []; // Reset checks for new analysis
    
    try {
      // Validate and normalize URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const urlObj = new URL(url);
      
      // Fetch the page
      const { html, status, loadTime } = await this.fetchWithProxy(url);
      const doc = this.parseHTML(html);

      // Run all technical SEO analyses
      issues.push(...this.analyzeIndexability(doc, url, status));
      issues.push(...this.analyzeCanonicalization(doc, url));
      issues.push(...this.analyzeMetaTags(doc));
      issues.push(...this.analyzeHeaders(doc));
      issues.push(...this.analyzeStructuredData(doc));
      issues.push(...this.analyzeOpenGraph(doc));

      // Calculate metrics
      const title = doc.querySelector('title');
      const description = doc.querySelector('meta[name="description"]');
      const h1Tags = doc.querySelectorAll('h1');
      const canonical = doc.querySelector('link[rel="canonical"]');
      const robotsMeta = doc.querySelector('meta[name="robots"]');
      const structuredDataScripts = doc.querySelectorAll('script[type="application/ld+json"]');
      const hreflangTags = doc.querySelectorAll('link[rel="alternate"][hreflang]');
      const ogTags = doc.querySelectorAll('meta[property^="og:"]');

      const metrics = {
        titleLength: title?.textContent?.length || 0,
        descriptionLength: description?.getAttribute('content')?.length || 0,
        h1Count: h1Tags.length,
        canonicalPresent: !!canonical,
        robotsMetaPresent: !!robotsMeta,
        structuredDataCount: structuredDataScripts.length,
        httpsEnabled: url.startsWith('https://'),
        responseCode: status,
        redirectCount: status >= 300 && status < 400 ? 1 : 0,
        xmlSitemapDetected: !!doc.querySelector('link[rel="sitemap"]'),
        robotsTxtAccessible: false, // Would need separate check
        hreflangCount: hreflangTags.length,
        openGraphCount: ogTags.length
      };

      // Filter actionable items
      const actionableItems = issues.filter(issue => issue.actionable);

      // Calculate score based on issues
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
            score -= 1;
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
        metrics,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      this.addCheck('Page Analysis', 'failed', 'Analyze page for technical SEO factors', 'Analysis failed', 'Unable to perform technical SEO analysis', 'Check if the URL is correct and accessible');
      
      issues.push({
        type: 'error',
        category: 'indexability',
        message: `Technical analysis failed: ${errorMessage}`,
        priority: 'high',
        impact: 'Unable to perform technical SEO analysis',
        recommendation: 'Check if the URL is correct and accessible',
        actionable: true,
        checkName: 'Page Analysis',
        status: 'failed'
      });

      return {
        url,
        score: 0,
        issues,
        actionableItems: issues.filter(issue => issue.actionable),
        allChecks: this.allChecks,
        metrics: {
          titleLength: 0,
          descriptionLength: 0,
          h1Count: 0,
          canonicalPresent: false,
          robotsMetaPresent: false,
          structuredDataCount: 0,
          httpsEnabled: false,
          responseCode: 0,
          redirectCount: 0,
          xmlSitemapDetected: false,
          robotsTxtAccessible: false,
          hreflangCount: 0,
          openGraphCount: 0
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}