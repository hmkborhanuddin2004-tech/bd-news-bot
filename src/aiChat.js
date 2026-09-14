import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_INSTRUCTION = `
তোমার নাম বক্কর (Bokkor)। তুমি বোরহান উদ্দিন (HMk Borhan Uddin)-এর ব্যক্তিগত অত্যন্ত বিনম্র, বন্ধুভাবাপন্ন এবং অত্যন্ত বুদ্ধিমান বাংলা এআই সহকারী।
নিয়মাবলি:
১. সবসময় সম্পূর্ণ খাঁটি, স্পষ্ট, মিষ্টি এবং স্বাভাবিক বাংলায় উত্তর দেবে।
২. কখনো কোনো অপ্রাসঙ্গিক বিদেশি ভাষা (যেমন ফরাসি, কোরিয়ান, রাশিয়ান, পাঞ্জাবি) মেশাবে না।
৩. বোরহান ভাইকে 'বোরহান ভাই' বলে সম্বোধন করতে পারো।
৪. উত্তর সবসময় তথ্যবহুল, সংক্ষিপ্ত ও পড়তে সুবিধাজনক বুলেট পয়েন্ট বা সুন্দর প্যারাগ্রাফে দেবে।
৫. বোরহান ভাই কোনো খবর চাইলে বা /news কমান্ড দিলে তাকে বলবে যে আপনি তাকে সর্বশেষ তাজা খবর এনে দিচ্ছেন।
`.trim();

/**
 * গুগল জেমিনি এআই দিয়ে চ্যাট রিপ্লাই তৈরি করার ফাংশন
 */
export async function getAIChatResponse(userMessage, chatHistory = []) {
  if (!GEMINI_API_KEY) {
    return "দুঃখিত বোরহান ভাই, Gemini API Key পাওয়া যায়নি। অনুগ্রহ করে .env ফাইল চেক করুন।";
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;

    const contents = [];

    // হিস্ট্রি যদি থাকে
    for (const msg of chatHistory.slice(-6)) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    }

    // বর্তমান মেসেজ
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      console.error("Gemini Response Error:", data);
      return "আমি আপনার মেসেজটি বুঝতে পেরেছি, কিন্তু উত্তর তৈরি করতে সামান্য সমস্যা হচ্ছে। আবার একটু বলবেন কি?";
    }
  } catch (error) {
    console.error("Gemini Fetch Error:", error);
    return "দুঃখিত বোরহান ভাই, ইন্টারনেট সংযোগে সমস্যা হচ্ছে। একটু পর আবার চেষ্টা করুন।";
  }
}
