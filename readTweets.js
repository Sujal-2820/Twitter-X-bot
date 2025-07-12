const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
});

const client = twitterClient.readOnly;

async function fetchRelevantTweets(query = 'AI OR SaaS OR Automation OR AI Agent OR AI Wrapper', max = 10) {
  try {
    const rateLimitStatus = await client.v2.rateLimitStatuses();
    const searchLimit = rateLimitStatus?.resources?.search?.['/2/tweets/search/recent'];

    const now = Math.floor(Date.now() / 1000);

    if (searchLimit?.remaining === 0) {
      const waitTime = new Date(searchLimit.reset * 1000).toLocaleTimeString();
      console.warn(`⏳ Twitter search rate limit reached. Try again after ${waitTime}`);
      return [];
    }

    const results = await client.v2.search(query, {
      max_results: max,
      'tweet.fields': ['author_id', 'conversation_id', 'lang']
    });

    const tweets = [];
    for await (const tweet of results) {
      if (!tweet.text.startsWith("RT") && tweet.lang === 'en') {
        tweets.push(tweet);
      }
    }

    return tweets;
  } catch (error) {
    console.error("❌ Error fetching tweets:", error);
    return [];
  }
}

module.exports = { fetchRelevantTweets };
