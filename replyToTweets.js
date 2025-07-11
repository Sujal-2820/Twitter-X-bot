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

// Generate a human-like, friendly AI comment
async function generateComment(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Reply to this tweet in a friendly, human, slightly humorous, professional tone. Include an emoji. Keep it under 30 words.\n\n"${text}"`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();
    
    // Basic safety check
    if (!reply || reply.length < 5) return null;

    return reply;
  } catch (error) {
    console.error("❌ Gemini error:", error);
    return null;
  }
}

// Fetch tweets and reply with Gemini-generated responses
async function processTweets() {
  // Limit to 10 due to Twitter API rules
  const tweets = await fetchRelevantTweets("AI OR SaaS OR Automation OR AIAgent OR AIWrapper OR Support Each other", 10);

  for (const tweet of tweets) {
    try {
      const reply = await generateComment(tweet.text);

      if (!reply) {
        console.warn(`⚠️ Skipped empty or invalid reply for tweet ${tweet.id}`);
        continue;
      }

      await twitterClient.v2.reply(reply, tweet.id);
      console.log(`💬 Replied to tweet: ${tweet.id}`);
      
      // Optional: delay between replies (simulate human behavior)
      await new Promise((res) => setTimeout(res, 1500));

    } catch (error) {
      console.error(`❌ Error posting reply to tweet ${tweet.id}:`, error);
    }
  }
}

module.exports = { processTweets };
