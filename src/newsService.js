import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

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
 * খবরের সোর্স নাম শিরোনাম থেকে আলাদা করা (যেমন: "- প্রথম আলো")
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
function createOneLineSummary(desc, title) {
  if (desc) {
    const cleaned = cleanText(desc);
    // প্রথম ১ বা ২ বাক্য নিয়ে ১ লাইনের সারাংশ তৈরি
    const sentences = cleaned.split(/(?<=[।?!.])/);
    if (sentences.length > 0 && sentences[0].length > 15) {
      let firstSentence = sentences[0].trim();
      if (firstSentence.length < 50 && sentences[1]) {
        firstSentence += ' ' + sentences[1].trim();
      }
      return firstSentence.length > 130 ? firstSentence.slice(0, 127) + '...' : firstSentence;
    }
  }
  // যদি ডেসক্রিপশন না থাকে তবে শিরোনামের প্রেক্ষিতে একটি প্রাসঙ্গিক সারসংক্ষেপ
  return `ঘটনাটির সর্বশেষ অগ্রগতি ও বিস্তারিত জানতে নিচের লিংকে ক্লিক করুন।`;
}

/**
 * ১. বাংলাদেশ ও জাতীয় শীর্ষ সংবাদ (৫টি)
 */
export async function getNationalNews() {
  try {
    // বিবিসি বাংলা আরএসএস থেকে টপ কোয়ালিটি নিউজ ও সামারি সংগ্রহ
    const bbcRes = await fetch('https://feeds.bbci.co.uk/bengali/rss.xml');
    const bbcXml = await bbcRes.text();
    const bbcData = parser.parse(bbcXml);
    const bbcItems = bbcData?.rss?.channel?.item || [];

    const newsList = [];
    for (const item of bbcItems.slice(0, 5)) {
      newsList.push({
        title: cleanText(item.title),
        summary: createOneLineSummary(item.description, item.title),
        link: item.link
      });
    }

    // যদি কোনো কারণে বিবিসি কম থাকে, তবে গুগল নিউজ বিডি দিয়ে পূরণ
    if (newsList.length < 5) {
      const gRes = await fetch('https://news.google.com/rss?hl=bn&gl=BD&ceid=BD:bn');
      const gXml = await gRes.text();
      const gData = parser.parse(gXml);
      const gItems = gData?.rss?.channel?.item || [];
      for (const item of gItems) {
        if (newsList.length >= 5) break;
        const { title, source } = parseHeadline(item.title);
        newsList.push({
          title: title + (source ? ` (${source})` : ''),
          summary: `জাতীয় পর্যায়ের গুরুত্বপূর্ণ এই ঘটনাটির বিস্তারিত আপডেট প্রকাশিত হয়েছে।`,
          link: item.link
        });
      }
    }
    return newsList;
  } catch (err) {
    console.error("National News Error:", err);
    return [];
  }
}

/**
 * ২. ফেসবুক ও সোশ্যাল মিডিয়া ট্রেন্ডিং বিষয় (৫টি)
 */
export async function getTrendingNews() {
  try {
    const url = 'https://news.google.com/rss/search?q=%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A7%87%E0%A6%B6+%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A7%87%E0%A6%88%E0%A6%A1%E0%A6%BF%E0%A6%82+OR+%E0%A6%AD%E0%A6%BE%E0%A6%87%E0%A6%B0%E0%A6%BE%E0%A6%B2+OR+%E0%A6%86%E0%A6%B2%E0%A7%8B%E0%A6%9A%E0%A6%A8%E0%A6%BE&hl=bn&gl=BD&ceid=BD:bn';
    const res = await fetch(url);
    const xml = await res.text();
    const data = parser.parse(xml);
    const items = data?.rss?.channel?.item || [];

    return items.slice(0, 5).map(item => {
      const { title, source } = parseHeadline(item.title);
      return {
        title: title + (source ? ` (${source})` : ''),
        summary: `সামাজিক যোগাযোগ মাধ্যমে বর্তমানে এটি ব্যাপকভাবে আলোচনা ও মনোযোগের কেন্দ্রবিন্দুতে রয়েছে।`,
        link: item.link
      };
    });
  } catch (err) {
    console.error("Trending News Error:", err);
    return [];
  }
}

/**
 * ৩. কৃত্রিম বুদ্ধিমত্তা (AI) ও প্রযুক্তি আপডেট (৫টি)
 */
export async function getAINews() {
  try {
    const url = 'https://news.google.com/rss/search?q=Artificial+Intelligence+AI+%E0%A6%95%E0%A7%83%E0%A6%A4%E0%A7%8D%E0%A6%B0%E0%A6%BF%E0%A6%AE+%E0%A6%AC%E0%A7%81%E0%A6%A6%E0%A7%8D%E0%A6%A7%E0%A6%BF%E0%A6%AE%E0%A6%A4%E0%A7%8D%E0%A6%A4%E0%A6%BE&hl=bn&gl=BD&ceid=BD:bn';
    const res = await fetch(url);
    const xml = await res.text();
    const data = parser.parse(xml);
    const items = data?.rss?.channel?.item || [];

    return items.slice(0, 5).map(item => {
      const { title, source } = parseHeadline(item.title);
      return {
        title: title + (source ? ` (${source})` : ''),
        summary: `এআই প্রযুক্তির সাম্প্রতিক উন্নয়ন ও বিশ্বব্যাপী এর প্রভাব সংক্রান্ত প্রযুক্তিগত তথ্য।`,
        link: item.link
      };
    });
  } catch (err) {
    console.error("AI News Error:", err);
    return [];
  }
}
