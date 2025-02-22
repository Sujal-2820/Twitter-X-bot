require('dotenv').config();
const express = require('express'); // ✅ Import Express
const { TwitterApi } = require('twitter-api-v2');
const { fetchTrendingNews } = require('./fetchNews');
const { postTweetWithImage } = require('./tweetHandler');
const cron = require('node-cron');

const app = express(); // ✅ Initialize Express app
const PORT = process.env.PORT || 3000; // ✅ Required for Render to keep the service alive

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
});

(async () => {
  try {
    const me = await twitterClient.v2.me();
    console.log(`Bot is running as @${me.data.username}`);
  } catch (error) {
    console.error("Twitter API Error:", error);
  }
})();

// ✅ Function to fetch and tweet news
async function tweetNews() {
  try {
    console.log("Fetching trending news...");
    const news = await fetchTrendingNews();
    
    if (news) {
      console.log("News fetched:", news.title);
      await postTweetWithImage(news.title, news.url);
    } else {
      console.log("No news found!");
    }
  } catch (error) {
    console.error("Error posting tweet:", error);
  }
}

// ✅ Schedule tweets at peak engagement times (24-hour UTC format)
cron.schedule('0 8 * * *', tweetNews, { timezone: "IST" }); // 8:00 AM IST
cron.schedule('30 12 * * *', tweetNews, { timezone: "IST" }); // 12:30 PM IST
cron.schedule('0 19 * * *', tweetNews, { timezone: "IST" }); // 7:00 PM IST

console.log("✅ Tweet scheduler initialized! Waiting for scheduled times...");

// ✅ Dummy Express route to prevent Render shutdown
app.get('/', (req, res) => {
  res.send("🟢 Twitter bot is running...");
});

// ✅ Start the dummy Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
