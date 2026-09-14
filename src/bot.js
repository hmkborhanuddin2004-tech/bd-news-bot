import 'dotenv/config';
import cron from 'node-cron';
import { getNationalNews, getTrendingNews, getAINews, recordSentNews } from './newsService.js';
import { getAIChatResponse } from './aiChat.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

console.log("=========================================");
console.log("🤖 বক্কর (Bokkor) - স্মার্ট বাংলা AI ও নিউজ বট সক্রিয়");
console.log(`📱 Chat ID: ${CHAT_ID}`);
console.log("=========================================");

/**
 * পুরো বুলেটিন তৈরি ও পাঠানো
 */
export async function sendNewsBulletin() {
  console.log("🔄 ১৫টি বাছাইকৃত খবর ও সারসংক্ষেপ সংগ্রহ করা হচ্ছে...");

  const [national, trending, ai] = await Promise.all([
    getNationalNews(),
    getTrendingNews(),
    getAINews()
  ]);

  const todayStr = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // ক্যাটাগরি ১: বাংলাদেশ ও জাতীয় শীর্ষ সংবাদ
  let cat1 = `<b>🇧🇩 বাংলাদেশ ও জাতীয় শীর্ষ সংবাদ</b>\n`;
  national.forEach((item, i) => {
    cat1 += `\n${i + 1}️⃣ <b>${escapeHtml(item.title)}</b>\n`;
    cat1 += `   📝 <i>${escapeHtml(item.summary)}</i>\n`;
    cat1 += `   🔗 <a href="${item.link}">বিস্তারিত পড়ুন</a>\n`;
  });

  // ক্যাটাগরি ২: ফেসবুক ও সোশ্যাল মিডিয়া ট্রেন্ডিং
  let cat2 = `<b>🔥 ফেসবুক ও সোশ্যাল মিডিয়া ট্রেন্ডিং</b>\n`;
  trending.forEach((item, i) => {
    cat2 += `\n${i + 1}️⃣ <b>${escapeHtml(item.title)}</b>\n`;
    cat2 += `   📝 <i>${escapeHtml(item.summary)}</i>\n`;
    cat2 += `   🔗 <a href="${item.link}">বিস্তারিত পড়ুন</a>\n`;
  });

  // ক্যাটাগরি ৩: কৃত্রিম বুদ্ধিমত্তা (AI) ও প্রযুক্তি আপডেট
  let cat3 = `<b>🤖 কৃত্রিম বুদ্ধিমত্তা (AI) ও প্রযুক্তি আপডেট</b>\n`;
  ai.forEach((item, i) => {
    cat3 += `\n${i + 1}️⃣ <b>${escapeHtml(item.title)}</b>\n`;
    cat3 += `   📝 <i>${escapeHtml(item.summary)}</i>\n`;
    cat3 += `   🔗 <a href="${item.link}">বিস্তারিত পড়ুন</a>\n`;
  });

  const fullBulletin = `<b>📰 দৈনিক বিশেষ বুলেটিন (১৫টি নির্বাচিত খবর)</b>\n📅 <i>${todayStr}</i>\n\n` +
    `════════════════════\n${cat1}\n` +
    `════════════════════\n${cat2}\n` +
    `════════════════════\n${cat3}\n` +
    `════════════════════\n` +
    `✨ <i>ফেসবুকে অপ্রয়োজনীয় স্ক্রলিং না করে এক নজরে আপডেট থাকুন!</i>`;

  // পাঠানো খবরের তালিকা হিস্ট্রিতে সেভ করা (যাতে ভবিষ্যতে ডুপ্লিকেট না হয়)
  recordSentNews([...national, ...trending, ...ai]);

  if (fullBulletin.length < 4000) {
    return await sendTelegramMessage(fullBulletin);
  } else {
    console.log("ℹ️ মেসেজের সাইজ বড় হওয়ায় ৩টি পরিচ্ছন্ন মেসেজে পাঠানো হচ্ছে...");
    await sendTelegramMessage(`<b>📰 দৈনিক বিশেষ বুলেটিন (১৫টি নির্বাচিত খবর)</b>\n📅 <i>${todayStr}</i>\n\n════════════════════\n${cat1}`);
    await sendTelegramMessage(`════════════════════\n${cat2}`);
    return await sendTelegramMessage(`════════════════════\n${cat3}\n════════════════════\n✨ <i>ফেসবুকে অপ্রয়োজনীয় স্ক্রলিং না করে এক নজরে আপডেট থাকুন!</i>`);
  }
}

/**
 * টেলিগ্রাম মেসেজ পাঠানোর হেল্পার
 */
async function sendTelegramMessage(htmlText, targetChatId = CHAT_ID) {
  if (!BOT_TOKEN || !targetChatId) return;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    return await response.json();
  } catch (err) {
    console.error("মেসেজ পাঠাতে এরর:", err.message);
  }
}

/**
 * টাইপিং স্ট্যাটাস দেখানো (Typing...)
 */
async function sendTypingAction(targetChatId) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        action: 'typing'
      })
    });
  } catch (e) {}
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * রিয়েল-টাইম টেলিগ্রাম চ্যাট লিসেনার (Interactive Gemini Chat)
 */
let lastUpdateId = 0;
let isPolling = false;

async function startTelegramPoller() {
  if (isPolling) return;
  isPolling = true;
  console.log("👂 টেলিগ্রাম লাইভ চ্যাট লিসেনার শুরু হয়েছে...");

  while (isPolling) {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=20`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          const msg = update.message;
          if (!msg || !msg.text) continue;

          const senderChatId = msg.chat.id;
          const userText = msg.text.trim();
          console.log(`📩 মেসেজ এসেছে [${senderChatId}]: ${userText}`);

          if (userText === '/start') {
            await sendTelegramMessage(
              `আসসালামু আলাইকুম বোরহান ভাই! 🌸\n\nআমি আপনার ব্যক্তিগত স্মার্ট বাংলা সহকারী <b>বক্কর (Bokkor)</b> 🤖\n\n` +
              `• প্রতিদিন দুপুর ২:০০ ও বিকাল ৫:৪০ এ আমি আপনাকে <b>১৫টি বাছাইকৃত তাজা খবর</b> পাঠাব।\n` +
              `• তাৎক্ষণিক খবর পেতে লিখুন: <code>/news</code>\n` +
              `• এছাড়া বাংলায় যেকোনো বিষয়ে কথা বলুন বা প্রশ্ন করুন, আমি মানুষের মতো উত্তর দেব!`,
              senderChatId
            );
          } else if (userText === '/news' || userText === '/bulletin' || userText === 'খবর' || userText === 'নিউজ') {
            await sendTelegramMessage("🔄 তাজা খবর সংগ্রহ করা হচ্ছে বোরহান ভাই, এক মুহূর্ত অপেক্ষা করুন...", senderChatId);
            await sendNewsBulletin();
          } else {
            // জেমিনি এআই চ্যাট রিপ্লাই
            await sendTypingAction(senderChatId);
            const aiReply = await getAIChatResponse(userText);
            await sendTelegramMessage(aiReply, senderChatId);
          }
        }
      }
    } catch (err) {
      // নেটওয়ার্ক ড্রপ হলে কিছুক্ষণ পর আবার চেষ্টা
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

// ম্যানুয়ালি টেস্ট রান ফ্ল্যাগ
if (process.argv.includes('--test')) {
  console.log("🧪 টেস্ট মোড: ১৫টি খবরের টেস্ট বুলেটিন পাঠানো হচ্ছে...");
  sendNewsBulletin();
} else {
  // ১. প্রতিদিন দুপুর ২:০০ টায় ক্রন শিডিউল
  cron.schedule('0 14 * * *', () => {
    console.log("⏰ দুপুর ২:০০ টায় অটোমেটিক বুলেটিন ট্রিগার...");
    sendNewsBulletin();
  });

  // ২. প্রতিদিন বিকাল ৫:৪০ মিনিটে ক্রন শিডিউল
  cron.schedule('40 17 * * *', () => {
    console.log("⏰ বিকাল ৫:৪০ মিনিটে অটোমেটিক বুলেটিন ট্রিগার...");
    sendNewsBulletin();
  });

  // ৩. লাইভ চ্যাট লিসেনার চালু করা
  startTelegramPoller();

  console.log("⏳ বক্কর সম্পূর্ণরূপে প্রস্তুত! চ্যাট ও অটো-বুলেটিন দুটোই চালু আছে।");
}
