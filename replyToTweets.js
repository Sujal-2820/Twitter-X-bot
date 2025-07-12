const { TwitterApi } = require('twitter-api-v2');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { fetchRelevantTweets } = require('./readTweets');
require('dotenv').config();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateComment(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "models/chat-bison-001" }); // safer, replace with available model
    const prompt = `Reply to this X post in a friendly, human, slightly humorous, professional tone. But keep it practical. Use 1 or 2 keywords from the post. Include an emoji. Keep it simple and short, sounding human.\n\n"${text}"`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    if (!reply || reply.length < 5) return null;
    return reply;
  } catch (error) {
    console.error("❌ Gemini error:", error);
    return null;
  }
}

async function processTweets() {
  // Fetch max 3 tweets to limit API calls and replies
  const tweets = await fetchRelevantTweets("AI OR SaaS OR Automation OR AIAgent OR AIWrapper OR Support Each other", 3);

  if (tweets.length === 0) {
    console.log('⚠️ No tweets fetched. Skipping reply.');
    return;
  }

  // Reply only to max 2 tweets per run to stay within rate limits
  const tweetsToReply = tweets.slice(0, 2);

  for (const tweet of tweetsToReply) {
    try {
      const reply = await generateComment(tweet.text);

      if (!reply) {
        console.warn(`⚠️ Skipped empty or invalid reply for tweet ${tweet.id}`);
        continue;
      }

      await twitterClient.v2.reply(reply, tweet.id);
      console.log(`💬 Replied to tweet: ${tweet.id}`);

      // Delay 2 seconds between replies to reduce chance of rate limit errors
      await new Promise((res) => setTimeout(res, 2000));
    } catch (error) {
      if (error.code === 429) {
        console.warn('⚠️ Twitter API rate limit reached while replying. Stopping replies.');
        break; // stop processing further replies this run
      }
      console.error(`❌ Error posting reply to tweet ${tweet.id}:`, error);
    }
  }
}

module.exports = { processTweets };
