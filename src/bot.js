import 'dotenv/config';
import cron from 'node-cron';
import { getTopBDNews, getAINews } from './newsService.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

console.log("=========================================");
console.log("🤖 BD News Telegram Bot সার্ভিস প্রস্তুত...");
console.log(`📱 Chat ID: ${CHAT_ID}`);
console.log("=========================================");

/**
 * টেলিগ্রামে বুলেটিন মেসেজ পাঠানোর মূল ফাংশন
 */
export async function sendNewsBulletin() {
  console.log("🔄 তাজা খবর সংগ্রহ করা হচ্ছে...");
  
  const bdNews = await getTopBDNews();
  const aiNews = await getAINews();

  const todayStr = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let message = `<b>🇧🇩 দৈনিক সংবাদ ও এআই বুলেটিন 📰</b>\n`;
  message += `📅 <i>${todayStr}</i>\n\n`;

  message += `<b>📌 বাংলাদেশের শীর্ষ সংবাদ ও সোশ্যাল ট্রেন্ডিং:</b>\n`;
  if (bdNews.length === 0) {
    message += `- কোনো নতুন খবর পাওয়া যায়নি।\n`;
  } else {
    bdNews.forEach((news, idx) => {
      message += `\n${idx + 1}️⃣ <b>${escapeHtml(news.title)}</b>\n🔗 <a href="${news.link}">বিস্তারিত পড়ুন</a>\n`;
    });
  }

  message += `\n<b>🤖 কৃত্রিম বুদ্ধিমত্তা (AI) লেটেস্ট আপডেট:</b>\n`;
  if (aiNews.length === 0) {
    message += `- কোনো নতুন AI আপডেট পাওয়া যায়নি।\n`;
  } else {
    aiNews.forEach((news, idx) => {
      message += `\n${idx + 1}️⃣ <b>${escapeHtml(news.title)}</b>\n🔗 <a href="${news.link}">বিস্তারিত পড়ুন</a>\n`;
    });
  }

  message += `\n➖➖➖➖➖➖➖➖➖➖\n`;
  message += `✨ <i>ফেসবুকে সময় নষ্ট না করে আপডেট থাকুন!</i>`;

  return await sendTelegramMessage(message);
}

/**
 * টেলিগ্রাম API কল
 */
async function sendTelegramMessage(htmlText) {
  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error("টেলিগ্রাম টোকেন বা চ্যাট আইডি কনফিগার করা নেই!");
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: htmlText,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  });

  const resData = await response.json();
  if (!resData.ok) {
    console.error("❌ টেলিগ্রাম মেসেজ পাঠাতে ব্যর্থ:", resData);
  } else {
    console.log("✅ সফলতা! টেলিগ্রামে মেসেজ পাঠানো হয়েছে। Message ID:", resData.result.message_id);
  }
  return resData;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// কমান্ড লাইন থেকে রান করলে সরাসরি একটি টেস্ট বুলেটিন পাঠাবে
if (process.argv.includes('--test')) {
  console.log("🧪 টেস্ট বুলেটিন পাঠানো হচ্ছে...");
  sendNewsBulletin();
} else {
  // ১. প্রতিদিন দুপুর ২:০০ টায় (14:00)
  cron.schedule('0 14 * * *', () => {
    console.log("⏰ দুপুর ২:০০ টায় অটোমেটিক বুলেটিন ট্রিগার হলো...");
    sendNewsBulletin();
  });

  // ২. প্রতিদিন বিকাল ৫:৪০ টায় (17:40)
  cron.schedule('40 17 * * *', () => {
    console.log("⏰ বিকাল ৫:৪০ টায় অটোমেটিক বুলেটিন ট্রিগার হলো...");
    sendNewsBulletin();
  });

  console.log("⏳ অটো-শিডিউলার সক্রিয় হয়েছে! প্রতিদিন দুপুর ২:০০ এবং বিকাল ৫:৪০ মিনিটে স্বয়ংক্রিয়ভাবে খবর পাঠানো হবে।");
  console.log("💡 টেস্ট করতে রান করুন: npm start -- --test");
}
