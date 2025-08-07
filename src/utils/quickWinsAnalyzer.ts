export interface QuickWin {
  category: 'technical' | 'content' | 'performance' | 'meta';
  issue: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  recommendation: string;
  element?: string;
  priority: number; // 1-10, 10 being highest priority
  timeToImplement: string;
  expectedImpact: string;
  checkName: string;
}

export interface QuickWinsResult {
  url: string;
  overallScore: number;
  quickWins: QuickWin[];
  implementationPlan: {
    immediate: QuickWin[]; // Can be done in minutes
    shortTerm: QuickWin[]; // Can be done in hours/days
    longTerm: QuickWin[]; // Requires weeks/planning
  };
  summary: {
    easyWins: number;
    mediumWins: number;
    hardWins: number;
    highImpact: number;
    mediumImpact: number;
    lowImpact: number;
    totalTimeEstimate: string;
  };
  allChecks: {
    name: string;
    status: 'passed' | 'needs-improvement' | 'critical';
    description: string;
    result: string;
    recommendation?: string;
  }[];
  timestamp: string;
}

export class QuickWinsAnalyzer {
  private corsProxies = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
  ];

  private allChecks: {
    name: string;
    status: 'passed' | 'needs-improvement' | 'critical';
    description: string;
    result: string;
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

  private addCheck(name: string, status: 'passed' | 'needs-improvement' | 'critical', description: string, result: string, recommendation?: string) {
    this.allChecks.push({
      name,
      status,
      description,
      result,
      recommendation
    });
  }

  public async analyzeQuickWins(url: string): Promise<QuickWinsResult> {
    const quickWins: QuickWin[] = [];
    this.allChecks = []; // Reset checks for new analysis
    
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const { html, status, loadTime } = await this.fetchWithProxy(url);
      const doc = this.parseHTML(html);

      // Quick Win 1: Title Tag Optimization
      const title = doc.querySelector('title');
      if (!title || !title.textContent?.trim()) {
        this.addCheck('Title Tag', 'critical', 'Check for page title presence and optimization', 'Missing title tag', 'Add a descriptive title tag (50-60 characters)');
        quickWins.push({
          category: 'meta',
          issue: 'Missing title tag',
          impact: 'high',
          effort: 'easy',
          recommendation: 'Add a descriptive title tag that includes your primary keyword and is 50-60 characters long',
          priority: 10,
          timeToImplement: '5 minutes',
          expectedImpact: 'Immediate improvement in search result appearance and click-through rates',
          checkName: 'Title Tag'
        });
      } else {
        const titleLength = title.textContent.length;
        if (titleLength < 30 || titleLength > 60) {
          this.addCheck('Title Tag', 'needs-improvement', 'Check for page title presence and optimization', `Length: ${titleLength} characters`, titleLength < 30 ? 'Expand title to 50-60 characters' : 'Shorten title to under 60 characters');
          quickWins.push({
            category: 'meta',
            issue: `Title length not optimal (${titleLength} characters)`,
            impact: 'medium',
            effort: 'easy',
            recommendation: titleLength < 30 ? 'Expand title to include more descriptive keywords (50-60 chars)' : 'Shorten title to prevent truncation in search results (under 60 chars)',
            element: title.textContent,
            priority: 8,
            timeToImplement: '5 minutes',
            expectedImpact: 'Better search result display and improved CTR',
            checkName: 'Title Tag'
          });
        } else {
          this.addCheck('Title Tag', 'passed', 'Check for page title presence and optimization', `Optimal length: ${titleLength} characters`, undefined);
        }
      }

      // Quick Win 2: Meta Description
      const description = doc.querySelector('meta[name="description"]');
      if (!description || !description.getAttribute('content')?.trim()) {
        this.addCheck('Meta Description', 'critical', 'Check for meta description presence and optimization', 'Missing meta description', 'Add compelling meta description (150-160 characters)');
        quickWins.push({
          category: 'meta',
          issue: 'Missing meta description',
          impact: 'high',
          effort: 'easy',
          recommendation: 'Add a compelling meta description that summarizes the page content and includes a call-to-action (150-160 characters)',
          priority: 9,
          timeToImplement: '10 minutes',
          expectedImpact: 'Control how your page appears in search results and improve click-through rates',
          checkName: 'Meta Description'
        });
      } else {
        const descLength = description.getAttribute('content')!.length;
        if (descLength < 120 || descLength > 160) {
          this.addCheck('Meta Description', 'needs-improvement', 'Check for meta description presence and optimization', `Length: ${descLength} characters`, descLength < 120 ? 'Expand description to 150-160 characters' : 'Shorten description to under 160 characters');
          quickWins.push({
            category: 'meta',
            issue: `Meta description length not optimal (${descLength} characters)`,
            impact: 'medium',
            effort: 'easy',
            recommendation: descLength < 120 ? 'Expand description to better summarize page content (150-160 chars)' : 'Shorten description to prevent truncation in search results (under 160 chars)',
            element: description.getAttribute('content')!,
            priority: 7,
            timeToImplement: '10 minutes',
            expectedImpact: 'Better search result snippet and improved user engagement',
            checkName: 'Meta Description'
          });
        } else {
          this.addCheck('Meta Description', 'passed', 'Check for meta description presence and optimization', `Optimal length: ${descLength} characters`, undefined);
        }
      }

      // Quick Win 3: HTTPS Implementation
      if (!url.startsWith('https://')) {
        this.addCheck('HTTPS Security', 'critical', 'Check if site uses secure HTTPS protocol', 'HTTP only (not secure)', 'Implement SSL certificate and redirect HTTP to HTTPS');
        quickWins.push({
          category: 'technical',
          issue: 'Not using HTTPS',
          impact: 'high',
          effort: 'medium',
          recommendation: 'Implement SSL certificate and set up automatic redirects from HTTP to HTTPS',
          priority: 10,
          timeToImplement: '1-2 hours',
          expectedImpact: 'Improved security, user trust, and search engine rankings',
          checkName: 'HTTPS Security'
        });
      } else {
        this.addCheck('HTTPS Security', 'passed', 'Check if site uses secure HTTPS protocol', 'HTTPS enabled', undefined);
      }

      // Quick Win 4: Mobile Viewport
      const viewport = doc.querySelector('meta[name="viewport"]');
      if (!viewport) {
        this.addCheck('Mobile Viewport', 'critical', 'Check for mobile-friendly viewport configuration', 'Missing viewport meta tag', 'Add viewport meta tag for mobile responsiveness');
        quickWins.push({
          category: 'technical',
          issue: 'Missing viewport meta tag',
          impact: 'high',
          effort: 'easy',
          recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> to the <head> section',
          priority: 9,
          timeToImplement: '2 minutes',
          expectedImpact: 'Proper mobile display and improved mobile search rankings',
          checkName: 'Mobile Viewport'
        });
      } else {
        this.addCheck('Mobile Viewport', 'passed', 'Check for mobile-friendly viewport configuration', 'Viewport meta tag present', undefined);
      }

      // Quick Win 5: H1 Tag Optimization
      const h1Tags = doc.querySelectorAll('h1');
      if (h1Tags.length === 0) {
        this.addCheck('H1 Heading', 'critical', 'Check for main heading tag presence', 'No H1 tag found', 'Add exactly one H1 tag per page');
        quickWins.push({
          category: 'content',
          issue: 'Missing H1 tag',
          impact: 'high',
          effort: 'easy',
          recommendation: 'Add exactly one H1 tag that clearly describes the main topic of the page',
          priority: 8,
          timeToImplement: '5 minutes',
          expectedImpact: 'Clear page topic signal for search engines and better content structure',
          checkName: 'H1 Heading'
        });
      } else if (h1Tags.length > 1) {
        this.addCheck('H1 Heading', 'needs-improvement', 'Check for main heading tag presence', `${h1Tags.length} H1 tags found`, 'Use only one H1 tag per page');
        quickWins.push({
          category: 'content',
          issue: `Multiple H1 tags (${h1Tags.length} found)`,
          impact: 'medium',
          effort: 'easy',
          recommendation: 'Keep only one H1 tag and convert others to H2 or H3 tags as appropriate',
          element: Array.from(h1Tags).map(h1 => h1.textContent?.trim()).slice(0, 2).join(', '),
          priority: 6,
          timeToImplement: '10 minutes',
          expectedImpact: 'Clearer content hierarchy and improved SEO focus',
          checkName: 'H1 Heading'
        });
      } else {
        this.addCheck('H1 Heading', 'passed', 'Check for main heading tag presence', 'Single H1 tag found', undefined);
      }

      // Quick Win 6: Image Alt Text
      const images = doc.querySelectorAll('img');
      const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'));
      if (imagesWithoutAlt.length > 0) {
        this.addCheck('Image Alt Text', 'needs-improvement', 'Check for descriptive alt text on images', `${imagesWithoutAlt.length} images missing alt text`, 'Add descriptive alt text to all images');
        quickWins.push({
          category: 'content',
          issue: `${imagesWithoutAlt.length} images missing alt text`,
          impact: 'medium',
          effort: 'easy',
          recommendation: 'Add descriptive alt text to all images for better accessibility and SEO',
          priority: 7,
          timeToImplement: `${Math.ceil(imagesWithoutAlt.length * 2)} minutes`,
          expectedImpact: 'Better accessibility, image search visibility, and user experience',
          checkName: 'Image Alt Text'
        });
      } else if (images.length > 0) {
        this.addCheck('Image Alt Text', 'passed', 'Check for descriptive alt text on images', `All ${images.length} images have alt text`, undefined);
      } else {
        this.addCheck('Image Alt Text', 'passed', 'Check for descriptive alt text on images', 'No images found', undefined);
      }

      // Quick Win 7: Page Loading Speed
      if (loadTime > 3000) {
        this.addCheck('Page Speed', 'critical', 'Check page loading performance', `${loadTime}ms (slow)`, 'Optimize images, minify CSS/JS, enable compression');
        quickWins.push({
          category: 'performance',
          issue: `Slow page load time (${loadTime}ms)`,
          impact: 'high',
          effort: 'hard',
          recommendation: 'Optimize images, minify CSS/JS files, enable gzip compression, and consider using a CDN',
          priority: 9,
          timeToImplement: '4-8 hours',
          expectedImpact: 'Better user experience, lower bounce rate, and improved search rankings',
          checkName: 'Page Speed'
        });
      } else if (loadTime > 1500) {
        this.addCheck('Page Speed', 'needs-improvement', 'Check page loading performance', `${loadTime}ms (moderate)`, 'Consider optimizing for faster load times (target <1500ms)');
        quickWins.push({
          category: 'performance',
          issue: `Moderate page load time (${loadTime}ms)`,
          impact: 'medium',
          effort: 'medium',
          recommendation: 'Optimize images and consider lazy loading to improve load times',
          priority: 5,
          timeToImplement: '2-4 hours',
          expectedImpact: 'Improved user experience and better Core Web Vitals scores',
          checkName: 'Page Speed'
        });
      } else {
        this.addCheck('Page Speed', 'passed', 'Check page loading performance', `${loadTime}ms (good)`, undefined);
      }

      // Quick Win 8: Canonical Tag
      const canonical = doc.querySelector('link[rel="canonical"]');
      if (!canonical) {
        this.addCheck('Canonical URL', 'needs-improvement', 'Check for canonical URL specification', 'Missing canonical tag', 'Add canonical tag to prevent duplicate content issues');
        quickWins.push({
          category: 'technical',
          issue: 'Missing canonical tag',
          impact: 'medium',
          effort: 'easy',
          recommendation: 'Add a canonical tag to specify the preferred URL version and prevent duplicate content issues',
          priority: 6,
          timeToImplement: '5 minutes',
          expectedImpact: 'Prevention of duplicate content penalties and clearer URL signals',
          checkName: 'Canonical URL'
        });
      } else {
        this.addCheck('Canonical URL', 'passed', 'Check for canonical URL specification', 'Canonical tag present', undefined);
      }

      // Quick Win 9: Language Declaration
      const htmlLang = doc.documentElement.getAttribute('lang');
      if (!htmlLang) {
        this.addCheck('Language Declaration', 'needs-improvement', 'Check for HTML language attribute', 'Missing lang attribute', 'Add lang attribute to HTML element');
        quickWins.push({
          category: 'technical',
          issue: 'Missing language declaration',
          impact: 'medium',
          effort: 'easy',
          recommendation: 'Add lang attribute to HTML element (e.g., <html lang="en">) to help search engines understand content language',
          priority: 5,
          timeToImplement: '2 minutes',
          expectedImpact: 'Better international SEO and accessibility',
          checkName: 'Language Declaration'
        });
      } else {
        this.addCheck('Language Declaration', 'passed', 'Check for HTML language attribute', `Language: ${htmlLang}`, undefined);
      }

      // Quick Win 10: Open Graph Tags
      const ogTitle = doc.querySelector('meta[property="og:title"]');
      const ogDescription = doc.querySelector('meta[property="og:description"]');
      const ogImage = doc.querySelector('meta[property="og:image"]');
      
      if (!ogTitle || !ogDescription || !ogImage) {
        this.addCheck('Social Media Tags', 'needs-improvement', 'Check for Open Graph social media tags', 'Incomplete Open Graph tags', 'Add og:title, og:description, and og:image for social sharing');
        quickWins.push({
          category: 'meta',
          issue: 'Incomplete Open Graph tags',
          impact: 'medium',
          effort: 'easy',
          recommendation: 'Add og:title, og:description, and og:image meta tags for better social media sharing appearance',
          priority: 4,
          timeToImplement: '15 minutes',
          expectedImpact: 'Better appearance when shared on social media platforms',
          checkName: 'Social Media Tags'
        });
      } else {
        this.addCheck('Social Media Tags', 'passed', 'Check for Open Graph social media tags', 'Complete Open Graph tags found', undefined);
      }

      // Sort by priority (highest first)
      quickWins.sort((a, b) => b.priority - a.priority);

      // Create implementation plan
      const implementationPlan = {
        immediate: quickWins.filter(w => w.effort === 'easy' && w.timeToImplement.includes('minutes')),
        shortTerm: quickWins.filter(w => (w.effort === 'easy' && w.timeToImplement.includes('hour')) || w.effort === 'medium'),
        longTerm: quickWins.filter(w => w.effort === 'hard')
      };

      // Calculate time estimates
      const totalMinutes = quickWins.reduce((total, win) => {
        const timeStr = win.timeToImplement;
        if (timeStr.includes('minutes')) {
          return total + parseInt(timeStr);
        } else if (timeStr.includes('hour')) {
          return total + (parseInt(timeStr) * 60);
        }
        return total + 240; // Default 4 hours for complex tasks
      }, 0);

      const totalTimeEstimate = totalMinutes < 60 ? 
        `${totalMinutes} minutes` : 
        `${Math.round(totalMinutes / 60 * 10) / 10} hours`;

      // Calculate summary
      const summary = {
        easyWins: quickWins.filter(w => w.effort === 'easy').length,
        mediumWins: quickWins.filter(w => w.effort === 'medium').length,
        hardWins: quickWins.filter(w => w.effort === 'hard').length,
        highImpact: quickWins.filter(w => w.impact === 'high').length,
        mediumImpact: quickWins.filter(w => w.impact === 'medium').length,
        lowImpact: quickWins.filter(w => w.impact === 'low').length,
        totalTimeEstimate
      };

      // Calculate overall score
      let score = 100;
      quickWins.forEach(win => {
        const impactDeduction = win.impact === 'high' ? 15 : win.impact === 'medium' ? 8 : 3;
        score -= impactDeduction;
      });
      score = Math.max(0, Math.min(100, score));

      return {
        url,
        overallScore: score,
        quickWins,
        implementationPlan,
        summary,
        allChecks: this.allChecks,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.addCheck('Page Analysis', 'critical', 'Analyze page for quick SEO wins', 'Analysis failed', 'Check if URL is accessible and try again');
      
      return {
        url,
        overallScore: 0,
        quickWins: [{
          category: 'technical',
          issue: 'Analysis failed',
          impact: 'high',
          effort: 'easy',
          recommendation: 'Check if URL is accessible and try again',
          priority: 10,
          timeToImplement: '5 minutes',
          expectedImpact: 'Successful SEO analysis',
          checkName: 'Page Analysis'
        }],
        implementationPlan: {
          immediate: [],
          shortTerm: [],
          longTerm: []
        },
        summary: {
          easyWins: 1,
          mediumWins: 0,
          hardWins: 0,
          highImpact: 1,
          mediumImpact: 0,
          lowImpact: 0,
          totalTimeEstimate: '5 minutes'
        },
        allChecks: this.allChecks,
        timestamp: new Date().toISOString()
      };
    }
  }

  public generateCSVReport(result: QuickWinsResult): string {
    const headers = [
      'Priority',
      'Category',
      'Issue',
      'Impact',
      'Effort',
      'Time to Implement',
      'Recommendation',
      'Expected Impact',
      'Element',
      'Status',
      'Notes'
    ];

    const rows = result.quickWins.map(win => [
      win.priority.toString(),
      win.category,
      win.issue,
      win.impact,
      win.effort,
      win.timeToImplement,
      win.recommendation,
      win.expectedImpact,
      win.element || '',
      '', // Status - empty for client to fill
      ''  // Notes - empty for client to fill
    ]);

    const csvContent = [
      `SEO Quick Wins Report - ${result.url}`,
      `Generated: ${new Date(result.timestamp).toLocaleDateString()}`,
      `Overall Score: ${result.overallScore}/100`,
      `Total Implementation Time: ${result.summary.totalTimeEstimate}`,
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}