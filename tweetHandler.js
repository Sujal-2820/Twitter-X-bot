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

// Function to format the tweet
function formatTweet(title, description) {
  return `${title}\n\n${description}\n\n${getIdiomHook()}`;
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

    const tweetText = formatTweet(title, description);

    if (tweetText.length <= 280) {
      // Single tweet
      await twitterClient.v2.tweet({ text: tweetText, media: mediaId ? { media_ids: [mediaId] } : undefined });
    } else {
      // Create a thread if text is too long
      const tweetParts = tweetText.match(/.{1,270}/g);
      let lastTweetId = null;
      for (const part of tweetParts) {
        const response = await twitterClient.v2.tweet({ 
          text: part, 
          media: lastTweetId ? undefined : (mediaId ? { media_ids: [mediaId] } : undefined), 
          reply: lastTweetId ? { in_reply_to_tweet_id: lastTweetId } : undefined 
        });
        lastTweetId = response.data.id;
      }
    }

    console.log("Tweet posted successfully!");
  } catch (error) {
    console.error("Error posting tweet:", error);
  }
}

module.exports = { postTweetWithImage };
