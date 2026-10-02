import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const HISTORY_FILE = path.join(process.cwd(), 'data', 'ai_history.json');

const FALLBACK_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest'
];

/**
 * বোরহান ভাইয়ের ৩টি মূল স্তম্ভ (Core Pillars):
 * ১. ফটো এডিটিং/ইমেজ প্রম্পট, মিডজার্নি/ফ্লাক্স ট্রিকস এবং কন্টেন্ট তৈরির সহজ গাইড।
 * ২. প্র্যাকটিক্যাল এআই টিউটোরিয়াল, প্রম্পট ইঞ্জিনিয়ারিং, ফ্রিতে বিভিন্ন এআই ব্যবহার এবং এআই কমিউনিটি লার্নিং।
 * ৩. সারা বিশ্বের ডেভেলপারদের অভিজ্ঞতা, কোডিং হ্যাকস, ফ্রিতে টুলস তৈরির গাইড, ওয়েব ও অ্যাপ ডেভেলপমেন্ট টিপস।
 */
export const CORE_PILLARS = [
  {
    id: 'creative',
    name: '🎨 ফটো এডিটিং/ইমেজ প্রম্পট, মিডজার্নি/ফ্লাক্স ট্রিকস এবং কন্টেন্ট তৈরির সহজ গাইড',
    topics: [
      {
        tool: 'Flux.1 Schnell & Dev',
        freeUrl: 'https://huggingface.co/spaces/black-forest-labs/FLUX.1-schnell',
        title: 'ফ্রি Flux AI দিয়ে আল্ট্রা-রিয়েলিস্টিক ১০৮০×১০৮০ ইমেজ তৈরির মাস্টার রেসিপি',
        objective: 'মিডজার্নির পেইড সাবস্ক্রিপশন ছাড়াই সম্পূর্ণ ফ্রিতে স্টুডিও কোয়ালিটি ছবি তৈরি',
        whyBetter: 'Flux টেক্সট রেন্ডারিং এবং মানুষের ত্বকের টেক্সচারে বর্তমান বিশ্বের সবচেয়ে শক্তিশালী ওপেন-মডেল।',
        samplePrompt: 'A hyper-realistic studio portrait of a futuristic AI developer working in a cyberpunk Dhaka neon lab, intense focus, 8k resolution, cinematic lighting, shot on 85mm lens, photorealistic skin texture, dramatic atmosphere --ar 1:1 --v 6.0'
      },
      {
        tool: 'Ideogram 2.0',
        freeUrl: 'https://ideogram.ai',
        title: 'ছবিতে পারফেক্ট টেক্সট ও পোস্টার ডিজাইন (ফ্রি টায়ার ট্রিক)',
        objective: 'পোস্টারের ভেতর সঠিক ইংরেজি বা লোগো টাইপোগ্রাফি জেনারেট করা',
        whyBetter: 'অন্যান্য এআই ছবিতে ভুল বানান লেখে, কিন্তু Ideogram নিখুঁত ফন্ট ও পোস্টার গ্রাফিক্স তৈরি করে।',
        samplePrompt: 'A vintage retro coffee shop poster, bold typography headline written "AI REVOLUTION COFFEE", warm ambient background, clean graphic design layout, vector aesthetic, high contrast'
      },
      {
        tool: 'Canva AI + ChatGPT',
        freeUrl: 'https://www.canva.com',
        title: 'রেস্তোরাঁ ও ফুড বিজনেসের লোভনীয় সোশ্যাল মিডিয়া পোস্টার মাত্র ৬০ সেকেন্ডে',
        objective: 'জিরো-ডিজাইন স্কিলে ভাইরাল ফেসবুক ফুড ব্যানার মেকিং',
        whyBetter: 'ChatGPT দেয় স্ক্রোল-স্টপিং বাংলা হুক আর ক্যানভা ম্যাজিক এআই এক ক্লিকে সাইজ অনুযায়ী এলিমেন্ট সাজিয়ে দেয়।',
        samplePrompt: 'Act as a top food marketer. Write a 3-line mouth-watering Bengali Facebook ad caption for a spicy burger discount with bullet points, emotional hook and strong CTA.'
      },
      {
        tool: 'Recraft.ai & Vectorizer',
        freeUrl: 'https://www.recraft.ai',
        title: 'প্রফেশনাল ভেক্টর আর্ট ও থ্রিডি আইকন মেকিং (সম্পূর্ণ আনলিমিটেড ফ্রি)',
        objective: 'ওয়েবসাইট ও অ্যাপের জন্য ক্রিস্প ভেক্টর এবং ৩ডি ইলাস্ট্রেশন তৈরি',
        whyBetter: 'এটি সরাসরি SVG ও ভেক্টর ফরম্যাটে ফাইল ডাউনলোড দেয় যা বড় করলেও ফাটে না।',
        samplePrompt: '3D glossy isometric icon of a glowing artificial intelligence robot brain holding a glowing code laptop, vibrant pastel colors, clean white background, soft shadow'
      }
    ]
  },
  {
    id: 'practical',
    name: '🧪 প্র্যাকটিক্যাল এআই টিউটোরিয়াল, প্রম্পট ইঞ্জিনিয়ারিং, ফ্রিতে বিভিন্ন এআই ব্যবহার এবং এআই কমিউনিটি লার্নিং',
    topics: [
      {
        tool: 'Google Gemini 2.5 Flash / Flash-Lite',
        freeUrl: 'https://aistudio.google.com',
        title: 'গুগল এআই স্টুডিওতে সম্পূর্ণ ফ্রিতে আনলিমিটেড টোকেন ব্যবহারের সিক্রেট',
        objective: 'পেইড চ্যাটজিপিটি সাবস্ক্রিপশন ছাড়াই বড় বই বা দীর্ঘ কোডবেস এক ক্লিকে বিশ্লেষণ',
        whyBetter: 'গুগল এআই স্টুডিওতে সম্পূর্ণ বিনামূল্যে বিশাল কনটেক্সট উইন্ডো পাওয়া যায় যা অন্য কোথাও ফ্রি নেই।',
        samplePrompt: 'You are an expert tech educator. Analyze this entire code/document step by step. Identify the top 3 bottlenecks, explain why they occur in plain Bengali, and provide ready-to-run optimized snippets.'
      },
      {
        tool: 'Claude 3.5 Sonnet / Prompt Engineering',
        freeUrl: 'https://claude.ai',
        title: 'মানুষের মতো ঝরঝরে বাংলা লেখা ও কনটেন্ট পাওয়ার ৩-লেয়ার প্রম্পট ফর্মুলা',
        objective: 'এআই-এর রোবোটিক ভাব দূর করে ১০০% ন্যাচারাল বাংলা পোস্ট ও আর্টিকেলের জাদু',
        whyBetter: 'সরাসরি রোল, কনটেক্সট এবং সীমাবদ্ধতা (Negative Constraints) বেঁধে দিলে কোনো রোবোটিক শব্দ আসে না।',
        samplePrompt: 'ভূমিকা: তুমি একজন দরদী বাংলা টেক মেন্টর।\nউদ্দেশ্য: সাধারণ মানুষকে এআই এজেন্টের কাজ সহজ ভাষায় শেখানো।\nশর্ত: কোনো প্রকার কঠিন ইংরেজি জার্গন ব্যবহার করবে না। সহজ দেশীয় রূপক দিয়ে ৩টি পয়েন্টে বুঝিয়ে দাও।'
      },
      {
        tool: 'Perplexity AI & DeepSeek',
        freeUrl: 'https://www.perplexity.ai',
        title: 'ইন্টারনেট ঘেঁটে খাঁটি রেফারেন্স সহ যেকোনো রিসার্চ পেপার বা মার্কেট রিপোর্ট',
        objective: 'গুগল সার্চে ঘণ্টার পর ঘণ্টা সময় নষ্ট না করে ১ মিনিটে সত্য তথ্য যাচাই',
        whyBetter: 'প্রতিটি তথ্যের পাশে লাইভ ওয়েবসাইট লিংক ও ফুটনোট দিয়ে দেয়, ফলে কোনো ভুল বা মনগড়া তথ্য থাকার সুযোগ নেই।',
        samplePrompt: 'What are the top 3 open-source AI developer tools released in the last 30 days? Compare their free tiers, GitHub star growth, and primary use cases with authentic citations.'
      },
      {
        tool: 'Prompt Engineering 101',
        freeUrl: 'https://chatgpt.com',
        title: '১০ গুণ বেটার আউটপুট পাওয়ার মাস্টার "CREATE" প্রম্পট ফ্রেমওয়ার্ক',
        objective: 'সাধারণ অস্পষ্ট প্রম্পট বাদ দিয়ে প্রফেশনাল রেজাল্ট পাওয়ার টেকনিক',
        whyBetter: 'এআই মডেল তখনই সেরা আউটপুট দেয় যখন তাকে Context, Role, Example, Action, Tone ও Evaluation স্পষ্ট বলে দেওয়া হয়।',
        samplePrompt: 'Role: Senior Automation Engineer\nContext: Building a client lead generator\nAction: Create a step-by-step architecture\nTone: Professional, practical\nOutput format: Bullet points with tool recommendations'
      }
    ]
  },
  {
    id: 'developer',
    name: '💻 সারা বিশ্বের ডেভেলপারদের অভিজ্ঞতা, কোডিং হ্যাকস, ফ্রিতে টুলস তৈরির গাইড, ওয়েব ও অ্যাপ ডেভেলপমেন্ট টিপস',
    topics: [
      {
        tool: 'Bolt.new & WebContainer',
        freeUrl: 'https://bolt.new',
        title: 'ব্রাউজার থেকেই একটি প্রম্পট দিয়ে ফুলস্ট্যাক ওয়েব অ্যাপ লাইভ করার উপায়',
        objective: 'কম্পিউটারে নোডজেএস বা জটিল এনভায়রনমেন্ট সেটআপ ছাড়াই প্রজেক্ট তৈরি ও প্রিভিউ',
        whyBetter: 'ইন-ব্রাউজার ফুলস্ট্যাক কন্টেইনার রান করে এবং এক ক্লিকে নেটলিফাই বা ভার্সেলে ডেপ্লয় করা যায়।',
        samplePrompt: 'Build a modern responsive Task Manager SaaS dashboard in Next.js and Tailwind CSS with local storage support, dark mode toggle, and smooth framer-motion animations.'
      },
      {
        tool: 'v0.dev by Vercel',
        freeUrl: 'https://v0.dev',
        title: 'স্ক্রিনশট বা প্রম্পট দিয়ে প্রফেশনাল ইউআই/ইউএক্স (Tailwind + React) তৈরি',
        objective: 'ডিজাইন করতে ঘণ্টার পর ঘণ্টা সময় অপচয় বন্ধ করে রিয়েল কোড জেনারেট করা',
        whyBetter: 'ভার্সেলের অফিশিয়াল এআই যা সরাসরি ক্লিন রিঅ্যাক্ট কম্পোনেন্ট দেয় যা কপি করে প্রজেক্টে বসানো যায়।',
        samplePrompt: 'Create a clean, modern landing page hero section for an AI Automation Agency with an interactive feature cards grid, gradient buttons, and responsive navbar.'
      },
      {
        tool: 'Cursor AI & Claude Code',
        freeUrl: 'https://www.cursor.com',
        title: 'কোডিং না জেনেও এআই এজেন্টের সাহায্যে পুরো প্রজেক্টের বাগ ফিক্স ও ফিচার যোগ',
        objective: 'ভিএস কোডের মধ্যে পুরো রিপোজিটরি ইন্ডেক্স করে এআই পেয়ার প্রোগ্রামিং করা',
        whyBetter: 'Cursor পুরো কোডবেসের রেফারেন্স একবারে পড়ে এবং একাধিক ফাইলে একসাথে এডিট করতে পারে।',
        samplePrompt: 'Index the entire project codebase. Find all API error handlers, ensure graceful fallback with retries, and document each change with inline comments.'
      },
      {
        tool: 'Make.com & Webhook Automations',
        freeUrl: 'https://www.make.com',
        title: 'জিরো কোডিংয়ে ফেসবুক পেজ, টেলিগ্রাম ও গুগল শিট অটোমেশন পাইপলাইন',
        objective: 'ক্লায়েন্টের জন্য হাই-পেয়িং অটোমেশন সার্ভিস তৈরি করে আয় করার ফ্রিল্যান্সিং গাইড',
        whyBetter: 'ভিজ্যুয়াল ড্র্যাগ-অ্যান্ড-ড্রপ দিয়ে কোনো কোডিং ছাড়াই জটিল এপিআই ইন্টিগ্রেশন সম্পন্ন করা যায়।',
        samplePrompt: 'Design a workflow where new Facebook page comments are analyzed by Gemini AI; if sentiment is positive, post a thank you reply, if negative, alert the admin on Telegram.'
      }
    ]
  }
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

/**
 * ৩টি স্তম্ভের মধ্য থেকে ক্রমান্বয়ে ও আকর্ষণীয়ভাবে বিষয় বাছাই
 */
function selectNextTopic() {
  const history = loadAIHistory();
  const seenTitles = new Set(history.map(h => h.title));

  // ৩টি স্তম্ভের সব টপিক এক তালিকায় আনা
  const allTopics = [];
  for (const pillar of CORE_PILLARS) {
    for (const t of pillar.topics) {
      allTopics.push({ ...t, pillarId: pillar.id, pillarName: pillar.name });
    }
  }

  // যেটি আগে পাঠানো হয়নি তা অগ্রাধিকার পাবে
  const unseen = allTopics.filter(t => !seenTitles.has(t.title));
  if (unseen.length > 0) {
    return unseen[0];
  }

  // সব দেখা হয়ে গেলে র‍্যান্ডম বা প্রথমটি
  return allTopics[Math.floor(Math.random() * allTopics.length)];
}

/**
 * খাঁটি, ভেরিফায়েড ও ফেসবুক পেজ-রেডি মাস্টারক্লাস পোস্ট তৈরি
 */
export async function getAIResearchDigest() {
  const selected = selectNextTopic();

  const prompt = `তুমি একজন সিনিয়র এআই রিসার্চার ও "Ai Revolution" ফেসবুক পেজের প্রধান কন্টেন্ট স্ট্র্যাটেজিস্ট।
বোরহান ভাইয়ের পেজের জন্য নিচের নির্ধারিত খাঁটি টপিকটি নিয়ে একটি প্রিমিয়াম ফেসবুক পোস্ট ও প্রম্পট রেসিপি তৈরি করো:

[টপিক তথ্য]:
- ক্যাটাগরি: ${selected.pillarName}
- টুল: ${selected.tool} (${selected.freeUrl})
- শিরোনাম: ${selected.title}
- মূল উদ্দেশ্য: ${selected.objective}
- কেন এই প্রম্পটটি সেরা রেজাল্ট দেয়: ${selected.whyBetter}
- মূল রেফারেন্স প্রম্পট: ${selected.samplePrompt}

[কড়া নিয়মাবলী - বাধ্যতামূলক]:
১. কোনো কাল্পনিক টুল বা অসত্য তথ্য (Hallucination) বানাবে না। যা দেওয়া হয়েছে শুধু সেই আসল টুল ও তথ্যের ওপর ভিত্তি করে লিখবে।
২. সাধারণ মানুষ কীভাবে এই টুলটি ফ্রিতে ব্যবহার করবে এবং প্রম্পটটি কপি করে কীভাবে রান করবে তা পরিষ্কার করে দেবে।
৩. লেখাটি এমন প্রাণবন্ত ও আকর্ষণীয় বাংলায় হতে হবে যাতে বোরহান ভাই সরাসরি তার "Ai Revolution" ফেসবুক পেজে কপি করে পোস্ট করতে পারেন।

[ফরম্যাট - হুবহু নিচের টেলিগ্রাম HTML ফরম্যাটে লিখবে (<b>, <i>, <code>)]:

🎯 <b>${selected.pillarName}</b>
━━━━━━━━━━━━━━━━━━━━
🌟 <b>${selected.title}</b>
🛠️ <b>টুল ও ফ্রি লিঙ্ক:</b> <a href="${selected.freeUrl}">${selected.tool}</a> (সম্পূর্ণ ফ্রি ব্যবহারের সুযোগ)

📝 <b>সহজ বাংলা সারসংক্ষেপ (ফেসবুক পোস্ট):</b>
(এখানে ৬-১২ লাইনে একটি শক্তিশালী ভাইরাল হুক, বাস্তব জীবনে সাধারণ মানুষের বা ডেভেলপারের কী উপকার হবে, এবং কীভাবে ঘণ্টার কাজ কয়েক সেকেন্ডে শেষ করবে তা চমৎকার প্যারাগ্রাফ ও পয়েন্ট আকারে লিখবে।)

💡 <b>কেন এই প্রম্পটটি বেটার আউটপুট দেয়?</b>
${selected.whyBetter}

📋 <b>কপি-পেস্ট প্রম্পট রেসিপি:</b>
<code>${selected.samplePrompt}</code>

🚀 <b>কীভাবে ব্যবহার করবেন (ধাপে ধাপে):</b>
১. <a href="${selected.freeUrl}">${selected.tool}</a>-এ যান।
২. উপরের প্রম্পটটি কপি করে আপনার প্রয়োজন অনুযায়ী ব্র্যাকেটের অংশ পরিবর্তন করুন।
৩. রান বাটনে চাপ দিন এবং মাত্র কয়েক সেকেন্ডেই প্রিমিয়াম আউটপুট পেয়ে যাবেন!`;

  for (const model of FALLBACK_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1200
          }
        }),
        signal: AbortSignal.timeout(15000)
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        // হিস্ট্রিতে সেভ করা
        const history = loadAIHistory();
        history.push({ title: selected.title, date: new Date().toISOString(), tool: selected.tool });
        saveAIHistory(history);

        const dateStr = new Date().toLocaleDateString('bn-BD', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const header = `🧠 <b>বক্কর এআই রিসার্চ ও প্রম্পট মাস্টারক্লাস</b>\n📅 <i>${dateStr}</i>\n════════════════════\n\n`;
        const footer = `\n\n════════════════════\n💡 <i>টিপস: এই পোস্টটি হুবহু কপি করে আপনার <b>Ai Revolution</b> পেজে শেয়ার করতে পারেন!</i>`;

        return header + text.trim() + footer;
      }
    } catch (err) {
      console.warn(`[Gemini Model ${model} failed, trying next]:`, err.message);
    }
  }

  // ফলব্যাক যদি কোনো কারণে জেমিনি রেসপন্স না দেয়
  return `🧠 <b>বক্কর এআই রিসার্চ ও প্রম্পট মাস্টারক্লাস</b>\n\n` +
    `🎯 <b>${selected.pillarName}</b>\n` +
    `🌟 <b>${selected.title}</b>\n` +
    `🛠️ <b>টুল:</b> <a href="${selected.freeUrl}">${selected.tool}</a>\n\n` +
    `📋 <b>কপি-পেস্ট প্রম্পট:</b>\n<code>${selected.samplePrompt}</code>\n\n` +
    `💡 <i>বিস্তারিত দেখতে উপরের টুলে ক্লিক করুন!</i>`;
}
