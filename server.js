require('dotenv').config();
const PORT = process.env.PORT || 3500;
const prodUrl = process.env.PROD_URL || "https://twitter-clone-cxze.onrender.com";
const devUrl = process.env.DEV_URL || "http://localhost:3500";
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const connectDB  = require('./config/dbConn');
const apiRoutes = require("./routes/api")


connectDB();

app.get('/config', (req, res) => {
  res.json({
    apiUrl: prodUrl,
  });
});


const allowedOrigins = [
  devUrl,  // Allow your dev environment (localhost)
  prodUrl, // Allow the production server
];

// Enable CORS with specific allowed origins
app.use(cors({
  origin: function(origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true); // Allow requests from the allowed origins
    } else {
      callback(new Error('Not allowed by CORS'), false); // Block other origins
    }
  }
}));

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api", apiRoutes);

// serve static files
app.use(express.static(path.join(__dirname, "public")));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "public", "landing.html"));
});

//routes 

app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'public', 'landing.html'));
})

// Your API base URL
const API_URL = process.env.API_URL || "https://twitter-clone-cxze.onrender.com";

// Serve static files (CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Route to serve tweet.html with **Server-Side Rendered** meta tags
app.get("/tweet.html", async (req, res) => {
  const tweetId = req.query.id;

  if (!tweetId) {
    return res.sendFile(path.join(__dirname, "public", "tweet.html")); // Serve a generic tweet page if no ID
  }

  try {
    // Fetch the tweet data from the API
    const response = await fetch(`${API_URL}/api/posts/${tweetId}`);
    if (!response.ok) throw new Error("Tweet not found");
    const tweet = await response.json();

    // Ensure the tweet content is properly formatted
    const tweetText = tweet.text ? tweet.text.replace(/"/g, "&quot;") : "No content available.";
    const tweetAuthor = tweet.author || "Unknown Author";
    const tweetImage = tweet.image ? tweet.image.replace("http://", "https://") : ""; // Force HTTPS for images
    const tweetURL = `https://twitter-clone-cxze.onrender.com/tweet.html?id=${tweetId}`;

    // Generate the full HTML with meta tags
    const tweetPage = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${tweetAuthor} on TwitClone</title>

        <!-- Open Graph Meta Tags -->
        <meta property="og:title" content="${tweetAuthor} on TwitClone">
        <meta property="og:description" content="${tweetText}">
        <meta property="og:image" content="${tweetImage}">
        <meta property="og:url" content="${tweetURL}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${tweetAuthor} on TwitClone">
        <meta name="twitter:description" content="${tweetText}">
        <meta name="twitter:image" content="${tweetImage}">
        
        <link rel="stylesheet" href="/styles/tweet.css">
      </head>
      <body>
        <div class="main-container">
          <button onclick="goToLanding()" class="back-button">Go Back</button>
          <section id="tweet-container">
            <h2>${tweetAuthor}</h2>
            <p>${tweetText}</p>
            ${tweetImage ? `<img src="${tweetImage}" alt="Tweet Image" style="max-width: 100%;">` : ""}
          </section>
        </div>
        <script>
          function goToLanding() {
            window.location.href = "landing.html";
          }
        </script>
      </body>
      </html>
    `;

    // Send the fully-rendered page
    res.send(tweetPage);

  } catch (error) {
    console.error("Error fetching tweet:", error);
    res.status(404).send(`
      <h1>Tweet Not Found</h1>
      <p>The tweet you are looking for does not exist.</p>
    `);
  }
});

app.get('*', (req, res) => {
  res.status(404);
  res.type('txt').send("404 Not Found");
})

mongoose.connection.once('open', () => {
  console.log('connected to mongodb');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
})
