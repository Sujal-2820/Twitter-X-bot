require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const { fetchTrendingNews } = require('./fetchNews');
const { postTweetWithImage } = require('./tweetHandler');
const cron = require('node-cron');

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
});

// Function to fetch and post news
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

// Schedule tweets at peak engagement times (convert to your timezone)
cron.schedule('0 8 * * *', tweetNews, { timezone: "UTC" });  // 8:00 AM UTC
cron.schedule('30 12 * * *', tweetNews, { timezone: "UTC" }); // 12:30 PM UTC
cron.schedule('0 19 * * *', tweetNews, { timezone: "UTC" });  // 7:00 PM UTC

console.log("Tweet scheduler initialized! Waiting for scheduled times...");
