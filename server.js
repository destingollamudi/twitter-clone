require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const connectDB  = require('./config/dbConn');
const apiRoutes = require("./routes/api")
const PORT = process.env.PORT || 3500;

connectDB();

// middleware
app.use(cors());
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