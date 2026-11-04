# Bangladesh Trending News Telegram Bot

An automated news aggregation and broadcast service that compiles verified news headlines from leading daily portals in Bangladesh and delivers structured digests via the Telegram Bot API.

---

## System Overview

The service operates on a scheduled runner that:
1. Scrapes national, technological, and economic headlines from whitelisted news sources.
2. Formats and validates incoming articles against duplicate records.
3. Broadcasts scheduled morning and evening bulletin digests directly to subscribed Telegram channels or users.

---

## Technical Stack

- **Runtime:** Node.js (ES Modules) / JavaScript
- **API:** Telegram Bot API
- **Scraping & Parsing:** Axios, Cheerio, RSS XML parsers
- **Scheduling:** Node-cron / systemd daemon
- **Persistence:** Local JSON file store for duplicate tracking

---

## Installation & Deployment

### Prerequisites

- Node.js 18.x or later
- Telegram Bot Token (obtained via BotFather)
- Target Telegram Chat ID

### 1. Clone the repository

```bash
git clone https://github.com/hmkborhanuddin2004-tech/bd-news-bot.git
cd bd-news-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
PORT=3000
```

### 4. Run the service

```bash
npm start
```

---

## Directory Structure

```text
bd-news-bot/
├── data/               # Persistent digest archives and state
├── src/                # Core application source
│   ├── config.js       # Environment configuration
│   ├── scraper.js      # News ingestion and parsing logic
│   └── telegram.js     # Telegram Bot API client and dispatcher
├── package.json
└── README.md
```

---

## License

This project is licensed under the MIT License.
