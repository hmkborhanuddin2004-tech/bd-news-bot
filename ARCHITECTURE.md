# 🏗️ System Architecture & Workflow (সিস্টেম ডিজাইন)

এই ফাইলে পুরো অটোমেশন কীভাবে কাজ করে তার কারিগরি কাঠামো ব্যাখ্যা করা হয়েছে।

---

## 📊 ডাটা ফ্লো ডায়াগ্রাম

```mermaid
flowchart TD
    subgraph Scheduler [সময় নিয়ন্ত্রণ]
        Cron[Cron Job: যেমন প্রতি ১ ঘণ্টা পর পর]
    end

    subgraph NewsCollector [সংবাদ সংগ্রহকারী]
        RSS[Google News BD / RSS Feed]
        Parser[XML/RSS Parser]
        Dedup[ডুপ্লিকেট নিউজ ফিল্টার]
    end

    subgraph Formatter [মেসেজ ফরম্যাটার]
        Title[খবরের শিরোনাম]
        Summary[সংক্ষিপ্ত বিবরণ / সারসংক্ষেপ]
        Link[মূল খবরের লিংক]
        Time[প্রকাশের সময়]
    end

    subgraph TelegramService [টেলিগ্রাম সার্ভিস]
        BotAPI[Telegram Bot API]
        UserChat[ইউজারের টেলিগ্রাম চ্যাট]
    end

    Cron -->|ট্রিগার করে| RSS
    RSS --> Parser
    Parser --> Dedup
    Dedup -->|নতুন খবর আসলে| Title
    Dedup --> Summary
    Dedup --> Link
    Dedup --> Time
    Title --> BotAPI
    Summary --> BotAPI
    Link --> BotAPI
    Time --> BotAPI
    BotAPI -->|মেসেজ পাঠায়| UserChat
```

---

## 🧩 মূল কম্পোনেন্টসমূহ
1. **Collector Module (`src/news.js`):**
   - বিভিন্ন সোর্স থেকে তাজা খবর ফেচ করে আনে।
   - ইতিমধ্যে পাঠানো খবর মনে রাখে যাতে একই খবর বারবার না পাঠায়।
2. **Bot Dispatcher (`src/bot.js`):**
   - টেলিগ্রামের অফিসিয়াল API ব্যবহার করে ইউজারকে সুন্দর মার্কডাউন বা HTML ফরম্যাটে নিউজ পাঠায়।
3. **Scheduler Module:**
   - ব্যাকগ্রাউন্ডে নিয়মিত বিরতিতে স্বয়ংক্রিয়ভাবে এক্সিকিউট করে।
