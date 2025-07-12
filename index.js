require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { processTweets } = require('./replyToTweets');

const app = express();
const PORT = process.env.PORT || 3000;

// Run every 15 minutes (00, 15, 30, 45)
cron.schedule('*/15 * * * *', async () => {
  try {
    console.log("⏳ Running scheduled tweet processing...");
    await processTweets();
  } catch (err) {
    console.error("❌ Scheduled task failed:", err);
  }
}, { timezone: 'Asia/Kolkata' });

// Health check route
app.get('/', (req, res) => {
  res.send("🟢 Twitter Gemini Bot is running 24/7.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
