const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const NEWS_API_KEY = process.env.NEWS_API_KEY; 
const NEWS_API_URL = "https://newsapi.org/v2/everything";

app.get("/api/news", async (req, res) => {
  try {
    const query = "health fitness diet"; 
    const response = await axios.get(NEWS_API_URL, {
      params: {
        q: query,
        sortBy: "publishedAt",
        pageSize: 10, 
        apiKey: NEWS_API_KEY,
      },
    });

    res.json(response.data.articles);
  } catch (error) {
    console.error("Error fetching news:", error.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});