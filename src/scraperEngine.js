import * as cheerio from 'cheerio';
import { XMLParser } from 'fast-xml-parser';

const xmlParser = new XMLParser();

const TRUSTED_AI_FEEDS = [
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/' },
  { name: 'Google News AI Trending', url: 'https://news.google.com/rss/search?q=%22OpenAI%22+OR+%22Anthropic%22+OR+%22Google+DeepMind%22+OR+%22DeepSeek%22+when:2d&hl=en-US&gl=US&ceid=US:en' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' }
];

/**
 * সরাসরি ওয়েব পেজে গিয়ে আসল আর্টিকেলের বডি স্ক্র্যাপ করে আনা (No Hallucination)
 */
export async function scrapeArticle(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(7000)
    });

    if (!res.ok) return { success: false, url, error: `HTTP ${res.status}` };

    const html = await res.text();
    const $ = cheerio.load(html);

    // অপ্রয়োজনীয় ট্যাগ ডিলিট
    $('script, style, noscript, nav, footer, header, svg, iframe, form').remove();

    const title = $('h1').first().text().trim() || $('title').text().trim();

    // প্যারাগ্রাফ ও আর্টিকেল বডি সংগ্রহ
    let bodyText = '';
    const articleElements = $('article, main, .article-content, .entry-content, .post-content, #content');
    
    if (articleElements.length > 0) {
      bodyText = articleElements.find('p').map((_, el) => $(el).text().trim()).get().join('\n\n');
    }

    if (!bodyText || bodyText.length < 200) {
      bodyText = $('p').map((_, el) => $(el).text().trim()).get().join('\n\n');
    }

    // ক্লিন ও ট্রিম করা (সর্বোচ্চ ৩০০০ অক্ষর যাতে জেমিনির কন্টেক্সট ক্লিন থাকে)
    const cleanText = bodyText.replace(/\s+/g, ' ').trim().slice(0, 3000);

    return {
      success: cleanText.length > 100,
      url,
      title,
      text: cleanText
    };
  } catch (err) {
    return { success: false, url, error: err.message };
  }
}

/**
 * ইন্টারনেট থেকে তাজা এআই খবরের আসল ফুল-টেক্সট সংগ্রহ করা
 */
export async function fetchScrapedAIUpdates(maxCount = 2) {
  const verifiedArticles = [];

  for (const feed of TRUSTED_AI_FEEDS) {
    if (verifiedArticles.length >= maxCount) break;

    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000)
      });
      const xml = await res.text();
      const obj = xmlParser.parse(xml);
      const rawList = obj.rss?.channel?.item || obj.feed?.entry || [];
      const list = Array.isArray(rawList) ? rawList : (rawList ? [rawList] : []);

      for (const item of list.slice(0, 3)) {
        if (verifiedArticles.length >= maxCount) break;

        const link = item.link?.['@_href'] || item.link || '';
        const title = item.title?.['#text'] || item.title || '';

        if (link && typeof link === 'string' && link.startsWith('http')) {
          console.log(`🌐 স্ক্র্যাপার ভিজিট করছে: ${title.slice(0, 50)}...`);
          const scraped = await scrapeArticle(link);
          if (scraped.success && scraped.text.length > 200) {
            verifiedArticles.push({
              source: feed.name,
              title: scraped.title || title,
              link,
              fullText: scraped.text
            });
          }
        }
      }
    } catch (e) {
      console.warn(`[Scraper Warning] ${feed.name}:`, e.message);
    }
  }

  return verifiedArticles;
}
