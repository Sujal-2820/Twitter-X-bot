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
    const prompt = `
You are a smart content creator on X (Twitter), posting about AI, SaaS, Automation, Software Tools, or Web Development.

Write one short post that:
- is engaging and very slightly humorous
- may be a strong statement or a question
- may use or skip bullet points based on style
- uses 2-3 emojis based on the response style
- has line breaks and spacing to improve readability
- is written in simple, human language (avoid idioms or fancy hooks)
- looks like it was written by a human, not AI
- is under 230 characters (including spaces)
- ends with two line breaks and these hashtags:
#AI #SaaSGrowth #WebDev

You can also write about current trends in AI, SaaS, Automation, or no-code/low-code tools.

NOTE: No need to include **, * or anything of that sort for particular words. Just plain words No need of Bold, italics or any decorative words.

Here are 10 example posts to inspire tone and format (DO NOT copy, just match the feel and style):

---

1.
People are sleeping on this:

1 smart AI agent + automation

you don’t need a team to scale.
You need a system.

#AI #Automation #SaaS #WebDev #SaaSGrowth

---

2.
Every SaaS builder talks about features.
The winners talk about the pain they solve.
That’s what sells.

#AI #SaaS #Automation #WebDev #SaaSGrowth

---

3.
You can launch an MVP today using:

  → Carrd for landing
  → Gumroad for sales
  → ChatGPT for copy

$0 tools, real product.

#AI #SaaSGrowth #Automation #WebDev #SaaS

---

4.
AI is moving too fast.

If you’re still "researching ideas"…
someone already shipped it using wrappers.

#AI #SaaS #Automation #WebDev #SaaSGrowth

---

5.
1 follower on X = 10 on Instagram.
Because here, people read.

🚀 They click.
🚀 They buy.

#AI #SaaS #WebDev #SaaSGrowth #Automation

---

6.
What if you're just one smart automation away
from your first $1,000 online?

#AI #SaaSGrowth #Automation #WebDev #SaaS

---

7.
Grok 4 writes code like a senior dev.

You build. It thinks.

Who still needs a team to launch SaaS?

#AI #SaaS #WebDev #Automation #SaaSGrowth

---

8.
No-code tools aren't a shortcut.

They’re the reason solo founders win.

Still ignoring them?

#AI #Automation #SaaSGrowth #WebDev #SaaS

---

9.
Stop chasing VCs.

Start chasing users.

One working product solves both problems.

#AI #SaaS #WebDev #Automation #SaaSGrowth

---

10.
Why build slow when AI helps you:

  → ideate
  → code
  → sell
  → support

All before lunch.

#AI #SaaS #WebDev #Automation #SaaSGrowth

---

Now, generate one new, fresh tweet in the same style.
`;


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
