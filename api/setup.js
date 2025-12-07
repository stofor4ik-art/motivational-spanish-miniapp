const axios = require('axios');

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = 'https://motivational-spanish-miniapp.vercel.app/api/telegram';

module.exports = async (req, res) => {
  try {
    const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;
    
    const response = await axios.post(telegramApiUrl, {
      url: WEBHOOK_URL,
      allowed_updates: ['message']
    });

    console.log('Webhook setup response:', response.data);
    
    res.status(200).json({
      ok: true,
      message: 'Webhook set successfully',
      data: response.data
    });
  } catch (error) {
    console.error('Error setting webhook:', error.message);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
};
