
// fetchNews.js
const axios = require('axios');

async function fetchTrendingNews() {
  try {
    const response = await axios.get(`https://newsapi.org/v2/everything`, {
      params: {
        q: 'technology AI Web3',
        language: 'en',
        sortBy: 'publishedAt',
        apiKey: process.env.GOOGLE_NEWS_API_KEY
      }
    });

    console.log("Google News API response:", response.data);

    const articles = response.data.articles;
    if (articles.length > 0) {
      return {
        title: articles[0].title,
        url: articles[0].url,
        imageUrl: articles[0].urlToImage
      };
    }
  } catch (error) {
    console.error("Error fetching news:", error);
  }
  return null;
}

module.exports = { fetchTrendingNews };
