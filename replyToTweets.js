const { TwitterApi } = require('twitter-api-v2');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { fetchRelevantTweets } = require('./readTweets');
require('dotenv').config();

// Initialize Twitter client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
});

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate a human-like, friendly AI comment
async function generateComment(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-pro" }); // ✅ corrected path
    const prompt = `Reply to this X post in a friendly, human, slightly humorous, professional tone. But remember to keep it practical. Do not use the exact wordings as in the post, although you may use 1 or 2 keywords from the post you feel like including. Include an emoji. Keep it simple, less words, sounding like written by a Human and not by AI.\n\n"${text}"`;

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
