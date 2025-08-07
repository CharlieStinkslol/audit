export interface TechnicalSEOIssue {
  type: 'error' | 'warning' | 'info' | 'success';
  category: 'meta' | 'headers' | 'indexability' | 'structure' | 'crawlability' | 'canonicalization' | 'redirects' | 'security';
  message: string;
  priority: 'high' | 'medium' | 'low';
  element?: string;
  recommendation?: string;
  impact: string;
}

export interface TechnicalSEOResult {
  url: string;
  score: number;
  issues: TechnicalSEOIssue[];
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

  private analyzeIndexability(doc: Document, url: string, status: number): TechnicalSEOIssue[] {
    const issues: TechnicalSEOIssue[] = [];

    // HTTP Status Code Analysis
    if (status >= 400) {
      issues.push({
        type: 'error',
        category: 'indexability',
        message: `HTTP ${status} error - Page not accessible`,
        priority: 'high',
        impact: 'Page cannot be indexed by search engines',
        recommendation: 'Fix server configuration to return 200 status code'
      });
    } else if (status >= 300 && status < 400) {
      issues.push({
        type: 'warning',
        category: 'redirects',
        message: `HTTP ${status} redirect detected`,
        priority: 'medium',
        impact: 'May dilute link equity and slow crawling',
        recommendation: 'Minimize redirect chains and use 301 redirects for permanent moves'
      });
    } else {
      issues.push({
        type: 'success',
        category: 'indexability',
        message: `HTTP ${status} - Page accessible`,
        priority: 'low',
        impact: 'Page can be properly indexed'
      });
    }

    // HTTPS Analysis
    const isHttps = url.startsWith('https://');
    if (!isHttps) {
      issues.push({
        type: 'error',
        category: 'security',
        message: 'Site not using HTTPS',
        priority: 'high',
        impact: 'Security warning in browsers, negative ranking factor',
        recommendation: 'Implement SSL certificate and redirect HTTP to HTTPS'
      });
    } else {
      issues.push({
        type: 'success',
        category: 'security',
        message: 'HTTPS enabled',
        priority: 'low',
        impact: 'Secure connection established'
      });
    }

    // Robots Meta Tag Analysis
    const robots = doc.querySelector('meta[name="robots"]');
    if (robots) {
      const robotsContent = robots.getAttribute('content') || '';
      if (robotsContent.includes('noindex')) {
        issues.push({
          type: 'error',
          category: 'indexability',
          message: 'Page blocked from indexing (noindex)',
          priority: 'high',
          element: robotsContent,
          impact: 'Page will not appear in search results',
          recommendation: 'Remove noindex directive if page should be indexed'
        });
      }
      if (robotsContent.includes('nofollow')) {
        issues.push({
          type: 'warning',
          category: 'crawlability',
          message: 'Links blocked from following (nofollow)',
          priority: 'medium',
          element: robotsContent,
          impact: 'Search engines won\'t follow links on this page',
          recommendation: 'Remove nofollow if links should pass authority'
        });
      }
      if (robotsContent.includes('noarchive')) {
        issues.push({
          type: 'info',
          category: 'indexability',
          message: 'Page blocked from caching (noarchive)',
          priority: 'low',
          element: robotsContent,
          impact: 'No cached version will be available',
          recommendation: 'Consider if noarchive is necessary'
        });
      }
      if (robotsContent.includes('nosnippet')) {
        issues.push({
          type: 'info',
          category: 'indexability',
          message: 'Snippets blocked (nosnippet)',
          priority: 'low',
          element: robotsContent,
          impact: 'No description will show in search results',
          recommendation: 'Remove nosnippet to allow rich snippets'
        });
      }
    } else {
      issues.push({
        type: 'success',
        category: 'indexability',
        message: 'No robots restrictions found',
        priority: 'low',
        impact: 'Page can be freely indexed and crawled'
      });
    }

    return issues;
  }

  private analyzeCanonicalization(doc: Document, url: string): TechnicalSEOIssue[] {
    const issues: TechnicalSEOIssue[] = [];

    // Canonical Tag Analysis
    const canonical = doc.querySelector('link[rel="canonical"]');
    if (!canonical) {
      issues.push({
        type: 'warning',
        category: 'canonicalization',
        message: 'Missing canonical tag',
        priority: 'medium',
        impact: 'Risk of duplicate content issues',
        recommendation: 'Add canonical tag to specify preferred URL version'
      });
    } else {
      const canonicalUrl = canonical.getAttribute('href');
      if (!canonicalUrl) {
        issues.push({
          type: 'error',
          category: 'canonicalization',
          message: 'Empty canonical tag',
          priority: 'high',
          impact: 'Invalid canonical signal to search engines',
          recommendation: 'Add proper URL to canonical tag'
        });
      } else {
        try {
          const canonicalUrlObj = new URL(canonicalUrl, url);
          const currentUrlObj = new URL(url);
          
          if (canonicalUrlObj.href !== currentUrlObj.href) {
            issues.push({
              type: 'info',
              category: 'canonicalization',
              message: 'Canonical points to different URL',
              priority: 'low',
              element: canonicalUrl,
              impact: 'This page defers authority to canonical URL',
              recommendation: 'Verify canonical URL is correct'
            });
          } else {
            issues.push({
              type: 'success',
              category: 'canonicalization',
              message: 'Self-referencing canonical tag present',
              priority: 'low',
              element: canonicalUrl,
              impact: 'Clear canonical signal established'
            });
          }
        } catch (e) {
          issues.push({
            type: 'error',
            category: 'canonicalization',
            message: 'Invalid canonical URL format',
            priority: 'high',
            element: canonicalUrl,
            impact: 'Search engines cannot process canonical signal',
            recommendation: 'Fix canonical URL format'
          });
        }
      }
    }

    return issues;
  }

  private analyzeMetaTags(doc: Document): TechnicalSEOIssue[] {
    const issues: TechnicalSEOIssue[] = [];

    // Title Tag Analysis
    const title = doc.querySelector('title');
    if (!title || !title.textContent?.trim()) {
      issues.push({
        type: 'error',
        category: 'meta',
        message: 'Missing title tag',
        priority: 'high',
        impact: 'No title will appear in search results',
        recommendation: 'Add descriptive title tag (50-60 characters)'
      });
    } else {
      const titleLength = title.textContent.length;
      if (titleLength < 30) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: `Title too short (${titleLength} characters)`,
          priority: 'medium',
          element: title.textContent,
          impact: 'Underutilized space in search results',
          recommendation: 'Expand title to 50-60 characters'
        });
      } else if (titleLength > 60) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: `Title too long (${titleLength} characters)`,
          priority: 'medium',
          element: title.textContent,
          impact: 'Title may be truncated in search results',
          recommendation: 'Shorten title to under 60 characters'
        });
      } else {
        issues.push({
          type: 'success',
          category: 'meta',
          message: `Title length optimal (${titleLength} characters)`,
          priority: 'low',
          element: title.textContent,
          impact: 'Title will display properly in search results'
        });
      }
    }

    // Meta Description Analysis
    const description = doc.querySelector('meta[name="description"]');
    if (!description || !description.getAttribute('content')?.trim()) {
      issues.push({
        type: 'error',
        category: 'meta',
        message: 'Missing meta description',
        priority: 'high',
        impact: 'Search engines will generate description automatically',
        recommendation: 'Add compelling meta description (150-160 characters)'
      });
    } else {
      const descContent = description.getAttribute('content')!;
      const descLength = descContent.length;
      if (descLength < 120) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: `Meta description too short (${descLength} characters)`,
          priority: 'medium',
          element: descContent,
          impact: 'Underutilized space in search results',
          recommendation: 'Expand description to 150-160 characters'
        });
      } else if (descLength > 160) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: `Meta description too long (${descLength} characters)`,
          priority: 'medium',
          element: descContent,
          impact: 'Description may be truncated in search results',
          recommendation: 'Shorten description to under 160 characters'
        });
      } else {
        issues.push({
          type: 'success',
          category: 'meta',
          message: `Meta description length optimal (${descLength} characters)`,
          priority: 'low',
          element: descContent,
          impact: 'Description will display properly in search results'
        });
      }
    }

    // Viewport Meta Tag
    const viewport = doc.querySelector('meta[name="viewport"]');
    if (!viewport) {
      issues.push({
        type: 'error',
        category: 'meta',
        message: 'Missing viewport meta tag',
        priority: 'high',
        impact: 'Poor mobile user experience, mobile ranking penalty',
        recommendation: 'Add viewport meta tag for mobile responsiveness'
      });
    } else {
      issues.push({
        type: 'success',
        category: 'meta',
        message: 'Viewport meta tag present',
        priority: 'low',
        element: viewport.getAttribute('content') || '',
        impact: 'Mobile-friendly configuration detected'
      });
    }

    // Language Declaration
    const htmlLang = doc.documentElement.getAttribute('lang');
    if (!htmlLang) {
      issues.push({
        type: 'warning',
        category: 'structure',
        message: 'Missing language declaration',
        priority: 'medium',
        impact: 'Search engines may not understand page language',
        recommendation: 'Add lang attribute to HTML element (e.g., lang="en")'
      });
    } else {
      issues.push({
        type: 'success',
        category: 'structure',
        message: `Language declared as "${htmlLang}"`,
        priority: 'low',
        element: htmlLang,
        impact: 'Clear language signal for search engines'
      });
    }

    return issues;
  }

  private analyzeHeaders(doc: Document): TechnicalSEOIssue[] {
    const issues: TechnicalSEOIssue[] = [];

    // H1 Tag Analysis
    const h1Tags = doc.querySelectorAll('h1');
    if (h1Tags.length === 0) {
      issues.push({
        type: 'error',
        category: 'headers',
        message: 'Missing H1 tag',
        priority: 'high',
        impact: 'No clear page topic signal for search engines',
        recommendation: 'Add exactly one H1 tag per page'
      });
    } else if (h1Tags.length > 1) {
      issues.push({
        type: 'warning',
        category: 'headers',
        message: `Multiple H1 tags found (${h1Tags.length})`,
        priority: 'medium',
        element: Array.from(h1Tags).map(h1 => h1.textContent?.trim()).slice(0, 3).join(', '),
        impact: 'Diluted topic focus, confusing for search engines',
        recommendation: 'Use only one H1 tag per page'
      });
    } else {
      issues.push({
        type: 'success',
        category: 'headers',
        message: 'Single H1 tag found',
        priority: 'low',
        element: h1Tags[0].textContent?.trim() || '',
        impact: 'Clear page topic established'
      });
    }

    // Header Hierarchy Analysis
    const headers = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headers.length > 1) {
      let previousLevel = 0;
      let hierarchyIssues = false;
      const headerStructure: string[] = [];

      headers.forEach((header, index) => {
        if (index < 10) { // Limit to first 10 headers for analysis
          const currentLevel = parseInt(header.tagName.charAt(1));
          headerStructure.push(`${header.tagName}: ${header.textContent?.trim()?.substring(0, 30) || ''}...`);
          
          if (previousLevel > 0 && currentLevel > previousLevel + 1) {
            hierarchyIssues = true;
          }
          previousLevel = currentLevel;
        }
      });

      if (hierarchyIssues) {
        issues.push({
          type: 'warning',
          category: 'headers',
          message: 'Header hierarchy not properly structured',
          priority: 'medium',
          element: headerStructure.slice(0, 5).join(' | '),
          impact: 'Poor content structure understanding for search engines',
          recommendation: 'Ensure headers follow proper hierarchy (H1 → H2 → H3, etc.)'
        });
      } else {
        issues.push({
          type: 'success',
          category: 'headers',
          message: `Header hierarchy properly structured (${headers.length} headers)`,
          priority: 'low',
          impact: 'Clear content structure for search engines'
        });
      }
    }

    return issues;
  }

  private analyzeStructuredData(doc: Document): TechnicalSEOIssue[] {
    const issues: TechnicalSEOIssue[] = [];

    // JSON-LD Structured Data
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
      issues.push({
        type: 'warning',
        category: 'structure',
        message: 'No structured data found',
        priority: 'medium',
        impact: 'Missing rich snippet opportunities',
        recommendation: 'Add Schema.org structured data for better search results'
      });
    } else if (invalidSchemas > 0) {
      issues.push({
        type: 'error',
        category: 'structure',
        message: `${invalidSchemas} invalid structured data scripts`,
        priority: 'high',
        impact: 'Broken structured data may cause indexing issues',
        recommendation: 'Fix JSON-LD syntax errors in structured data'
      });
    }

    if (validSchemas > 0) {
      issues.push({
        type: 'success',
        category: 'structure',
        message: `${validSchemas} valid structured data schemas found`,
        priority: 'low',
        impact: 'Enhanced search result appearance potential'
      });
    }

    // Microdata Analysis
    const microdataElements = doc.querySelectorAll('[itemscope]');
    if (microdataElements.length > 0) {
      issues.push({
        type: 'info',
        category: 'structure',
        message: `${microdataElements.length} microdata elements found`,
        priority: 'low',
        impact: 'Additional structured data signals present'
      });
    }

    return issues;
  }

  private analyzeCrawlability(doc: Document, url: string): TechnicalSEOIssue[] {
    const issues: TechnicalSEOIssue[] = [];

    // Check for common crawl directives
    const metaRobots = doc.querySelector('meta[name="robots"]');
    if (metaRobots) {
      const content = metaRobots.getAttribute('content') || '';
      if (content.includes('nofollow')) {
        issues.push({
          type: 'warning',
          category: 'crawlability',
          message: 'Page links set to nofollow',
          priority: 'medium',
          element: content,
          impact: 'Internal link equity not passed to other pages',
          recommendation: 'Remove nofollow unless intentionally blocking link equity'
        });
      }
    }

    // Check for XML sitemap reference
    const sitemapLink = doc.querySelector('link[rel="sitemap"]');
    if (sitemapLink) {
      issues.push({
        type: 'success',
        category: 'crawlability',
        message: 'XML sitemap referenced in HTML',
        priority: 'low',
        element: sitemapLink.getAttribute('href') || '',
        impact: 'Clear sitemap signal for search engines'
      });
    }

    // Check for hreflang tags
    const hreflangTags = doc.querySelectorAll('link[rel="alternate"][hreflang]');
    if (hreflangTags.length > 0) {
      issues.push({
        type: 'success',
        category: 'structure',
        message: `${hreflangTags.length} hreflang tags found`,
        priority: 'low',
        impact: 'International SEO signals present'
      });
    }

    return issues;
  }

  public async analyzePage(url: string): Promise<TechnicalSEOResult> {
    const issues: TechnicalSEOIssue[] = [];
    
    try {
      // Validate and normalize URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const urlObj = new URL(url);
      
      // Fetch the page
      const { html, status, loadTime } = await this.fetchWithProxy(url);
      const doc = this.parseHTML(html);

      // Run technical SEO analyses
      issues.push(...this.analyzeIndexability(doc, url, status));
      issues.push(...this.analyzeCanonicalization(doc, url));
      issues.push(...this.analyzeMetaTags(doc));
      issues.push(...this.analyzeHeaders(doc));
      issues.push(...this.analyzeStructuredData(doc));
      issues.push(...this.analyzeCrawlability(doc, url));

      // Calculate metrics
      const title = doc.querySelector('title');
      const description = doc.querySelector('meta[name="description"]');
      const h1Tags = doc.querySelectorAll('h1');
      const canonical = doc.querySelector('link[rel="canonical"]');
      const robotsMeta = doc.querySelector('meta[name="robots"]');
      const structuredDataScripts = doc.querySelectorAll('script[type="application/ld+json"]');

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
        robotsTxtAccessible: false // Would need separate check
      };

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
        metrics,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      issues.push({
        type: 'error',
        category: 'indexability',
        message: `Technical analysis failed: ${errorMessage}`,
        priority: 'high',
        impact: 'Unable to perform technical SEO analysis',
        recommendation: 'Check if the URL is correct and accessible'
      });

      return {
        url,
        score: 0,
        issues,
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
          robotsTxtAccessible: false
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}