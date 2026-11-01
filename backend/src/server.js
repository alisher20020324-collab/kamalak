import 'dotenv/config';
import { createApp } from './app.js';
import { createBot } from './bot.js';
import { connect, close } from './db.js';

const PORT = Number(process.env.PORT) || 7000;
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;

try {
  await connect();
  console.log('🍃 MongoDB ga ulandi');
} catch (e) {
  console.error('❌ MongoDB ga ulanib bo\'lmadi:', e.message, '\n   backend/.env dagi MONGODB_URI ni tekshiring yoki MongoDB xizmatini yoqing.');
  process.exit(1);
}

const app = createApp();
const server = app.listen(PORT, () => console.log(`🌈 Kamalak server: ${SITE_URL}`));

let bot = null;
if (process.env.BOT_TOKEN) {
  bot = createBot(process.env.BOT_TOKEN, { siteUrl: SITE_URL });
  bot.telegram
    .setMyCommands([
      { command: 'start', description: 'Boshlash / kirish' },
      { command: 'menu', description: 'Menyu' },
      { command: 'logout', description: 'Akkauntdan chiqish' },
    ])
    .catch(() => {});
  bot
    .launch({ dropPendingUpdates: true }, () => console.log(`🤖 Telegram bot ishga tushdi: @${bot.botInfo?.username}`))
    .catch((e) => console.error('🤖 Botni ishga tushirib bo\'lmadi:', e.message));
} else {
  console.log('🤖 BOT_TOKEN berilmagan — bot o\'chirilgan (backend/.env faylini to\'ldiring)');
}

function shutdown() {
  bot?.stop();
  server.close(() => close().finally(() => process.exit(0)));
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
