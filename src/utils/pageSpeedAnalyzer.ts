export interface PageSpeedIssue {
  type: 'error' | 'warning' | 'info' | 'success';
  category: 'loading' | 'rendering' | 'interactivity' | 'resources' | 'optimization';
  message: string;
  priority: 'high' | 'medium' | 'low';
  element?: string;
  recommendation?: string;
  impact: string;
  actionable: boolean;
  checkName: string;
  status: 'passed' | 'failed' | 'warning' | 'info';
  timeToFix: string;
  expectedImprovement: string;
}

export interface PageSpeedResult {
  url: string;
  score: number;
  issues: PageSpeedIssue[];
  actionableItems: PageSpeedIssue[];
  allChecks: {
    name: string;
    status: 'passed' | 'failed' | 'warning' | 'info';
    description: string;
    result: string;
    impact: string;
    recommendation?: string;
  }[];
  metrics: {
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    totalBlockingTime: number;
    resourceCount: {
      images: number;
      scripts: number;
      stylesheets: number;
      fonts: number;
    };
    totalSize: number;
    compressionEnabled: boolean;
    cacheHeaders: boolean;
  };
  coreWebVitals: {
    lcp: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
    fid: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
    cls: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
  };
  optimizationOpportunities: {
    category: string;
    title: string;
    description: string;
    potentialSavings: string;
    difficulty: 'easy' | 'medium' | 'hard';
    priority: number;
  }[];
  timestamp: string;
}

export class PageSpeedAnalyzer {
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

  private async fetchWithProxy(url: string, timeout = 15000): Promise<{ html: string; status: number; loadTime: number; responseHeaders: Headers }> {
    const startTime = Date.now();
    
    try {
      const response = await this.fetchWithTimeout(url, 5000);
      const html = await response.text();
      return {
        html,
        status: response.status,
        loadTime: Date.now() - startTime,
        responseHeaders: response.headers
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
          loadTime: Date.now() - startTime,
          responseHeaders: response.headers
        };
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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

  private analyzeLoadingPerformance(loadTime: number, doc: Document): PageSpeedIssue[] {
    const issues: PageSpeedIssue[] = [];

    // Page Load Time Analysis
    if (loadTime > 3000) {
      this.addCheck('Page Load Time', 'failed', 'Measure total page load time', `${loadTime}ms (slow)`, 'Poor user experience, high bounce rate', 'Optimize images, minify resources, enable compression');
      issues.push({
        type: 'error',
        category: 'loading',
        message: `Slow page load time (${loadTime}ms)`,
        priority: 'high',
        impact: 'Poor user experience, high bounce rate, negative SEO impact',
        recommendation: 'Optimize images, minify CSS/JS, enable gzip compression, use CDN',
        actionable: true,
        checkName: 'Page Load Time',
        status: 'failed',
        timeToFix: '4-8 hours',
        expectedImprovement: 'Reduce load time by 40-60%'
      });
    } else if (loadTime > 1500) {
      this.addCheck('Page Load Time', 'warning', 'Measure total page load time', `${loadTime}ms (moderate)`, 'Acceptable but could be improved', 'Consider optimizing for faster load times');
      issues.push({
        type: 'warning',
        category: 'loading',
        message: `Moderate page load time (${loadTime}ms)`,
        priority: 'medium',
        impact: 'Room for improvement in user experience',
        recommendation: 'Optimize images and consider lazy loading',
        actionable: true,
        checkName: 'Page Load Time',
        status: 'warning',
        timeToFix: '2-4 hours',
        expectedImprovement: 'Reduce load time by 20-30%'
      });
    } else {
      this.addCheck('Page Load Time', 'passed', 'Measure total page load time', `${loadTime}ms (good)`, 'Good user experience');
      issues.push({
        type: 'success',
        category: 'loading',
        message: `Good page load time (${loadTime}ms)`,
        priority: 'low',
        impact: 'Positive user experience',
        actionable: false,
        checkName: 'Page Load Time',
        status: 'passed',
        timeToFix: 'N/A',
        expectedImprovement: 'Already optimized'
      });
    }

    return issues;
  }

  private analyzeRenderBlocking(doc: Document): PageSpeedIssue[] {
    const issues: PageSpeedIssue[] = [];

    // CSS Analysis
    const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');
    if (stylesheets.length > 5) {
      this.addCheck('CSS Files', 'warning', 'Count CSS files that may block rendering', `${stylesheets.length} CSS files`, 'Multiple CSS files can slow initial render', 'Consider combining CSS files');
      issues.push({
        type: 'warning',
        category: 'rendering',
        message: `Multiple CSS files (${stylesheets.length}) may block rendering`,
        priority: 'medium',
        impact: 'Delayed first paint and content visibility',
        recommendation: 'Combine CSS files, inline critical CSS, use media queries for non-critical CSS',
        actionable: true,
        checkName: 'CSS Files',
        status: 'warning',
        timeToFix: '2-3 hours',
        expectedImprovement: 'Faster first contentful paint'
      });
    } else {
      this.addCheck('CSS Files', 'passed', 'Count CSS files that may block rendering', `${stylesheets.length} CSS files (reasonable)`, 'Good CSS file management');
    }

    // JavaScript Analysis
    const scripts = doc.querySelectorAll('script[src]:not([async]):not([defer])');
    if (scripts.length > 3) {
      this.addCheck('Render-blocking JS', 'warning', 'Check for render-blocking JavaScript', `${scripts.length} blocking scripts`, 'Scripts block HTML parsing', 'Add async or defer attributes to non-critical scripts');
      issues.push({
        type: 'warning',
        category: 'rendering',
        message: `${scripts.length} render-blocking JavaScript files`,
        priority: 'medium',
        impact: 'Delayed page rendering and interactivity',
        recommendation: 'Add async or defer attributes to non-critical scripts',
        actionable: true,
        checkName: 'Render-blocking JS',
        status: 'warning',
        timeToFix: '1-2 hours',
        expectedImprovement: 'Faster page rendering'
      });
    } else {
      this.addCheck('Render-blocking JS', 'passed', 'Check for render-blocking JavaScript', `${scripts.length} blocking scripts (acceptable)`, 'Good JavaScript loading strategy');
    }

    return issues;
  }

  private analyzeImages(doc: Document): PageSpeedIssue[] {
    const issues: PageSpeedIssue[] = [];

    const images = doc.querySelectorAll('img');
    const lazyImages = doc.querySelectorAll('img[loading="lazy"]');
    const imagesWithoutDimensions = Array.from(images).filter(img => 
      !img.getAttribute('width') && !img.getAttribute('height') && 
      !img.style.width && !img.style.height
    );

    // Lazy Loading Check
    if (images.length > 3 && lazyImages.length === 0) {
      this.addCheck('Image Lazy Loading', 'warning', 'Check if images use lazy loading', 'No lazy loading detected', 'All images load immediately', 'Implement lazy loading for below-fold images');
      issues.push({
        type: 'warning',
        category: 'optimization',
        message: 'Images not using lazy loading',
        priority: 'medium',
        impact: 'Slower initial page load, wasted bandwidth',
        recommendation: 'Add loading="lazy" to images below the fold',
        actionable: true,
        checkName: 'Image Lazy Loading',
        status: 'warning',
        timeToFix: '30 minutes',
        expectedImprovement: 'Faster initial load, reduced bandwidth usage'
      });
    } else if (lazyImages.length > 0) {
      this.addCheck('Image Lazy Loading', 'passed', 'Check if images use lazy loading', `${lazyImages.length} images use lazy loading`, 'Optimized image loading');
    }

    // Image Dimensions Check
    if (imagesWithoutDimensions.length > 0) {
      this.addCheck('Image Dimensions', 'warning', 'Check if images have explicit dimensions', `${imagesWithoutDimensions.length} images without dimensions`, 'May cause layout shifts', 'Add width and height attributes to images');
      issues.push({
        type: 'warning',
        category: 'rendering',
        message: `${imagesWithoutDimensions.length} images without explicit dimensions`,
        priority: 'medium',
        impact: 'Potential layout shifts, poor Core Web Vitals',
        recommendation: 'Add width and height attributes to prevent layout shifts',
        actionable: true,
        checkName: 'Image Dimensions',
        status: 'warning',
        timeToFix: '1 hour',
        expectedImprovement: 'Better Cumulative Layout Shift score'
      });
    } else if (images.length > 0) {
      this.addCheck('Image Dimensions', 'passed', 'Check if images have explicit dimensions', 'All images have dimensions', 'Prevents layout shifts');
    }

    return issues;
  }

  private analyzeCompression(responseHeaders: Headers): PageSpeedIssue[] {
    const issues: PageSpeedIssue[] = [];

    const contentEncoding = responseHeaders.get('content-encoding');
    const compressionEnabled = contentEncoding && (contentEncoding.includes('gzip') || contentEncoding.includes('br') || contentEncoding.includes('deflate'));

    if (!compressionEnabled) {
      this.addCheck('Text Compression', 'warning', 'Check if text resources are compressed', 'No compression detected', 'Larger file sizes, slower loading', 'Enable gzip or Brotli compression');
      issues.push({
        type: 'warning',
        category: 'optimization',
        message: 'Text compression not enabled',
        priority: 'medium',
        impact: 'Larger file sizes, slower download times',
        recommendation: 'Enable gzip or Brotli compression on your server',
        actionable: true,
        checkName: 'Text Compression',
        status: 'warning',
        timeToFix: '1 hour',
        expectedImprovement: 'Reduce file sizes by 60-80%'
      });
    } else {
      this.addCheck('Text Compression', 'passed', 'Check if text resources are compressed', `Compression enabled (${contentEncoding})`, 'Optimized file transfer');
    }

    return issues;
  }

  private analyzeCaching(responseHeaders: Headers): PageSpeedIssue[] {
    const issues: PageSpeedIssue[] = [];

    const cacheControl = responseHeaders.get('cache-control');
    const expires = responseHeaders.get('expires');
    const etag = responseHeaders.get('etag');
    const lastModified = responseHeaders.get('last-modified');

    const hasCacheHeaders = cacheControl || expires || etag || lastModified;

    if (!hasCacheHeaders) {
      this.addCheck('Browser Caching', 'warning', 'Check for browser caching headers', 'No cache headers found', 'Resources downloaded on every visit', 'Add cache-control headers for static resources');
      issues.push({
        type: 'warning',
        category: 'optimization',
        message: 'Browser caching not configured',
        priority: 'medium',
        impact: 'Resources re-downloaded on every visit',
        recommendation: 'Add Cache-Control headers for static resources',
        actionable: true,
        checkName: 'Browser Caching',
        status: 'warning',
        timeToFix: '30 minutes',
        expectedImprovement: 'Faster repeat visits'
      });
    } else {
      this.addCheck('Browser Caching', 'passed', 'Check for browser caching headers', 'Cache headers present', 'Optimized for repeat visits');
    }

    return issues;
  }

  private generateOptimizationOpportunities(issues: PageSpeedIssue[]): any[] {
    const opportunities = [];

    // Image Optimization
    if (issues.some(i => i.checkName === 'Image Lazy Loading' && i.status !== 'passed')) {
      opportunities.push({
        category: 'Images',
        title: 'Implement Image Lazy Loading',
        description: 'Load images only when they\'re about to enter the viewport',
        potentialSavings: '20-40% faster initial load',
        difficulty: 'easy',
        priority: 8
      });
    }

    // Compression
    if (issues.some(i => i.checkName === 'Text Compression' && i.status !== 'passed')) {
      opportunities.push({
        category: 'Compression',
        title: 'Enable Text Compression',
        description: 'Compress HTML, CSS, and JavaScript files with gzip or Brotli',
        potentialSavings: '60-80% file size reduction',
        difficulty: 'easy',
        priority: 9
      });
    }

    // Render-blocking Resources
    if (issues.some(i => i.checkName === 'Render-blocking JS' && i.status !== 'passed')) {
      opportunities.push({
        category: 'JavaScript',
        title: 'Eliminate Render-blocking JavaScript',
        description: 'Use async/defer attributes or inline critical JavaScript',
        potentialSavings: '10-30% faster rendering',
        difficulty: 'medium',
        priority: 7
      });
    }

    // CSS Optimization
    if (issues.some(i => i.checkName === 'CSS Files' && i.status !== 'passed')) {
      opportunities.push({
        category: 'CSS',
        title: 'Optimize CSS Delivery',
        description: 'Combine CSS files and inline critical styles',
        potentialSavings: '15-25% faster first paint',
        difficulty: 'medium',
        priority: 6
      });
    }

    // Caching
    if (issues.some(i => i.checkName === 'Browser Caching' && i.status !== 'passed')) {
      opportunities.push({
        category: 'Caching',
        title: 'Leverage Browser Caching',
        description: 'Set appropriate cache headers for static resources',
        potentialSavings: '50-90% faster repeat visits',
        difficulty: 'easy',
        priority: 8
      });
    }

    return opportunities.sort((a, b) => b.priority - a.priority);
  }

  public async analyzePage(url: string): Promise<PageSpeedResult> {
    const issues: PageSpeedIssue[] = [];
    this.allChecks = [];
    
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const { html, status, loadTime, responseHeaders } = await this.fetchWithProxy(url);
      const doc = this.parseHTML(html);

      // Run performance analyses
      issues.push(...this.analyzeLoadingPerformance(loadTime, doc));
      issues.push(...this.analyzeRenderBlocking(doc));
      issues.push(...this.analyzeImages(doc));
      issues.push(...this.analyzeCompression(responseHeaders));
      issues.push(...this.analyzeCaching(responseHeaders));

      // Calculate metrics
      const images = doc.querySelectorAll('img');
      const scripts = doc.querySelectorAll('script[src]');
      const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');
      const fonts = doc.querySelectorAll('link[rel="preload"][as="font"], @font-face');

      // Simulate Core Web Vitals (in real implementation, these would come from actual measurements)
      const simulatedLCP = loadTime * 0.8; // Approximate LCP
      const simulatedFID = Math.min(100, loadTime * 0.1); // Approximate FID
      const simulatedCLS = images.length > 0 && doc.querySelectorAll('img[width][height]').length < images.length ? 0.15 : 0.05;

      const metrics = {
        loadTime,
        domContentLoaded: loadTime * 0.7,
        firstContentfulPaint: loadTime * 0.4,
        largestContentfulPaint: simulatedLCP,
        cumulativeLayoutShift: simulatedCLS,
        firstInputDelay: simulatedFID,
        totalBlockingTime: scripts.length * 50,
        resourceCount: {
          images: images.length,
          scripts: scripts.length,
          stylesheets: stylesheets.length,
          fonts: fonts.length
        },
        totalSize: Math.round(html.length / 1024), // Approximate size in KB
        compressionEnabled: !!responseHeaders.get('content-encoding'),
        cacheHeaders: !!(responseHeaders.get('cache-control') || responseHeaders.get('expires'))
      };

      const coreWebVitals = {
        lcp: {
          value: simulatedLCP,
          rating: simulatedLCP <= 2500 ? 'good' : simulatedLCP <= 4000 ? 'needs-improvement' : 'poor'
        },
        fid: {
          value: simulatedFID,
          rating: simulatedFID <= 100 ? 'good' : simulatedFID <= 300 ? 'needs-improvement' : 'poor'
        },
        cls: {
          value: simulatedCLS,
          rating: simulatedCLS <= 0.1 ? 'good' : simulatedCLS <= 0.25 ? 'needs-improvement' : 'poor'
        }
      } as const;

      const actionableItems = issues.filter(issue => issue.actionable);
      const optimizationOpportunities = this.generateOptimizationOpportunities(issues);

      // Calculate score
      let score = 100;
      issues.forEach(issue => {
        switch (issue.type) {
          case 'error':
            score -= issue.priority === 'high' ? 25 : issue.priority === 'medium' ? 15 : 8;
            break;
          case 'warning':
            score -= issue.priority === 'high' ? 12 : issue.priority === 'medium' ? 8 : 4;
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
        metrics,
        coreWebVitals,
        optimizationOpportunities,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      this.addCheck('Page Analysis', 'failed', 'Analyze page performance', 'Analysis failed', 'Unable to perform performance analysis', 'Check if the URL is correct and accessible');
      
      issues.push({
        type: 'error',
        category: 'loading',
        message: `Performance analysis failed: ${errorMessage}`,
        priority: 'high',
        impact: 'Unable to perform performance analysis',
        recommendation: 'Check if the URL is correct and accessible',
        actionable: true,
        checkName: 'Page Analysis',
        status: 'failed',
        timeToFix: '5 minutes',
        expectedImprovement: 'Successful performance analysis'
      });

      return {
        url,
        score: 0,
        issues,
        actionableItems: issues.filter(issue => issue.actionable),
        allChecks: this.allChecks,
        metrics: {
          loadTime: 0,
          domContentLoaded: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          cumulativeLayoutShift: 0,
          firstInputDelay: 0,
          totalBlockingTime: 0,
          resourceCount: { images: 0, scripts: 0, stylesheets: 0, fonts: 0 },
          totalSize: 0,
          compressionEnabled: false,
          cacheHeaders: false
        },
        coreWebVitals: {
          lcp: { value: 0, rating: 'poor' },
          fid: { value: 0, rating: 'poor' },
          cls: { value: 0, rating: 'poor' }
        },
        optimizationOpportunities: [],
        timestamp: new Date().toISOString()
      };
    }
  }
}