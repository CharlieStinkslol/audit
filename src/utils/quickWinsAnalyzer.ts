export interface QuickWin {
  category: 'technical' | 'content' | 'performance' | 'meta';
  issue: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  recommendation: string;
  element?: string;
  priority: number; // 1-10, 10 being highest priority
}

export interface QuickWinsResult {
  url: string;
  overallScore: number;
  quickWins: QuickWin[];
  summary: {
    easyWins: number;
    mediumWins: number;
    hardWins: number;
    highImpact: number;
    mediumImpact: number;
    lowImpact: number;
  };
  timestamp: string;
}

export class QuickWinsAnalyzer {
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

  public async analyzeQuickWins(url: string): Promise<QuickWinsResult> {
    const quickWins: QuickWin[] = [];
    
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const { html, status, loadTime } = await this.fetchWithProxy(url);
      const doc = this.parseHTML(html);

      // Meta Tag Quick Wins
      const title = doc.querySelector('title');
      if (!title || !title.textContent?.trim()) {
        quickWins.push({
          category: 'meta',
          issue: 'Missing title tag',
          impact: 'high',
          effort: 'easy',
          recommendation: 'Add a descriptive title tag (50-60 characters)',
          priority: 10
        });
      } else {
        const titleLength = title.textContent.length;
        if (titleLength < 30 || titleLength > 60) {
          quickWins.push({
            category: 'meta',
            issue: `Title length not optimal (${titleLength} characters)`,
            impact: 'medium',
            effort: 'easy',
            recommendation: titleLength < 30 ? 'Expand title to 50-60 characters' : 'Shorten title to under 60 characters',
            element: title.textContent,
            priority: 8
          });
        }
      }

      const description = doc.querySelector('meta[name="description"]');
      if (!description || !description.getAttribute('content')?.trim()) {
        quickWins.push({
          category: 'meta',
          issue: 'Missing meta description',
          impact: 'high',
          effort: 'easy',
          recommendation: 'Add compelling meta description (150-160 characters)',
          priority: 9
        });
      } else {
        const descLength = description.getAttribute('content')!.length;
        if (descLength < 120 || descLength > 160) {
          quickWins.push({
            category: 'meta',
            issue: `Meta description length not optimal (${descLength} characters)`,
            impact: 'medium',
            effort: 'easy',
            recommendation: descLength < 120 ? 'Expand description to 150-160 characters' : 'Shorten description to under 160 characters',
            element: description.getAttribute('content')!,
            priority: 7
          });
        }
      }

      // Technical Quick Wins
      if (!url.startsWith('https://')) {
        quickWins.push({
          category: 'technical',
          issue: 'Not using HTTPS',
          impact: 'high',
          effort: 'medium',
          recommendation: 'Implement SSL certificate and redirect HTTP to HTTPS',
          priority: 10
        });
      }

      const viewport = doc.querySelector('meta[name="viewport"]');
      if (!viewport) {
        quickWins.push({
          category: 'technical',
          issue: 'Missing viewport meta tag',
          impact: 'high',
          effort: 'easy',
          recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">',
          priority: 9
        });
      }

      const canonical = doc.querySelector('link[rel="canonical"]');
      if (!canonical) {
        quickWins.push({
          category: 'technical',
          issue: 'Missing canonical tag',
          impact: 'medium',
          effort: 'easy',
          recommendation: 'Add canonical tag to prevent duplicate content issues',
          priority: 6
        });
      }

      const htmlLang = doc.documentElement.getAttribute('lang');
      if (!htmlLang) {
        quickWins.push({
          category: 'technical',
          issue: 'Missing language declaration',
          impact: 'medium',
          effort: 'easy',
          recommendation: 'Add lang attribute to HTML element (e.g., lang="en")',
          priority: 5
        });
      }

      // Content Quick Wins
      const h1Tags = doc.querySelectorAll('h1');
      if (h1Tags.length === 0) {
        quickWins.push({
          category: 'content',
          issue: 'Missing H1 tag',
          impact: 'high',
          effort: 'easy',
          recommendation: 'Add exactly one H1 tag per page',
          priority: 8
        });
      } else if (h1Tags.length > 1) {
        quickWins.push({
          category: 'content',
          issue: `Multiple H1 tags (${h1Tags.length} found)`,
          impact: 'medium',
          effort: 'easy',
          recommendation: 'Use only one H1 tag per page',
          element: Array.from(h1Tags).map(h1 => h1.textContent?.trim()).slice(0, 2).join(', '),
          priority: 6
        });
      }

      const images = doc.querySelectorAll('img');
      const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'));
      if (imagesWithoutAlt.length > 0) {
        quickWins.push({
          category: 'content',
          issue: `${imagesWithoutAlt.length} images missing alt text`,
          impact: 'medium',
          effort: 'easy',
          recommendation: 'Add descriptive alt text to all images',
          priority: 7
        });
      }

      // Performance Quick Wins
      if (loadTime > 3000) {
        quickWins.push({
          category: 'performance',
          issue: `Slow page load time (${loadTime}ms)`,
          impact: 'high',
          effort: 'hard',
          recommendation: 'Optimize images, minify CSS/JS, enable compression',
          priority: 9
        });
      } else if (loadTime > 1500) {
        quickWins.push({
          category: 'performance',
          issue: `Moderate page load time (${loadTime}ms)`,
          impact: 'medium',
          effort: 'medium',
          recommendation: 'Optimize for faster load times (target <1500ms)',
          priority: 5
        });
      }

      const scripts = doc.querySelectorAll('script[src]:not([async]):not([defer])');
      if (scripts.length > 3) {
        quickWins.push({
          category: 'performance',
          issue: `${scripts.length} render-blocking scripts`,
          impact: 'medium',
          effort: 'medium',
          recommendation: 'Add async or defer attributes to non-critical scripts',
          priority: 4
        });
      }

      const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');
      if (stylesheets.length > 5) {
        quickWins.push({
          category: 'performance',
          issue: `${stylesheets.length} CSS files`,
          impact: 'low',
          effort: 'medium',
          recommendation: 'Consider combining CSS files to reduce HTTP requests',
          priority: 3
        });
      }

      // Structured Data Quick Win
      const structuredData = doc.querySelectorAll('script[type="application/ld+json"]');
      if (structuredData.length === 0) {
        quickWins.push({
          category: 'technical',
          issue: 'No structured data found',
          impact: 'medium',
          effort: 'medium',
          recommendation: 'Add Schema.org structured data for rich snippets',
          priority: 5
        });
      }

      // Open Graph Quick Wins
      const ogTitle = doc.querySelector('meta[property="og:title"]');
      const ogDescription = doc.querySelector('meta[property="og:description"]');
      const ogImage = doc.querySelector('meta[property="og:image"]');
      
      if (!ogTitle || !ogDescription || !ogImage) {
        quickWins.push({
          category: 'meta',
          issue: 'Incomplete Open Graph tags',
          impact: 'medium',
          effort: 'easy',
          recommendation: 'Add og:title, og:description, and og:image for social sharing',
          priority: 4
        });
      }

      // Sort by priority (highest first)
      quickWins.sort((a, b) => b.priority - a.priority);

      // Calculate summary
      const summary = {
        easyWins: quickWins.filter(w => w.effort === 'easy').length,
        mediumWins: quickWins.filter(w => w.effort === 'medium').length,
        hardWins: quickWins.filter(w => w.effort === 'hard').length,
        highImpact: quickWins.filter(w => w.impact === 'high').length,
        mediumImpact: quickWins.filter(w => w.impact === 'medium').length,
        lowImpact: quickWins.filter(w => w.impact === 'low').length
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
        summary,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        url,
        overallScore: 0,
        quickWins: [{
          category: 'technical',
          issue: 'Analysis failed',
          impact: 'high',
          effort: 'easy',
          recommendation: 'Check if URL is accessible and try again',
          priority: 10
        }],
        summary: {
          easyWins: 1,
          mediumWins: 0,
          hardWins: 0,
          highImpact: 1,
          mediumImpact: 0,
          lowImpact: 0
        },
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
      'Recommendation',
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
      win.recommendation,
      win.element || '',
      '', // Status - empty for client to fill
      ''  // Notes - empty for client to fill
    ]);

    const csvContent = [
      `SEO Quick Wins Report - ${result.url}`,
      `Generated: ${new Date(result.timestamp).toLocaleDateString()}`,
      `Overall Score: ${result.overallScore}/100`,
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}