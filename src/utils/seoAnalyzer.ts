export interface SEOIssue {
  type: 'error' | 'warning' | 'info' | 'success';
  category: 'meta' | 'headers' | 'images' | 'links' | 'performance' | 'structure' | 'indexability';
  message: string;
  priority: 'high' | 'medium' | 'low';
  element?: string;
  recommendation?: string;
}

export interface SEOAuditResult {
  url: string;
  score: number;
  issues: SEOIssue[];
  metrics: {
    titleLength: number;
    descriptionLength: number;
    h1Count: number;
    imageCount: number;
    imagesWithoutAlt: number;
    internalLinks: number;
    externalLinks: number;
    loadTime: number;
    responseCode: number;
  };
  timestamp: string;
}

export class SEOAnalyzer {
  private corsProxies = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
  ];

  private async fetchWithProxy(url: string, timeout = 15000): Promise<{ html: string; status: number; loadTime: number }> {
    const startTime = Date.now();
    
    // Try direct fetch first (for same-origin or CORS-enabled sites)
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

    // Try each proxy
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

  private analyzeMetaTags(doc: Document, url: string): SEOIssue[] {
    const issues: SEOIssue[] = [];
    
    // Title analysis
    const title = doc.querySelector('title');
    if (!title || !title.textContent?.trim()) {
      issues.push({
        type: 'error',
        category: 'meta',
        message: 'Missing page title',
        priority: 'high',
        recommendation: 'Add a descriptive title tag (50-60 characters)'
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
          recommendation: 'Expand title to 50-60 characters for better SEO'
        });
      } else if (titleLength > 60) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: `Title too long (${titleLength} characters)`,
          priority: 'medium',
          element: title.textContent,
          recommendation: 'Shorten title to under 60 characters'
        });
      } else {
        issues.push({
          type: 'success',
          category: 'meta',
          message: `Title length optimal (${titleLength} characters)`,
          priority: 'low',
          element: title.textContent
        });
      }
    }

    // Meta description analysis
    const description = doc.querySelector('meta[name="description"]');
    if (!description || !description.getAttribute('content')?.trim()) {
      issues.push({
        type: 'error',
        category: 'meta',
        message: 'Missing meta description',
        priority: 'high',
        recommendation: 'Add a compelling meta description (150-160 characters)'
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
          recommendation: 'Expand description to 150-160 characters'
        });
      } else if (descLength > 160) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: `Meta description too long (${descLength} characters)`,
          priority: 'medium',
          element: descContent,
          recommendation: 'Shorten description to under 160 characters'
        });
      } else {
        issues.push({
          type: 'success',
          category: 'meta',
          message: `Meta description length optimal (${descLength} characters)`,
          priority: 'low',
          element: descContent
        });
      }
    }

    // Viewport meta tag
    const viewport = doc.querySelector('meta[name="viewport"]');
    if (!viewport) {
      issues.push({
        type: 'error',
        category: 'meta',
        message: 'Missing viewport meta tag',
        priority: 'high',
        recommendation: 'Add viewport meta tag for mobile responsiveness'
      });
    } else {
      issues.push({
        type: 'success',
        category: 'meta',
        message: 'Viewport meta tag present',
        priority: 'low',
        element: viewport.getAttribute('content') || ''
      });
    }

    // Canonical tag
    const canonical = doc.querySelector('link[rel="canonical"]');
    if (!canonical) {
      issues.push({
        type: 'warning',
        category: 'meta',
        message: 'Missing canonical tag',
        priority: 'medium',
        recommendation: 'Add canonical tag to prevent duplicate content issues'
      });
    } else {
      issues.push({
        type: 'success',
        category: 'meta',
        message: 'Canonical tag present',
        priority: 'low',
        element: canonical.getAttribute('href') || ''
      });
    }

    // Open Graph tags
    const ogTitle = doc.querySelector('meta[property="og:title"]');
    const ogDescription = doc.querySelector('meta[property="og:description"]');
    const ogImage = doc.querySelector('meta[property="og:image"]');
    
    let ogCount = 0;
    if (ogTitle) ogCount++;
    if (ogDescription) ogCount++;
    if (ogImage) ogCount++;

    if (ogCount === 0) {
      issues.push({
        type: 'warning',
        category: 'meta',
        message: 'No Open Graph tags found',
        priority: 'medium',
        recommendation: 'Add og:title, og:description, and og:image for better social sharing'
      });
    } else if (ogCount < 3) {
      issues.push({
        type: 'warning',
        category: 'meta',
        message: `Incomplete Open Graph tags (${ogCount}/3 found)`,
        priority: 'medium',
        recommendation: 'Add missing Open Graph tags for complete social media optimization'
      });
    } else {
      issues.push({
        type: 'success',
        category: 'meta',
        message: 'Complete Open Graph tags found',
        priority: 'low'
      });
    }

    // Robots meta tag
    const robots = doc.querySelector('meta[name="robots"]');
    if (robots) {
      const robotsContent = robots.getAttribute('content') || '';
      if (robotsContent.includes('noindex')) {
        issues.push({
          type: 'warning',
          category: 'indexability',
          message: 'Page set to noindex',
          priority: 'high',
          element: robotsContent,
          recommendation: 'Remove noindex if you want this page to be indexed'
        });
      }
      if (robotsContent.includes('nofollow')) {
        issues.push({
          type: 'info',
          category: 'indexability',
          message: 'Page set to nofollow',
          priority: 'medium',
          element: robotsContent,
          recommendation: 'Consider if nofollow is necessary for this page'
        });
      }
    }

    return issues;
  }

  private analyzeHeaders(doc: Document): SEOIssue[] {
    const issues: SEOIssue[] = [];
    
    // H1 analysis
    const h1Tags = doc.querySelectorAll('h1');
    if (h1Tags.length === 0) {
      issues.push({
        type: 'error',
        category: 'headers',
        message: 'Missing H1 tag',
        priority: 'high',
        recommendation: 'Add exactly one H1 tag per page'
      });
    } else if (h1Tags.length > 1) {
      issues.push({
        type: 'warning',
        category: 'headers',
        message: `Multiple H1 tags found (${h1Tags.length})`,
        priority: 'medium',
        element: Array.from(h1Tags).map(h1 => h1.textContent?.trim()).join(', '),
        recommendation: 'Use only one H1 tag per page'
      });
    } else {
      issues.push({
        type: 'success',
        category: 'headers',
        message: 'H1 tag structure correct',
        priority: 'low',
        element: h1Tags[0].textContent?.trim() || ''
      });
    }

    // Header hierarchy
    const headers = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headers.length > 1) {
      let previousLevel = 0;
      let hierarchyIssues = false;
      const headerStructure: string[] = [];

      headers.forEach((header) => {
        const currentLevel = parseInt(header.tagName.charAt(1));
        headerStructure.push(`${header.tagName}: ${header.textContent?.trim()?.substring(0, 50) || ''}...`);
        
        if (previousLevel > 0 && currentLevel > previousLevel + 1) {
          hierarchyIssues = true;
        }
        previousLevel = currentLevel;
      });

      if (hierarchyIssues) {
        issues.push({
          type: 'warning',
          category: 'headers',
          message: 'Header hierarchy not properly structured',
          priority: 'medium',
          element: headerStructure.slice(0, 5).join(' | '),
          recommendation: 'Ensure headers follow proper hierarchy (H1 → H2 → H3, etc.)'
        });
      } else {
        issues.push({
          type: 'success',
          category: 'headers',
          message: `Header hierarchy properly structured (${headers.length} headers)`,
          priority: 'low'
        });
      }
    }

    return issues;
  }

  private analyzeImages(doc: Document): SEOIssue[] {
    const issues: SEOIssue[] = [];
    const images = doc.querySelectorAll('img');
    let imagesWithoutAlt = 0;
    let imagesWithEmptyAlt = 0;
    const problematicImages: string[] = [];

    images.forEach((img) => {
      const alt = img.getAttribute('alt');
      const src = img.getAttribute('src') || '';
      
      if (!alt) {
        imagesWithoutAlt++;
        problematicImages.push(src.substring(src.lastIndexOf('/') + 1) || 'unknown');
      } else if (alt.trim() === '') {
        imagesWithEmptyAlt++;
        problematicImages.push(src.substring(src.lastIndexOf('/') + 1) || 'unknown');
      }
    });

    if (imagesWithoutAlt > 0) {
      issues.push({
        type: 'error',
        category: 'images',
        message: `${imagesWithoutAlt} images missing alt attributes`,
        priority: 'high',
        element: problematicImages.slice(0, 3).join(', '),
        recommendation: 'Add descriptive alt text to all images for accessibility and SEO'
      });
    }

    if (imagesWithEmptyAlt > 0) {
      issues.push({
        type: 'warning',
        category: 'images',
        message: `${imagesWithEmptyAlt} images with empty alt attributes`,
        priority: 'medium',
        element: problematicImages.slice(0, 3).join(', '),
        recommendation: 'Add descriptive alt text or use alt="" for decorative images'
      });
    }

    if (images.length > 0 && imagesWithoutAlt === 0 && imagesWithEmptyAlt === 0) {
      issues.push({
        type: 'success',
        category: 'images',
        message: `All ${images.length} images have alt attributes`,
        priority: 'low'
      });
    }

    // Check for lazy loading
    const lazyImages = doc.querySelectorAll('img[loading="lazy"]');
    if (images.length > 3 && lazyImages.length === 0) {
      issues.push({
        type: 'info',
        category: 'performance',
        message: 'Consider adding lazy loading to images',
        priority: 'low',
        recommendation: 'Add loading="lazy" to images below the fold for better performance'
      });
    }

    return issues;
  }

  private analyzeLinks(doc: Document, url: string): SEOIssue[] {
    const issues: SEOIssue[] = [];
    const links = doc.querySelectorAll('a[href]');
    let internalLinks = 0;
    let externalLinks = 0;
    let noFollowLinks = 0;
    let brokenLinkSuspects = 0;

    const currentDomain = new URL(url).hostname;

    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      try {
        if (href.startsWith('http')) {
          const linkDomain = new URL(href).hostname;
          if (linkDomain === currentDomain) {
            internalLinks++;
          } else {
            externalLinks++;
            if (link.getAttribute('rel')?.includes('nofollow')) {
              noFollowLinks++;
            }
          }
        } else if (href.startsWith('/') || (!href.includes('://') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:'))) {
          internalLinks++;
        }
        
        // Check for potential broken links
        if (href === '#' || href === '' || href === 'javascript:void(0)') {
          brokenLinkSuspects++;
        }
      } catch (e) {
        brokenLinkSuspects++;
      }
    });

    if (internalLinks === 0) {
      issues.push({
        type: 'warning',
        category: 'links',
        message: 'No internal links found',
        priority: 'medium',
        recommendation: 'Add internal links to improve site navigation and SEO'
      });
    } else {
      issues.push({
        type: 'success',
        category: 'links',
        message: `${internalLinks} internal links found`,
        priority: 'low'
      });
    }

    if (externalLinks > 0) {
      const noFollowPercentage = (noFollowLinks / externalLinks) * 100;
      issues.push({
        type: 'info',
        category: 'links',
        message: `${externalLinks} external links (${noFollowLinks} with nofollow)`,
        priority: 'low',
        recommendation: noFollowPercentage < 30 ? 'Consider adding nofollow to untrusted external links' : 'Good use of nofollow attributes'
      });
    }

    if (brokenLinkSuspects > 0) {
      issues.push({
        type: 'warning',
        category: 'links',
        message: `${brokenLinkSuspects} potentially broken or empty links`,
        priority: 'medium',
        recommendation: 'Review and fix broken or placeholder links'
      });
    }

    return issues;
  }

  private analyzeStructure(doc: Document): SEOIssue[] {
    const issues: SEOIssue[] = [];

    // Schema markup
    const schemaScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    if (schemaScripts.length === 0) {
      issues.push({
        type: 'warning',
        category: 'structure',
        message: 'No structured data (Schema.org) found',
        priority: 'medium',
        recommendation: 'Add structured data markup for better search results'
      });
    } else {
      issues.push({
        type: 'success',
        category: 'structure',
        message: `Structured data found (${schemaScripts.length} scripts)`,
        priority: 'low'
      });
    }

    // Language attribute
    const htmlLang = doc.documentElement.getAttribute('lang');
    if (!htmlLang) {
      issues.push({
        type: 'warning',
        category: 'structure',
        message: 'Missing language attribute on HTML element',
        priority: 'medium',
        recommendation: 'Add lang attribute to HTML element (e.g., lang="en")'
      });
    } else {
      issues.push({
        type: 'success',
        category: 'structure',
        message: `Language attribute set to "${htmlLang}"`,
        priority: 'low',
        element: htmlLang
      });
    }

    // Check for semantic HTML5 elements
    const semanticElements = ['main', 'header', 'footer', 'nav', 'article', 'section', 'aside'];
    const foundElements = semanticElements.filter(tag => doc.querySelector(tag));
    
    if (foundElements.length < 3) {
      issues.push({
        type: 'info',
        category: 'structure',
        message: `Limited semantic HTML5 elements (${foundElements.length}/7 found)`,
        priority: 'low',
        element: foundElements.join(', '),
        recommendation: 'Consider using more semantic HTML5 elements for better structure'
      });
    } else {
      issues.push({
        type: 'success',
        category: 'structure',
        message: `Good use of semantic HTML5 elements (${foundElements.length}/7 found)`,
        priority: 'low',
        element: foundElements.join(', ')
      });
    }

    return issues;
  }

  private analyzePerformance(doc: Document, loadTime: number): SEOIssue[] {
    const issues: SEOIssue[] = [];

    // Load time analysis
    if (loadTime > 3000) {
      issues.push({
        type: 'error',
        category: 'performance',
        message: `Slow page load time (${loadTime}ms)`,
        priority: 'high',
        recommendation: 'Optimize images, minify CSS/JS, and consider using a CDN'
      });
    } else if (loadTime > 1500) {
      issues.push({
        type: 'warning',
        category: 'performance',
        message: `Moderate page load time (${loadTime}ms)`,
        priority: 'medium',
        recommendation: 'Consider optimizing for faster load times (target <1500ms)'
      });
    } else {
      issues.push({
        type: 'success',
        category: 'performance',
        message: `Good page load time (${loadTime}ms)`,
        priority: 'low'
      });
    }

    // Check for render-blocking resources
    const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');
    const scripts = doc.querySelectorAll('script[src]:not([async]):not([defer])');
    
    if (scripts.length > 3) {
      issues.push({
        type: 'warning',
        category: 'performance',
        message: `${scripts.length} render-blocking scripts found`,
        priority: 'medium',
        recommendation: 'Consider adding async or defer attributes to non-critical scripts'
      });
    }

    if (stylesheets.length > 5) {
      issues.push({
        type: 'info',
        category: 'performance',
        message: `${stylesheets.length} stylesheets found`,
        priority: 'low',
        recommendation: 'Consider combining CSS files to reduce HTTP requests'
      });
    }

    return issues;
  }

  public async analyzePage(url: string): Promise<SEOAuditResult> {
    const issues: SEOIssue[] = [];
    
    try {
      // Validate and normalize URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const urlObj = new URL(url);
      
      // Fetch the page with proxy fallback
      const { html, status, loadTime } = await this.fetchWithProxy(url);
      
      if (status >= 400) {
        issues.push({
          type: 'error',
          category: 'indexability',
          message: `HTTP ${status} error`,
          priority: 'high',
          recommendation: 'Fix server response issues'
        });
      } else if (status >= 300) {
        issues.push({
          type: 'warning',
          category: 'indexability',
          message: `HTTP ${status} redirect`,
          priority: 'medium',
          recommendation: 'Check if redirect is intentional'
        });
      }

      const doc = this.parseHTML(html);

      // Run all analyses
      issues.push(...this.analyzeMetaTags(doc, url));
      issues.push(...this.analyzeHeaders(doc));
      issues.push(...this.analyzeImages(doc));
      issues.push(...this.analyzeLinks(doc, url));
      issues.push(...this.analyzeStructure(doc));
      issues.push(...this.analyzePerformance(doc, loadTime));

      // Calculate metrics
      const title = doc.querySelector('title');
      const description = doc.querySelector('meta[name="description"]');
      const h1Tags = doc.querySelectorAll('h1');
      const images = doc.querySelectorAll('img');
      const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt')).length;
      const links = doc.querySelectorAll('a[href]');
      
      let internalLinks = 0;
      let externalLinks = 0;
      const currentDomain = urlObj.hostname;

      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        try {
          if (href.startsWith('http')) {
            const linkDomain = new URL(href).hostname;
            if (linkDomain === currentDomain) {
              internalLinks++;
            } else {
              externalLinks++;
            }
          } else if (href.startsWith('/') || (!href.includes('://') && !href.startsWith('#'))) {
            internalLinks++;
          }
        } catch (e) {
          // Invalid URL, skip
        }
      });

      const metrics = {
        titleLength: title?.textContent?.length || 0,
        descriptionLength: description?.getAttribute('content')?.length || 0,
        h1Count: h1Tags.length,
        imageCount: images.length,
        imagesWithoutAlt,
        internalLinks,
        externalLinks,
        loadTime,
        responseCode: status
      };

      // Calculate score based on issues
      let score = 100;
      issues.forEach(issue => {
        switch (issue.type) {
          case 'error':
            score -= issue.priority === 'high' ? 15 : issue.priority === 'medium' ? 10 : 5;
            break;
          case 'warning':
            score -= issue.priority === 'high' ? 8 : issue.priority === 'medium' ? 5 : 2;
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
        message: `Analysis failed: ${errorMessage}`,
        priority: 'high',
        recommendation: 'Check if the URL is correct and accessible. Some sites may block automated requests.'
      });

      return {
        url,
        score: 0,
        issues,
        metrics: {
          titleLength: 0,
          descriptionLength: 0,
          h1Count: 0,
          imageCount: 0,
          imagesWithoutAlt: 0,
          internalLinks: 0,
          externalLinks: 0,
          loadTime: 0,
          responseCode: 0
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}