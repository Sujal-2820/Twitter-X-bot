const { TwitterApi } = require('twitter-api-v2');
const { fetchImage } = require('./fetchImages');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
});

// Function to download images
async function downloadImage(imageUrl) {
  try {
    const response = await axios({ url: imageUrl, responseType: 'arraybuffer' });
    const imagePath = path.join(__dirname, `${uuidv4()}.jpg`);
    fs.writeFileSync(imagePath, response.data);
    return imagePath;
  } catch (error) {
    console.error("Error downloading image:", error);
    return null;
  }
}

// Function to generate varied hashtags dynamically
function generateHashtags() {
  const hashtagSets = [
    "#Tech #AI #Innovation",
    "#AI #Web3 #Blockchain",
    "#Gadgets #FutureTech #Trends",
    "#TechNews #AI #Cybersecurity",
    "#Startup #Tech #Digital"
  ];
  return hashtagSets[Math.floor(Math.random() * hashtagSets.length)]; // Randomly pick a set
}

// Function to randomly select an idiom hook
function getIdiomHook() {
  const idioms = [
    "Here’s how: 👇",
    "Keep reading…",
    "Have a look👇🏻",
    "Let's break it down for you. ⬇️"
  ];
  return idioms[Math.floor(Math.random() * idioms.length)];
}

// Function to generate CTA sentences
function getCTA() {
  const ctas = [
    "💟LIKE this post so that the algorithm understands what you truly need.\n📥COMMENT your opinion on the same.\n\nFollow @GearUp28 for more such awesome content.",
    "🔥If you found this helpful, smash the like button!\n💬 Drop your thoughts below.\n\nFollow @GearUp28 for daily tech insights!", 
    "🚀 Stay ahead in tech! Like this post & let me know what you think.\n👇 Let's discuss in the comments.\n\nFollow @GearUp28 for more updates!"
  ];
  return ctas[Math.floor(Math.random() * ctas.length)];
}

// Function to format the tweet for a single post
function formatSingleTweet(title, description) {
  return `${title}\n\n${description}\n\n${generateHashtags()}`;
}

// Function to post tweet with image
async function postTweetWithImage(title, description) {
  try {
    const imageUrl = await fetchImage('technology');
    let mediaId = null;

    if (imageUrl) {
      const imagePath = await downloadImage(imageUrl);
      if (imagePath) {
        mediaId = await twitterClient.v1.uploadMedia(imagePath);
        fs.unlinkSync(imagePath); // Delete image after upload
      }
    }

    const tweetText = formatSingleTweet(title, description);

    if (tweetText.length <= 280) {
      // Single tweet
      await twitterClient.v2.tweet({ text: tweetText, media: mediaId ? { media_ids: [mediaId] } : undefined });
    } else {
      // Create a thread
      const tweetParts = description.match(/.{1,250}/g) || [];
      let lastTweetId = null;
      
      // First tweet with idiom and image
      const firstTweet = `${title}\n\n${tweetParts[0]}\n\n${getIdiomHook()}`;
      const response = await twitterClient.v2.tweet({ text: firstTweet, media: mediaId ? { media_ids: [mediaId] } : undefined });
      lastTweetId = response.data.id;
      
      // Post remaining tweets
      for (let i = 1; i < tweetParts.length; i++) {
        const part = tweetParts[i];
        const response = await twitterClient.v2.tweet({ 
          text: part, 
          reply: { in_reply_to_tweet_id: lastTweetId } 
        });
        lastTweetId = response.data.id;
      }
      
      // Add CTA as the last tweet
      const ctaTweet = getCTA();
      await twitterClient.v2.tweet({ 
        text: ctaTweet, 
        reply: { in_reply_to_tweet_id: lastTweetId } 
      });
    }

    console.log("Tweet posted successfully!");
  } catch (error) {
    console.error("Error posting tweet:", error);
  }
}

module.exports = { postTweetWithImage };
