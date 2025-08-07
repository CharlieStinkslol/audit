export interface BlogPost {
  url: string;
  title: string;
  wordCount: number;
  readingTime: number;
  hasMetaDescription: boolean;
  metaDescriptionLength: number;
  h1Count: number;
  h2Count: number;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  publishDate?: string;
  lastModified?: string;
  contentQuality: 'thin' | 'adequate' | 'comprehensive';
  duplicateContent: boolean;
  keywordDensity: { [key: string]: number };
}

export interface BlogContentIssue {
  type: 'error' | 'warning' | 'info' | 'success';
  category: 'content-quality' | 'seo-optimization' | 'structure' | 'performance';
  message: string;
  priority: 'high' | 'medium' | 'low';
  affectedPosts: string[];
  recommendation: string;
}

export interface BlogContentResult {
  url: string;
  blogUrl?: string;
  totalPosts: number;
  scannedPosts: number;
  posts: BlogPost[];
  issues: BlogContentIssue[];
  summary: {
    thinContent: number;
    duplicateContent: number;
    missingMetaDescriptions: number;
    poorStructure: number;
    averageWordCount: number;
    averageReadingTime: number;
  };
  score: number;
  timestamp: string;
}

export class BlogContentAnalyzer {
  private corsProxies = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
  ];

  private async fetchWithProxy(url: string, timeout = 15000): Promise<{ html: string; status: number }> {
    try {
      const response = await this.fetchWithTimeout(url, 5000);
      const html = await response.text();
      return { html, status: response.status };
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
        
        return { html, status };
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

  private findBlogUrls(doc: Document, baseUrl: string): string[] {
    const blogUrls: Set<string> = new Set();
    const links = doc.querySelectorAll('a[href]');
    
    // Common blog URL patterns
    const blogPatterns = [
      /\/blog\//i,
      /\/articles?\//i,
      /\/posts?\//i,
      /\/news\//i,
      /\/insights?\//i,
      /\/resources?\//i,
      /\/learn\//i,
      /\/guides?\//i
    ];

    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      try {
        let fullUrl: string;
        if (href.startsWith('http')) {
          fullUrl = href;
        } else if (href.startsWith('/')) {
          fullUrl = new URL(href, baseUrl).href;
        } else {
          fullUrl = new URL(href, baseUrl).href;
        }

        // Check if URL matches blog patterns
        const matchesBlogPattern = blogPatterns.some(pattern => pattern.test(fullUrl));
        
        // Also check link text for blog indicators
        const linkText = link.textContent?.toLowerCase() || '';
        const textIndicatesBlog = ['blog', 'article', 'post', 'news', 'insight', 'resource', 'guide', 'learn'].some(
          keyword => linkText.includes(keyword)
        );

        if (matchesBlogPattern || textIndicatesBlog) {
          // Ensure it's from the same domain
          const linkDomain = new URL(fullUrl).hostname;
          const baseDomain = new URL(baseUrl).hostname;
          
          if (linkDomain === baseDomain) {
            blogUrls.add(fullUrl);
          }
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });

    return Array.from(blogUrls).slice(0, 20); // Limit to 20 blog posts
  }

  private async analyzeBlogPost(url: string): Promise<BlogPost> {
    try {
      const { html } = await this.fetchWithProxy(url);
      const doc = this.parseHTML(html);

      // Extract title
      const titleElement = doc.querySelector('title, h1, .post-title, .article-title, [class*="title"]');
      const title = titleElement?.textContent?.trim() || 'Untitled';

      // Extract main content
      const contentSelectors = [
        'article',
        '.post-content',
        '.article-content',
        '.entry-content',
        '.blog-content',
        'main',
        '.content'
      ];

      let contentElement: Element | null = null;
      for (const selector of contentSelectors) {
        contentElement = doc.querySelector(selector);
        if (contentElement) break;
      }

      if (!contentElement) {
        contentElement = doc.body;
      }

      // Calculate word count and reading time
      const textContent = contentElement.textContent || '';
      const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
      const wordCount = words.length;
      const readingTime = Math.ceil(wordCount / 200); // Average reading speed

      // Meta description analysis
      const metaDescription = doc.querySelector('meta[name="description"]');
      const hasMetaDescription = !!metaDescription?.getAttribute('content')?.trim();
      const metaDescriptionLength = metaDescription?.getAttribute('content')?.length || 0;

      // Header analysis
      const h1Count = doc.querySelectorAll('h1').length;
      const h2Count = doc.querySelectorAll('h2').length;

      // Image analysis
      const images = doc.querySelectorAll('img');
      const imageCount = images.length;
      const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt')).length;

      // Link analysis
      const links = doc.querySelectorAll('a[href]');
      let internalLinks = 0;
      let externalLinks = 0;
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
            }
          } else if (href.startsWith('/')) {
            internalLinks++;
          }
        } catch (e) {
          // Invalid URL, skip
        }
      });

      // Content quality assessment
      let contentQuality: 'thin' | 'adequate' | 'comprehensive';
      if (wordCount < 300) {
        contentQuality = 'thin';
      } else if (wordCount < 1000) {
        contentQuality = 'adequate';
      } else {
        contentQuality = 'comprehensive';
      }

      // Basic keyword density (top 10 words)
      const keywordDensity: { [key: string]: number } = {};
      const cleanWords = words
        .map(word => word.toLowerCase().replace(/[^\w]/g, ''))
        .filter(word => word.length > 3)
        .filter(word => !['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'said', 'each', 'which', 'their', 'time', 'more', 'very', 'what', 'know', 'just', 'first', 'into', 'over', 'think', 'also', 'your', 'work', 'life', 'only', 'can', 'still', 'should', 'after', 'being', 'now', 'made', 'before', 'here', 'through', 'when', 'where', 'much', 'some', 'these', 'many', 'would', 'there'].includes(word));

      const wordFreq: { [key: string]: number } = {};
      cleanWords.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });

      const sortedWords = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

      sortedWords.forEach(([word, count]) => {
        keywordDensity[word] = (count / wordCount) * 100;
      });

      // Extract dates (basic attempt)
      const dateSelectors = [
        'time[datetime]',
        '.published',
        '.date',
        '.post-date',
        '.article-date',
        '[class*="date"]'
      ];

      let publishDate: string | undefined;
      for (const selector of dateSelectors) {
        const dateElement = doc.querySelector(selector);
        if (dateElement) {
          publishDate = dateElement.getAttribute('datetime') || dateElement.textContent?.trim();
          break;
        }
      }

      return {
        url,
        title,
        wordCount,
        readingTime,
        hasMetaDescription,
        metaDescriptionLength,
        h1Count,
        h2Count,
        imageCount,
        imagesWithoutAlt,
        internalLinks,
        externalLinks,
        publishDate,
        contentQuality,
        duplicateContent: false, // Would need more sophisticated analysis
        keywordDensity
      };

    } catch (error) {
      // Return minimal data for failed posts
      return {
        url,
        title: 'Failed to analyze',
        wordCount: 0,
        readingTime: 0,
        hasMetaDescription: false,
        metaDescriptionLength: 0,
        h1Count: 0,
        h2Count: 0,
        imageCount: 0,
        imagesWithoutAlt: 0,
        internalLinks: 0,
        externalLinks: 0,
        contentQuality: 'thin',
        duplicateContent: false,
        keywordDensity: {}
      };
    }
  }

  public async analyzeContent(url: string): Promise<BlogContentResult> {
    const issues: BlogContentIssue[] = [];
    
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // First, get the main page to find blog URLs
      const { html } = await this.fetchWithProxy(url);
      const doc = this.parseHTML(html);

      // Find blog URLs
      const blogUrls = this.findBlogUrls(doc, url);
      
      if (blogUrls.length === 0) {
        issues.push({
          type: 'warning',
          category: 'structure',
          message: 'No blog posts found',
          priority: 'medium',
          affectedPosts: [],
          recommendation: 'Ensure blog posts are properly linked from the main site'
        });

        return {
          url,
          totalPosts: 0,
          scannedPosts: 0,
          posts: [],
          issues,
          summary: {
            thinContent: 0,
            duplicateContent: 0,
            missingMetaDescriptions: 0,
            poorStructure: 0,
            averageWordCount: 0,
            averageReadingTime: 0
          },
          score: 50,
          timestamp: new Date().toISOString()
        };
      }

      // Analyze each blog post
      const posts: BlogPost[] = [];
      const maxPosts = Math.min(blogUrls.length, 15); // Limit to 15 posts for performance

      for (let i = 0; i < maxPosts; i++) {
        try {
          const post = await this.analyzeBlogPost(blogUrls[i]);
          posts.push(post);
        } catch (error) {
          console.log(`Failed to analyze post: ${blogUrls[i]}`);
        }
      }

      // Analyze issues across all posts
      const thinContentPosts = posts.filter(p => p.contentQuality === 'thin');
      const missingMetaPosts = posts.filter(p => !p.hasMetaDescription);
      const poorStructurePosts = posts.filter(p => p.h1Count !== 1 || p.h2Count === 0);
      const imagesWithoutAltPosts = posts.filter(p => p.imagesWithoutAlt > 0);

      // Generate issues
      if (thinContentPosts.length > 0) {
        issues.push({
          type: 'error',
          category: 'content-quality',
          message: `${thinContentPosts.length} posts with thin content (<300 words)`,
          priority: 'high',
          affectedPosts: thinContentPosts.map(p => p.title),
          recommendation: 'Expand thin content posts to at least 300-500 words with valuable information'
        });
      }

      if (missingMetaPosts.length > 0) {
        issues.push({
          type: 'error',
          category: 'seo-optimization',
          message: `${missingMetaPosts.length} posts missing meta descriptions`,
          priority: 'high',
          affectedPosts: missingMetaPosts.map(p => p.title),
          recommendation: 'Add compelling meta descriptions (150-160 characters) to all blog posts'
        });
      }

      if (poorStructurePosts.length > 0) {
        issues.push({
          type: 'warning',
          category: 'structure',
          message: `${poorStructurePosts.length} posts with poor header structure`,
          priority: 'medium',
          affectedPosts: poorStructurePosts.map(p => p.title),
          recommendation: 'Ensure each post has exactly one H1 and multiple H2 subheadings'
        });
      }

      if (imagesWithoutAltPosts.length > 0) {
        const totalMissingAlt = imagesWithoutAltPosts.reduce((sum, p) => sum + p.imagesWithoutAlt, 0);
        issues.push({
          type: 'warning',
          category: 'seo-optimization',
          message: `${totalMissingAlt} images missing alt text across ${imagesWithoutAltPosts.length} posts`,
          priority: 'medium',
          affectedPosts: imagesWithoutAltPosts.map(p => p.title),
          recommendation: 'Add descriptive alt text to all images for better accessibility and SEO'
        });
      }

      // Calculate summary statistics
      const totalWords = posts.reduce((sum, p) => sum + p.wordCount, 0);
      const totalReadingTime = posts.reduce((sum, p) => sum + p.readingTime, 0);

      const summary = {
        thinContent: thinContentPosts.length,
        duplicateContent: 0, // Would need more sophisticated analysis
        missingMetaDescriptions: missingMetaPosts.length,
        poorStructure: poorStructurePosts.length,
        averageWordCount: posts.length > 0 ? Math.round(totalWords / posts.length) : 0,
        averageReadingTime: posts.length > 0 ? Math.round(totalReadingTime / posts.length) : 0
      };

      // Calculate score
      let score = 100;
      score -= thinContentPosts.length * 10;
      score -= missingMetaPosts.length * 8;
      score -= poorStructurePosts.length * 5;
      score -= Math.min(imagesWithoutAltPosts.length * 3, 20);
      score = Math.max(0, Math.min(100, score));

      return {
        url,
        blogUrl: blogUrls[0],
        totalPosts: blogUrls.length,
        scannedPosts: posts.length,
        posts,
        issues,
        summary,
        score,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      issues.push({
        type: 'error',
        category: 'performance',
        message: 'Failed to analyze blog content',
        priority: 'high',
        affectedPosts: [],
        recommendation: 'Check if the website is accessible and has a blog section'
      });

      return {
        url,
        totalPosts: 0,
        scannedPosts: 0,
        posts: [],
        issues,
        summary: {
          thinContent: 0,
          duplicateContent: 0,
          missingMetaDescriptions: 0,
          poorStructure: 0,
          averageWordCount: 0,
          averageReadingTime: 0
        },
        score: 0,
        timestamp: new Date().toISOString()
      };
    }
  }
}