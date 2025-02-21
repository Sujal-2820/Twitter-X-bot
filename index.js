require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const { fetchTrendingNews } = require('./fetchNews');
const { postTweetWithImage } = require('./tweetHandler');

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

    // Debugging: Check if news is being fetched
    console.log("Fetching trending news...");
    const news = await fetchTrendingNews();
    
    if (news) {
      console.log("News fetched:", news.title);
      await postTweetWithImage(news.title, news.url);
    } else {
      console.log("No news found!");
    }

  } catch (error) {
    console.error("Twitter API Error:", error);
  }
})();
