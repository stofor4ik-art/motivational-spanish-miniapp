require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const axios = require('axios');

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB подключение
let db;
const MONGO_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/motivational_spanish';

MongoClient.connect(MONGO_URL, { useUnifiedTopology: true })
  .then(client => {
    console.log('✓ Подключено к MongoDB');
    db = client.db('motivational_spanish');
  })
  .catch(err => console.error('✗ Ошибка подключения MongoDB:', err));

// ============ API ENDPOINTS ============

// 1. Получение прогресса пользователя
app.post('/api/user/progress', async (req, res) => {
  try {
    const { initData } = req.body;
    
    if (!initData) {
      return res.status(400).json({ error: 'initData required' });
    }

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    const userId = userData.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found' });
    }

    let userProfile = await db.collection('users').findOne({ userId });

    if (!userProfile) {
      userProfile = {
        userId,
        username: userData.username || 'Unnamed',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        favorites: [],
        currentIndex: 0,
        studiedToday: 0,
        lastStudyDate: new Date().toDateString(),
        totalStudied: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('users').insertOne(userProfile);
    }

    const today = new Date().toDateString();
    if (today !== userProfile.lastStudyDate) {
      userProfile.studiedToday = 0;
      userProfile.lastStudyDate = today;
    }

    res.json({
      success: true,
      data: {
        userId,
        favorites: userProfile.favorites || [],
        currentIndex: userProfile.currentIndex || 0,
        studiedToday: userProfile.studiedToday || 0,
        totalStudied: userProfile.totalStudied || 0,
        username: userProfile.username
      }
    });
  } catch (error) {
    console.error('Ошибка в /api/user/progress:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Синхронизация данных пользователя
app.post('/api/user/sync', async (req, res) => {
  try {
    const { initData, favorites, currentIndex, studiedToday, totalStudied } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'initData required' });
    }

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    const userId = userData.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found' });
    }

    const result = await db.collection('users').updateOne(
      { userId },
      {
        $set: {
          favorites: favorites || [],
          currentIndex: currentIndex ?? 0,
          studiedToday: studiedToday ?? 0,
          totalStudied: totalStudied ?? 0,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Data synced',
      modified: result.modifiedCount,
      upserted: result.upsertedCount
    });
  } catch (error) {
    console.error('Ошибка в /api/user/sync:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Добавление фразы в избранное
app.post('/api/user/favorite/add', async (req, res) => {
  try {
    const { initData, cardData } = req.body;

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    const userId = userData.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found' });
    }

    await db.collection('users').updateOne(
      { userId },
      {
        $addToSet: {
          favorites: cardData
        },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    );

    res.json({ success: true, message: 'Card added to favorites' });
  } catch (error) {
    console.error('Ошибка в /api/user/favorite/add:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Удаление фразы из избранного
app.post('/api/user/favorite/remove', async (req, res) => {
  try {
    const { initData, cardId } = req.body;

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    const userId = userData.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found' });
    }

    await db.collection('users').updateOne(
      { userId },
      {
        $pull: {
          favorites: { id: cardId }
        },
        $set: { updatedAt: new Date() }
      }
    );

    res.json({ success: true, message: 'Card removed from favorites' });
  } catch (error) {
    console.error('Ошибка в /api/user/favorite/remove:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Получение всех фраз
app.get('/api/cards', (req, res) => {
  const cards = [
    { id: 1, es: "Sí se puede", ru: "Да, ты можешь", topic: "мотивация" },
    { id: 2, es: "Cree en ti", ru: "Верь в себя", topic: "мотивация" },
    { id: 3, es: "Eres capaz", ru: "Ты способен(на)", topic: "мотивация" },
    { id: 4, es: "Vales mucho", ru: "Ты многого стоишь", topic: "мотивация" },
    { id: 5, es: "Nunca te rindas", ru: "Никогда не сдавайся", topic: "мотивация" }
  ];
  
  res.json({ success: true, cards });
});

// 6. Статистика
app.post('/api/user/stats', async (req, res) => {
  try {
    const { initData } = req.body;

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    const userId = userData.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found' });
    }

    const userProfile = await db.collection('users').findOne({ userId });

    res.json({
      success: true,
      stats: {
        userId,
        username: userProfile?.username || 'Unnamed',
        totalStudied: userProfile?.totalStudied || 0,
        studiedToday: userProfile?.studiedToday || 0,
        favoritesCount: userProfile?.favorites?.length || 0,
        createdAt: userProfile?.createdAt
      }
    });
  } catch (error) {
    console.error('Ошибка в /api/user/stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


// Serve static files (index.html, styles.css, etc.)
const path = require('path');
app.use(express.static(path.join(__dirname)));

// Serve index.html on root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback to index.html for SPA routing
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// ============ TELEGRAM BOT WEBHOOK ============
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: false });

// POST endpoint for Telegram webhook
app.post('/telegram/webhook', (req, res) => {
  const msg = req.body.message;
  
  if (!msg) {
    return res.json({ ok: true });
  }

  // Handle /start and /spanish commands
  if (msg.text === '/start' || msg.text === '/spanish') {
    bot.sendMessage(msg.chat.id, 
      '🇪🇸 *Мотивационный Испанский*\n\nНажми кнопку ниже, чтобы открыть приложение и начать учить мотивационные фразы на испанском!',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎯 Открыть приложение',
                web_app: {
                  url: 'https://motivational-spanish-miniapp.vercel.app/'
                }
              }
            ]
          ]
        }
      }
    );
  }
  
  res.json({ ok: true });
});

// Set webhook (call this once)
app.get('/set-webhook', async (req, res) => {
  try {
    await bot.setWebHook(`https://${process.env.VERCEL_URL}/telegram/webhook`);
    res.json({ ok: true, message: 'Webhook set successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.json({ ok: false, error: error.message });
  }
});


// Запуск сервера
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Motivational Spanish Mini App Server  ║
║  Server running on port ${PORT}         ║
║  Environment: ${process.env.NODE_ENV || 'development'}         ║
║  API: http://localhost:${PORT}          ║
╚════════════════════════════════════════╝
  `);

  // Auto-setup webhook on server start
(async () => {
  if (process.env.VERCEL_URL && process.env.BOT_TOKEN) {
    try {
      const webhookUrl = `https://${process.env.VERCEL_URL}/telegram/webhook`;
      await bot.setWebHook(webhookUrl);
      console.log(`✓ Webhook установлен: ${webhookUrl}`);
    } catch (error) {
      console.error('✗ Ошибка установки webhook:', error.message);
    }
  }
})();
});
