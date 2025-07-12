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
    // Twitter API requires max_results between 10 and 100 for search
    const apiMax = Math.min(Math.max(max, 10), 100);

    const results = await client.v2.search(query, {
      max_results: apiMax,
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
    if (error.code === 429) {
      console.warn('⚠️ Twitter API rate limit reached during search. Skipping fetch.');
    } else {
      console.error("❌ Error fetching tweets:", error);
    }
    return [];
  }
}

module.exports = { fetchRelevantTweets };
