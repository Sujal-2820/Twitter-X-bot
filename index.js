const express = require('express');
require('dotenv').config();

// 👉 Just import this to trigger cron scheduling
require('./postTweet');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🟢 Auto Poster is Running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
