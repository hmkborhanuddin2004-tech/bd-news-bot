import 'dotenv/config';
import { fetchScrapedAIUpdates } from './scraperEngine.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const FALLBACK_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest'
];

/**
 * চলমান শীর্ষ এআই মডেলগুলোর কম্পিটিশন ও বেঞ্চমার্ক ডেটাবেস
 */
export const MODEL_COMPETITION_DATABASE = [
  {
    category: '🎨 ইমেজ জেনারেশন কম্পিটিশন (Image Generation)',
    title: 'Midjourney v6 vs Flux.1 (Schnell/Dev) vs Recraft.ai',
    leader: 'Flux.1 & Midjourney v6',
    challenger: 'Ideogram 2.0 & Recraft',
    whyBetter: 'মিডজার্নি আর্ট ও সিনেমাটিক ভাইবের জন্য সেরা হলেও Flux.1 মানুষের হাতের আঙুল, নিখুঁত স্কিন টেক্সচার এবং টেক্সট রেন্ডারিংয়ে মিডজার্নিকে ছাড়িয়ে গেছে। আর Ideogram ছবিতে নিখুঁত ইংরেজি ফন্ট লেখার জন্য অপরাজেয়।',
    freeVsPaid: {
      free: 'Flux Schnell (HuggingFace ও Fal.ai-তে সম্পূর্ণ ফ্রি), Ideogram (প্রতিদিন ১০টি ফ্রি প্রম্পট)।',
      paid: 'Midjourney (ন্যূনতম $10/মাস, কোনো ফ্রি ট্রায়াল নেই), Flux Pro ($0.05 প্রতি ইমেজ)।',
      tokenCost: 'সাধারণত ক্রেডিট বা ইমেজ ভিত্তিক হিসাব হয়। Flux Schnell ফ্রিতে আনলিমিটেড ট্রাই করা যায়।'
    },
    useCases: 'সোশ্যাল মিডিয়া ব্যানার, রেস্তোরাঁ পোস্টার, প্রোডাক্ট শুট, বুক কভার।'
  },
  {
    category: '💻 কোডিং ও সফটওয়্যার ডেভেলপমেন্ট কম্পিটিশন (Coding & Dev)',
    title: 'Claude 3.5 Sonnet vs DeepSeek R1 vs OpenAI o1 / GPT-4o',
    leader: 'Claude 3.5 Sonnet & DeepSeek R1',
    challenger: 'OpenAI o1 / Cursor AI',
    whyBetter: 'Claude 3.5 Sonnet ফ্রন্টএন্ড এবং পুরো কোডবেস রিফ্যাক্টরিংয়ে বিশ্বের শীর্ষ মডেল। অন্যদিকে DeepSeek R1 মাত্র এক-দশমাংশ খরচে এবং সম্পূর্ণ ফ্রি ওপেন-সোর্সে OpenAI o1-এর সমান রিজনিং ও অ্যালগরিদম সলভিং দিচ্ছে।',
    freeVsPaid: {
      free: 'DeepSeek Chat (সম্পূর্ণ ১০০% ফ্রি ও আনলিমিটেড), Claude.ai (দৈনিক সীমিত ফ্রি মেসেজ)।',
      paid: 'Claude Pro ($20/মাস), ChatGPT Plus ($20/মাস)।',
      tokenCost: 'DeepSeek API: $0.14-$0.55 প্রতি ১ মিলিয়ন টোকেন (অবিশ্বাস্য সস্তা)। Claude 3.5: ইনপুট $3 / আউটপুট $15 প্রতি ১ মিলিয়ন টোকেন।'
    },
    useCases: 'ফুলস্ট্যাক ওয়েব অ্যাপ, বাগ ফিক্সিং, ডাটাবেস স্ক্রিপ্ট, এআই এজেন্ট কোডিং।'
  },
  {
    category: '🧠 জেনারেল ইন্টেলিজেন্স ও লং-কনটেক্সট (General AI & Large Documents)',
    title: 'Google Gemini 2.5 Flash vs ChatGPT 4o vs Perplexity Pro',
    leader: 'Google Gemini 2.5 & ChatGPT 4o',
    challenger: 'Perplexity AI & Claude',
    whyBetter: 'গুগল জেমিনিতে বিনামূল্যে ২ মিলিয়ন টোকেন পর্যন্ত কনটেক্সট দেওয়া যায় (পুরো একটি বই বা হাজার লাইনের কোড একবারে দেওয়া সম্ভব)। আর ChatGPT 4o দ্রুততম ভয়েস ও রিয়েল-টাইম কনভার্সেশনের জন্য এগিয়ে।',
    freeVsPaid: {
      free: 'Google AI Studio (সম্পূর্ণ ফ্রি এবং বিশাল টোকেন লিমিট), ChatGPT Free (সীমিত 4o এক্সেস)।',
      paid: 'ChatGPT Plus ($20/মাস), Gemini Advanced ($20/মাস)।',
      tokenCost: 'Gemini 2.5 Flash: ইনপুট $0.075 / আউটপুট $0.30 প্রতি ১ মিলিয়ন টোকেন (বাজেট ফ্রেন্ডলি)।'
    },
    useCases: 'বড় রিসার্চ পেপার বিশ্লেষণ, মিটিং সামারি, বই অনুবাদ, রিয়েল-টাইম বাংলা চ্যাট।'
  },
  {
    category: '⚡ নো-কোড ও এআই এজেন্ট ডেভেলপমেন্ট (No-Code & Agentic Builders)',
    title: 'Bolt.new vs v0.dev (Vercel) vs Lovable.dev',
    leader: 'Bolt.new & Lovable.dev',
    challenger: 'v0.dev & Cursor',
    whyBetter: 'Bolt.new ব্রাউজারের ভেতর সম্পূর্ণ নোডজেএস কন্টেইনার চালায়, তাই এক প্রম্পটে ফুলস্ট্যাক অ্যাপ রান করে। v0 নিখুঁত Tailwind React কম্পোনেন্ট তৈরি করে। Lovable নন-টেকি মানুষের জন্য পুরো ব্যাকএন্ড সহ অ্যাপ বানায়।',
    freeVsPaid: {
      free: 'Bolt.new (দৈনিক ফ্রি টোকেন লিমিট), v0.dev (মাসে ২০০ ফ্রি ক্রেডিট)।',
      paid: 'Bolt Pro ($20/মাস), v0 Premium ($20/মাস)।',
      tokenCost: 'প্রম্পট জেনারেশন ও রানটাইম ক্লাউড কম্পিউট অনুযায়ী ক্রেডিট কাটে।'
    },
    useCases: 'প্রোটোটাইপ ওয়েবসাইট, ক্লায়েন্ট ড্যাশবোর্ড, ল্যান্ডিং পেজ, অটোমেশন টুলস।'
  }
];

let currentIndex = 0;

/**
 * গ্লোবাল এআই কম্পিটিশন, মডেলের চুলচেরা তুলনা ও টোকেন খরচের বিশ্লেষণ জেনারেট করা
 */
export async function getAIMarketComparisonReport() {
  // ১. লাইভ স্ক্র্যাপার দিয়ে ইন্টারনেটের তাজা রিলিজ চেক করা
  let liveContext = '';
  try {
    const scraped = await fetchScrapedAIUpdates(1);
    if (scraped.length > 0) {
      liveContext = `\n[সর্বশেষ লাইভ ইন্টারনেট আপডেট - সোর্স: ${scraped[0].source}]:\nশিরোনাম: ${scraped[0].title}\nমূল তথ্য: ${scraped[0].fullText.slice(0, 800)}\nলিঙ্ক: ${scraped[0].link}\n`;
    }
  } catch (err) {
    console.warn('Scraper context fallback:', err.message);
  }

  // ২. কিউরেটেড ডাটাবেস থেকে একটি কম্পিটিশন টপিক নির্বাচন
  const topic = MODEL_COMPETITION_DATABASE[currentIndex % MODEL_COMPETITION_DATABASE.length];
  currentIndex++;

  const prompt = `তুমি একজন আন্তর্জাতিক এআই মার্কেট অ্যানালিস্ট ও এআই সিস্টেম আর্কিটেক্ট।
বোরহান ভাইয়ের জন্য এআই কোম্পানিগুলোর চলমান প্রতিযোগিতা, মডেলদের চুলচেরা তুলনা ও টোকেন খরচের একটি প্রফেশনাল ও সহজবোধ্য বাংলা রিপোর্ট তৈরি করো।

[মডেল কম্পিটিশন ডেটা]:
- ক্যাটাগরি: ${topic.category}
- শিরোনাম: ${topic.title}
- বর্তমান শীর্ষে: ${topic.leader}
- মূল চ্যালেঞ্জার: ${topic.challenger}
- কেন সেরা এবং তাত্ত্বিক ও প্রায়োগিক যুক্তি: ${topic.whyBetter}
- ফ্রি সুবিধা: ${topic.freeVsPaid.free}
- পেইড খরচ: ${topic.freeVsPaid.paid}
- টোকেন খরচের হিসাব: ${topic.freeVsPaid.tokenCost}
- সেরা ব্যবহারের ক্ষেত্র: ${topic.useCases}
${liveContext ? liveContext : ''}

[কড়া নিয়মাবলী]:
১. কোনো মনগড়া বা কাল্পনিক মডেলের নাম লিখবে না।
২. সহজ-সরল বাংলায় বুঝিয়ে দাও কোন কোম্পানি কীভাবে এগিয়ে যাচ্ছে, কেন একটি মডেল অন্যটিকে ছাড়িয়ে যাচ্ছে।
৩. সাধারণ মানুষের জন্য খরচের সহজ হিসাব (যেমন: ফ্রিতে কয়টা কাজ করা যায় বা মাসে কত) এবং ডেভেলপারদের টোকেন হিসাব দুটোই স্পষ্টভাবে তুলে ধরবে।
৪. টেলিগ্রাম HTML ফরম্যাটে লিখবে (<b>, <i>, <code>, <a>)।

[ফরম্যাট]:
⚔️ <b>${topic.category}</b>
━━━━━━━━━━━━━━━━━━━━
🏆 <b>${topic.title}</b>

🥊 <b>কে কাকে টেক্কা দিচ্ছে এবং কেন সেরা?</b>
(এখানে প্যারাগ্রাফে বিস্তারিত তাত্ত্বিক ও প্রায়োগিক কারণ লিখবে—যেমন কেন ফ্লাক্স মিডজার্নিকে বিট করছে বা কেন ক্লড জিপিটিকে টেক্কা দিচ্ছে।)

💰 <b>ব্যবহারের সুযোগ, টোকেন ও খরচের হিসাব:</b>
• <b>সম্পূর্ণ ফ্রি সুবিধা:</b> ${topic.freeVsPaid.free}
• <b>পেইড খরচ:</b> ${topic.freeVsPaid.paid}
• <b>টোকেন ও খরচের গণনা:</b> ${topic.freeVsPaid.tokenCost}

🎯 <b>আপনার কোন কাজের জন্য কোনটি বেছে নেবেন?</b>
(বোরহান ভাই ও তার অডিয়েন্স কোন কাজের জন্য কোন মডেলটি ব্যবহার করবেন তার পরামর্শ।)`;

  for (const model of FALLBACK_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1400
          }
        }),
        signal: AbortSignal.timeout(30000)
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        const dateStr = new Date().toLocaleDateString('bn-BD', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const header = `🌐 <b>বক্কর গ্লোবাল এআই কম্পিটিশন ও মার্কেট ওয়াচ</b>\n📅 <i>${dateStr}</i>\n════════════════════\n\n`;
        const footer = `\n\n════════════════════\n💡 <i>কমান্ড: তাৎক্ষণিক প্রম্পট রেসিপি পেতে লিখুন <code>/ai</code> এবং খবরের জন্য <code>/news</code></i>`;

        return header + text.trim() + footer;
      }
    } catch (err) {
      console.warn(`[Market Analysis Gemini ${model} failed]:`, err.message);
    }
  }

  // ফলব্যাক
  return `🌐 <b>বক্কর গ্লোবাল এআই কম্পিটিশন ওয়াচ</b>\n\n` +
    `🏆 <b>${topic.title}</b>\n\n` +
    `💡 <b>কেন সেরা:</b> ${topic.whyBetter}\n\n` +
    `💰 <b>ফ্রি ও পেইড:</b> ${topic.freeVsPaid.free} | ${topic.freeVsPaid.paid}\n` +
    `📊 <b>টোকেন হিসাব:</b> ${topic.freeVsPaid.tokenCost}`;
}
