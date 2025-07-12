const express = require('express');
const cron = require('node-cron');
const { postGeneratedTweet } = require('./postTweet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

cron.schedule('*/5 * * * *', async () => {
  console.log("⏳ Generating and posting new tweet...");
  await postGeneratedTweet();
}, { timezone: 'Asia/Kolkata' });

app.get('/', (req, res) => {
  res.send('🟢 Auto Poster is Running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
