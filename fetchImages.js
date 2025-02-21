const axios = require('axios');

async function fetchImage(query) {
  try {
    const response = await axios.get('https://api.unsplash.com/photos/random', {
      params: { query, orientation: 'landscape' },
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` }
    });

    return response.data.urls.regular;
  } catch (error) {
    console.error("Error fetching image:", error);
  }
  return null;
}

module.exports = { fetchImage };
