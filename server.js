require('dotenv').config();
const PORT = process.env.PORT || 3500;
const prodUrl = process.env.PROD_URL;
const devUrl = process.env.DEV_URL;
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

app.get("/tweet.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "tweet.html"));
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
