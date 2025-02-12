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

// Dynamically Serve `tweet.html` with Meta Tags
app.get("/tweet.html", async (req, res) => {
  const tweetId = req.query.id;

  if (!tweetId) {
    return res.sendFile(path.join(__dirname, "public", "tweet.html"));
  }

  try {
    const response = await fetch(`${API_URL}/api/posts/${tweetId}`);
    const tweet = await response.json();

    const metaTags = `
      <meta property="og:title" content="${tweet.author} on TwitClone">
      <meta property="og:description" content="${tweet.text}">
      <meta property="og:image" content="${tweet.image ? tweet.image.replace("http://", "https://") : ""}">
      <meta property="og:url" content="https://twitter-clone-cxze.onrender.com/tweet.html?id=${tweetId}">
      <meta name="twitter:card" content="summary_large_image">
    `;

    // Inject meta tags into `tweet.html`
    const tweetPage = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${tweet.author} on TwitClone</title>
        ${metaTags}
        <link rel="stylesheet" href="./styles/tweet.css">
      </head>
      <body>
        <div class="main-container">
          <button onclick="goToLanding()" class="back-button">Go Back</button>
          <section id="tweet-container">
            <h2>${tweet.author}</h2>
            <p>${tweet.text}</p>
            ${tweet.image ? `<img src="${tweet.image.replace("http://", "https://")}" alt="Tweet Image" style="max-width: 100%;">` : ""}
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

    res.send(tweetPage);
  } catch (error) {
    console.error("Error fetching tweet:", error);
    res.sendFile(path.join(__dirname, "public", "tweet.html"));
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
