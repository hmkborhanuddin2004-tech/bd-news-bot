import 'dotenv/config';
import cron from 'node-cron';
import { getNationalNews, getTrendingNews, getAINews } from './newsService.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

console.log("=========================================");
console.log("🤖 BD News Telegram Bot (15 Items Bulletin)");
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

  // যদি টেলিগ্রামের ৪০৯৬ অক্ষরের চেয়ে ছোট হয়, তবে একটি মেসেজে পাঠাবে
  if (fullBulletin.length < 4000) {
    return await sendTelegramMessage(fullBulletin);
  } else {
    // অন্যথায় ক্যাটাগরি অনুযায়ী সুন্দর ৩টি মেসেজে পাঠাবে
    console.log("ℹ️ মেসেজের সাইজ বড় হওয়ায় ৩টি পরিচ্ছন্ন মেসেজে পাঠানো হচ্ছে...");
    await sendTelegramMessage(`<b>📰 দৈনিক বিশেষ বুলেটিন (১৫টি নির্বাচিত খবর)</b>\n📅 <i>${todayStr}</i>\n\n════════════════════\n${cat1}`);
    await sendTelegramMessage(`════════════════════\n${cat2}`);
    return await sendTelegramMessage(`════════════════════\n${cat3}\n════════════════════\n✨ <i>ফেসবুকে অপ্রয়োজনীয় স্ক্রলিং না করে এক নজরে আপডেট থাকুন!</i>`);
  }
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
    console.log("✅ সফলতা! মেসেজ পাঠানো হয়েছে। Message ID:", resData.result.message_id);
  }
  return resData;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ম্যানুয়ালি টেস্ট রান
if (process.argv.includes('--test')) {
  console.log("🧪 ১৫টি খবরের নতুন টেস্ট বুলেটিন পাঠানো হচ্ছে...");
  sendNewsBulletin();
} else {
  // প্রতিদিন দুপুর ২:০০ টায়
  cron.schedule('0 14 * * *', () => {
    console.log("⏰ দুপুর ২:০০ টায় অটোমেটিক বুলেটিন ট্রিগার...");
    sendNewsBulletin();
  });

  // প্রতিদিন বিকাল ৫:৪০ মিনিটে
  cron.schedule('40 17 * * *', () => {
    console.log("⏰ বিকাল ৫:৪০ মিনিটে অটোমেটিক বুলেটিন ট্রিগার...");
    sendNewsBulletin();
  });

  console.log("⏳ শিডিউলার চালু আছে: প্রতিদিন দুপুর ২:০০ ও বিকাল ৫:৪০ এ বুলেটিন পাঠানো হবে।");
}
