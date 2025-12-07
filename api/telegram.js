const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: false });

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    const msg = update.message;

    if (!msg) {
      return res.json({ ok: true });
    }

    // Handle /start and /spanish commands
    if (msg.text === '/start' || msg.text === '/spanish') {
      await bot.sendMessage(msg.chat.id, 
        '🇪🇸 *Мотивационный Испанский*\n\nНажми кнопку ниже, чтобы открыть приложение и начать учить мотивационные фразы на испанском!',
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🎯 Открыть приложение',
                  web_app: {
                    url: 'https://motivational-spanish-miniapp.vercel.app'
                  }
                }
              ]
            ]
          }
        }
      );
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};
