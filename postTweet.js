const { TwitterApi } = require('twitter-api-v2');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateTweet() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Write a short, engaging, and slightly humorous post about AI or SaaS or Automation. It could be questioning as well. Use may/may not use bullet points (depends on you) and use emojis such as ✅ or ✔️ or 🚀 for bullet points. Include 2-3 emojis. Keep it under 230 characters (even blank spaces count). The post should be spacious, less words, should include line breaks. At last add hashtags after 2 line breaks #AI, #SaaSGrowth #WebDev`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    if (!text || text.length < 10 || text.length > 230) {
      console.warn("⚠️ Skipping invalid tweet content. your tweet length might have exceeded.");
      return null;
    }

    return text;
  } catch (error) {
    console.error("❌ Gemini error:", error);
    return null;
  }
}

async function postGeneratedTweet() {
  const tweet = await generateTweet();

  if (!tweet) return;

  try {
    await twitterClient.v2.tweet(tweet);
    console.log("✅ Tweet posted:", tweet);
  } catch (error) {
    console.error("❌ Error posting tweet:", error);
  }
}

module.exports = { postGeneratedTweet };
