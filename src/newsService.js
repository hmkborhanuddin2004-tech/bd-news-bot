import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

/**
 * গুগল নিউজ আরএসএস ফিড থেকে খবর সংগ্রহ ও পার্স করে
 */
export async function getTopBDNews() {
  try {
    const url = 'https://news.google.com/rss?hl=bn&gl=BD&ceid=BD:bn';
    const response = await fetch(url);
    const xmlData = await response.text();
    const result = parser.parse(xmlData);

    const items = result?.rss?.channel?.item || [];
    return items.slice(0, 5).map(item => ({
      title: cleanTitle(item.title),
      link: item.link,
      pubDate: item.pubDate ? new Date(item.pubDate).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : ''
    }));
  } catch (error) {
    console.error("BD News Fetch Error:", error);
    return [];
  }
}

/**
 * AI সংক্রান্ত সর্বশেষ আপডেটসংগ্রহ
 */
export async function getAINews() {
  try {
    const url = 'https://news.google.com/rss/search?q=Artificial+Intelligence+AI&hl=bn&gl=BD&ceid=BD:bn';
    const response = await fetch(url);
    const xmlData = await response.text();
    const result = parser.parse(xmlData);

    const items = result?.rss?.channel?.item || [];
    return items.slice(0, 3).map(item => ({
      title: cleanTitle(item.title),
      link: item.link,
      pubDate: item.pubDate ? new Date(item.pubDate).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : ''
    }));
  } catch (error) {
    console.error("AI News Fetch Error:", error);
    return [];
  }
}

/**
 * সংবাদের শিরোনাম পরিষ্কার করার হেল্পার
 */
function cleanTitle(rawTitle) {
  if (!rawTitle) return '';
  // HTML এনটিটি ও এক্সট্রা সোর্স নাম রিমুভ
  return rawTitle.replace(/<[^>]*>/g, '').trim();
}
