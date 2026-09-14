import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

const HISTORY_FILE = path.resolve('data/history.json');

/**
 * হিস্ট্রি থেকে পূর্ববর্তী পাঠানো খবরের তালিকা লোড করা
 */
function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("হিস্ট্রি লোড করতে সমস্যা:", e.message);
  }
  return [];
}

/**
 * নতুন পাঠানো খবর হিস্ট্রিতে সেভ করা (সর্বোচ্চ ১০০টি সংরক্ষণ)
 */
export function recordSentNews(newsItems) {
  try {
    const history = loadHistory();
    const newHistory = [...history];

    for (const item of newsItems) {
      if (!newHistory.some(h => h.title === item.title || h.link === item.link)) {
        newHistory.push({
          title: item.title,
          link: item.link,
          sentAt: new Date().toISOString()
        });
      }
    }

    // ফাইল সাইজ ছোট রাখতে শুধু সর্বশেষ ১০০টি খবর রাখা হবে
    const trimmed = newHistory.slice(-100);
    fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
    console.log(`💾 হিস্ট্রি আপডেট করা হয়েছে (${newsItems.length}টি নতুন খবর সেভ হয়েছে)`);
  } catch (e) {
    console.error("হিস্ট্রি সেভ করতে সমস্যা:", e.message);
  }
}

/**
 * খবরটি কি আগে পাঠানো হয়েছিল কিনা যাচাই
 */
function isAlreadySent(title, link, history) {
  const cleanT = cleanText(title).toLowerCase();
  return history.some(h => {
    const histT = cleanText(h.title).toLowerCase();
    return h.link === link || cleanT === histT || (cleanT.length > 20 && histT.includes(cleanT.slice(0, 20)));
  });
}

/**
 * HTML ট্যাগ ও অতিরিক্ত স্পেস রিমুভ করার হেল্পার
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * খবরের সোর্স নাম শিরোনাম থেকে আলাদা করা
 */
function parseHeadline(rawTitle) {
  const cleaned = cleanText(rawTitle);
  const parts = cleaned.split(' - ');
  if (parts.length > 1) {
    const source = parts.pop();
    return { title: parts.join(' - '), source };
  }
  return { title: cleaned, source: '' };
}

/**
 * ১ লাইনের স্পষ্ট সারাংশ তৈরি করার ফাংশন
 */
function createOneLineSummary(desc) {
  if (desc) {
    const cleaned = cleanText(desc);
    const sentences = cleaned.split(/(?<=[।?!.])/);
    if (sentences.length > 0 && sentences[0].length > 15) {
      let firstSentence = sentences[0].trim();
      if (firstSentence.length < 50 && sentences[1]) {
        firstSentence += ' ' + sentences[1].trim();
      }
      return firstSentence.length > 130 ? firstSentence.slice(0, 127) + '...' : firstSentence;
    }
  }
  return `ঘটনাটির সর্বশেষ অগ্রগতি ও বিস্তারিত জানতে নিচের লিংকে ক্লিক করুন।`;
}

/**
 * ১. বাংলাদেশ ও জাতীয় শীর্ষ সংবাদ (৫টি সম্পূর্ণ তাজা খবর)
 */
export async function getNationalNews() {
  const history = loadHistory();
  const newsList = [];

  try {
    // বিবিসি বাংলা
    const bbcRes = await fetch('https://feeds.bbci.co.uk/bengali/rss.xml');
    const bbcXml = await bbcRes.text();
    const bbcData = parser.parse(bbcXml);
    const bbcItems = bbcData?.rss?.channel?.item || [];

    for (const item of bbcItems) {
      if (newsList.length >= 5) break;
      const title = cleanText(item.title);
      if (!isAlreadySent(title, item.link, history)) {
        newsList.push({
          title,
          summary: createOneLineSummary(item.description),
          link: item.link
        });
      }
    }

    // ব্যাকআপ হিসেবে গুগল নিউজ বিডি
    if (newsList.length < 5) {
      const gRes = await fetch('https://news.google.com/rss?hl=bn&gl=BD&ceid=BD:bn');
      const gXml = await gRes.text();
      const gData = parser.parse(gXml);
      const gItems = gData?.rss?.channel?.item || [];

      for (const item of gItems) {
        if (newsList.length >= 5) break;
        const { title, source } = parseHeadline(item.title);
        const fullTitle = title + (source ? ` (${source})` : '');
        if (!isAlreadySent(fullTitle, item.link, history)) {
          newsList.push({
            title: fullTitle,
            summary: `জাতীয় পর্যায়ের গুরুত্বপূর্ণ এই ঘটনাটির বিস্তারিত আপডেট প্রকাশিত হয়েছে।`,
            link: item.link
          });
        }
      }
    }
  } catch (err) {
    console.error("National News Error:", err);
  }

  return newsList;
}

/**
 * ২. ফেসবুক ও সোশ্যাল মিডিয়া ট্রেন্ডিং বিষয় (৫টি সম্পূর্ণ তাজা খবর)
 */
export async function getTrendingNews() {
  const history = loadHistory();
  const newsList = [];

  try {
    const url = 'https://news.google.com/rss/search?q=%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A7%87%E0%A6%B6+%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A7%87%E0%A6%88%E0%A6%A1%E0%A6%BF%E0%A6%82+OR+%E0%A6%AD%E0%A6%BE%E0%A6%87%E0%A6%B0%E0%A6%BE%E0%A6%B2+OR+%E0%A6%86%E0%A6%B2%E0%A7%8B%E0%A6%9A%E0%A6%A8%E0%A6%BE&hl=bn&gl=BD&ceid=BD:bn';
    const res = await fetch(url);
    const xml = await res.text();
    const data = parser.parse(xml);
    const items = data?.rss?.channel?.item || [];

    for (const item of items) {
      if (newsList.length >= 5) break;
      const { title, source } = parseHeadline(item.title);
      const fullTitle = title + (source ? ` (${source})` : '');
      if (!isAlreadySent(fullTitle, item.link, history)) {
        newsList.push({
          title: fullTitle,
          summary: `সামাজিক যোগাযোগ মাধ্যমে বর্তমানে এটি ব্যাপকভাবে আলোচনা ও মনোযোগের কেন্দ্রবিন্দুতে রয়েছে।`,
          link: item.link
        });
      }
    }
  } catch (err) {
    console.error("Trending News Error:", err);
  }

  return newsList;
}

/**
 * ৩. কৃত্রিম বুদ্ধিমত্তা (AI) ও প্রযুক্তি আপডেট (৫টি সম্পূর্ণ তাজা খবর)
 */
export async function getAINews() {
  const history = loadHistory();
  const newsList = [];

  try {
    const url = 'https://news.google.com/rss/search?q=Artificial+Intelligence+AI+%E0%A6%95%E0%A7%83%E0%A6%A4%E0%A7%8D%E0%A6%B0%E0%A6%BF%E0%A6%AE+%E0%A6%AC%E0%A7%81%E0%A6%A6%E0%A7%8D%E0%A6%A7%E0%A6%BF%E0%A6%AE%E0%A6%A4%E0%A7%8D%E0%A6%A4%E0%A6%BE&hl=bn&gl=BD&ceid=BD:bn';
    const res = await fetch(url);
    const xml = await res.text();
    const data = parser.parse(xml);
    const items = data?.rss?.channel?.item || [];

    for (const item of items) {
      if (newsList.length >= 5) break;
      const { title, source } = parseHeadline(item.title);
      const fullTitle = title + (source ? ` (${source})` : '');
      if (!isAlreadySent(fullTitle, item.link, history)) {
        newsList.push({
          title: fullTitle,
          summary: `এআই প্রযুক্তির সাম্প্রতিক উন্নয়ন ও বিশ্বব্যাপী এর প্রভাব সংক্রান্ত প্রযুক্তিগত তথ্য।`,
          link: item.link
        });
      }
    }
  } catch (err) {
    console.error("AI News Error:", err);
  }

  return newsList;
}
