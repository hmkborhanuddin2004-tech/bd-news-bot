import 'dotenv/config';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const HISTORY_FILE = path.join(process.cwd(), 'data', 'ai_history.json');
const parser = new XMLParser();

const FALLBACK_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest'
];

const AI_FEEDS = [
  { name: 'The New Stack (Dev & Architecture)', url: 'https://thenewstack.io/feed/', category: 'coding' },
  { name: 'DEV Community (Coding & Tools)', url: 'https://dev.to/feed/tag/ai', category: 'coding' },
  { name: 'Creative & Image AI (Flux/Midjourney)', url: 'https://news.google.com/rss/search?q=%22image+generation%22+OR+Flux+OR+Midjourney+AI+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'creative' },
  { name: 'Prompt Engineering & Free AI Hacks', url: 'https://news.google.com/rss/search?q=%22prompt+engineering%22+OR+%22free+AI+tools%22+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'prompts' },
  { name: 'Open Source AI & Agentic Tools', url: 'https://news.google.com/rss/search?q=%22open+source%22+AI+tools+OR+%22AI+agent%22+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'agents' }
];

function loadAIHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

function saveAIHistory(history) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history.slice(-100), null, 2), 'utf8');
  } catch (e) {}
}

export async function fetchRawAIUpdates() {
  const history = loadAIHistory();
  const sentLinks = new Set(history.map(h => h.link));

  const feedPromises = AI_FEEDS.map(async (feed) => {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(5000)
      });
      const xml = await res.text();
      const obj = parser.parse(xml);
      const rawList = obj.rss?.channel?.item || [];
      const list = Array.isArray(rawList) ? rawList : (rawList ? [rawList] : []);

      const feedItems = [];
      for (const item of list.slice(0, 5)) {
        const title = item.title ? item.title.trim() : '';
        const link = item.link ? item.link.trim() : '';
        const desc = item.description ? item.description.replace(/<[^>]*>?/gm, '').trim().slice(0, 400) : '';

        if (title && link && !sentLinks.has(link)) {
          feedItems.push({
            title,
            link,
            desc,
            category: feed.category,
            source: feed.name
          });
        }
      }
      return feedItems;
    } catch (e) {
      console.error(`[Feed Error] ${feed.name}:`, e.message);
      return [];
    }
  });

  const results = await Promise.allSettled(feedPromises);
  const items = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      items.push(...r.value);
    }
  }

  return items;
}

export async function getAIResearchDigest() {
  const rawItems = await fetchRawAIUpdates();

  if (rawItems.length === 0) {
    return `<b>🤖 এআই রিসার্চ আপডেট</b>\n\nআজকের মতো নতুন কোনো বড় এআই রিলিজ পাওয়া যায়নি দোস্ত।\n\nতাজা খবরের জন্য লিখুন: <code>/news</code>`;
  }

  const selected = rawItems.slice(0, 3);

  const prompt = `তুমি একজন সিনিয়র এআই রিসার্চার ও ফেসবুক কনটেন্ট স্ট্র্যাটেজিস্ট।
নিচে ৩টি সর্বশেষ এআই আপডেট ও রিসোর্সের তথ্য দেওয়া হলো:
${JSON.stringify(selected, null, 2)}

তোমার কাজ হলো এই ৩টি বিষয়ের মধ্য থেকে সবচেয়ে আকর্ষণীয়, কার্যকর ও প্র্যাকটিক্যাল টপিকটি বেছে নিয়ে বোরহান ভাই এবং তার ফেসবুক পেজের জন্য একটি হাই-কোয়ালিটি বাংলা রিসার্চ পোস্ট তৈরি করা।

পোস্টটির কাঠামো হুবহু নিচের ফরম্যাটে হতে হবে (টেলিগ্রাম HTML ট্যাগ <b>, <i>, <code> ব্যবহার করবে):

🌟 <b>[টপিক/টুলের নাম ও ক্যাটাগরি]</b>
💰 <b>খরচ ও সুযোগ:</b> [সম্পূর্ণ ফ্রি নাকি অল্প খরচে বেশি টোকেন? সাধারণ মানুষ কীভাবে ফ্রিতে সুবিধা পাবে?]
📝 <b>সহজ বাংলা সারসংক্ষেপ (৬-১৫ লাইন):</b> [সহজ-সরল ভাষায় বাংলায় বুঝিয়ে দাও এটি কী, সাধারণ মানুষের বা ওয়েব/অ্যাপ/অটোমেশন কাজে কীভাবে ঘণ্টার কাজ মিনিটে করে দেয়। কোনো কঠিন ইংরেজি জার্গন ছাড়াই প্যারাগ্রাফ ও পয়েন্টে লিখবে, যা সরাসরি ফেসবুকে পোস্ট করা যায়।]
🛠️ <b>ব্যবহারের বাস্তব টিপস ও প্রম্পট রেসিপি:</b> [একটি রেডিমেড কপি-পেস্ট প্রম্পট বা প্র্যাকটিক্যাল ব্যবহারের ২-৩টি ধাপ।]
🔗 <b>অফিসিয়াল সোর্স:</b> <a href="${selected[0].link}">${selected[0].source}</a>

নিয়মাবলী:
- সম্পূর্ণ খাঁটি, ঝরঝরে ও প্রাণবন্ত বাংলায় লিখবে।
- অযথা কাল্পনিক কথা বলবে না, বাস্তব তথ্যের ওপর ভিত্তি করে লিখবে।`;

  for (const model of FALLBACK_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1200
          }
        }),
        signal: AbortSignal.timeout(15000)
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        const history = loadAIHistory();
        for (const item of selected) {
          history.push({ title: item.title, link: item.link, date: new Date().toISOString() });
        }
        saveAIHistory(history);

        const dateStr = new Date().toLocaleDateString('bn-BD', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const header = `<b>🧠 বক্কর এআই রিসার্চ ও কনটেন্ট ল্যাব</b>\n📅 <i>${dateStr}</i>\n════════════════════\n\n`;
        const footer = `\n\n════════════════════\n💡 <i>টিপস: এই লেখাটি আপনি হুবহু বা নিজের মতো পরিমার্জন করে আপনার ফেসবুক পেজে পোস্ট করতে পারেন!</i>`;

        return header + text.trim() + footer;
      }
    } catch (err) {
      console.warn(`[Gemini Model ${model} failed, trying next]:`, err.message);
    }
  }

  const item = selected[0];
  return `<b>🧠 বক্কর এআই রিসার্চ আপডেট</b>\n\n🌟 <b>${item.title}</b>\nসোর্স: ${item.source}\n🔗 <a href="${item.link}">বিস্তারিত পড়ুন</a>`;
}
