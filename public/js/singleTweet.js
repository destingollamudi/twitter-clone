const API_URL = "http://localhost:5500"; // Update this with your API URL

// Function to get query parameters from URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Function to fetch a single tweet
async function fetchSingleTweet() {
  const tweetId = getQueryParam("id");
  if (!tweetId) {
    console.error("No tweet ID found in URL");
    document.getElementById("tweet-container").innerHTML = "<p>Tweet not found.</p>";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/posts/${tweetId}`);
    if (!response.ok) throw new Error("Tweet not found");

    const tweet = await response.json();

    // Display tweet
    displaySingleTweet(tweet);

    // Dynamically update Open Graph & Twitter Card meta tags
    updateMetaTags(tweet);
  } catch (error) {
    console.error("Error fetching tweet:", error);
    document.getElementById("tweet-container").innerHTML = "<p>Error loading tweet.</p>";
  }
}

// Function to update Open Graph & Twitter Card meta tags
function updateMetaTags(tweet) {
  document.querySelector("meta[property='og:title']").setAttribute("content", `@${tweet.username}'s Tweet`);
  document.querySelector("meta[property='og:description']").setAttribute("content", tweet.content);
  document.querySelector("meta[property='og:image']").setAttribute("content", tweet.media || "default-thumbnail.png");
  document.querySelector("meta[property='og:url']").setAttribute("content", `${window.location.origin}/tweet.html?id=${tweet._id}`);

  document.querySelector("meta[name='twitter:title']").setAttribute("content", `@${tweet.username}'s Tweet`);
  document.querySelector("meta[name='twitter:description']").setAttribute("content", tweet.content);
  document.querySelector("meta[name='twitter:image']").setAttribute("content", tweet.media || "default-thumbnail.png");
  document.querySelector("meta[name='twitter:url']").setAttribute("content", `${window.location.origin}/tweet.html?id=${tweet._id}`);
}

// Function to display the tweet on the page
function displaySingleTweet({ _id, username, content, media, createdAt, likes = 0 }) {
  const tweetContainer = document.getElementById("tweet-container");
  if (!tweetContainer) return;

  const formattedTime = new Date(createdAt).toLocaleString();

  let mediaElement = "";
  if (media) {
    mediaElement = media.endsWith(".mp4") ? 
      `<video src="${media}" class="tweet-media" controls></video>` : 
      `<img src="${media}" class="tweet-media">`;
  }

  tweetContainer.innerHTML = `
    <article class="tweet">
      <div class="tweet-header">
        <h2 class="tweet-username">@${username}</h2>
        <time class="tweet-time">${formattedTime}</time>
      </div>
      <p class="tweet-content">${content}</p>
      ${mediaElement}
      <div class="tweet-actions">
        <button class="like-btn" data-id="${_id}">❤️ <span class="like-count">${likes}</span></button>
      </div>
    </article>
  `;
}

// Load tweet when the page loads
document.addEventListener("DOMContentLoaded", fetchSingleTweet);


// Function to display the tweet in `tweet.html`
function displaySingleTweet({ _id, username, content, image, createdAt, likes = 0 }) {
  const tweetContainer = document.getElementById("tweet-container");
  if (!tweetContainer) {
    console.error("❌ Tweet container not found in HTML");
    return;
  }

  const formattedTime = new Date(createdAt).toLocaleString();

  tweetContainer.innerHTML = `
    <article class="tweet">
      <div class="tweet-header">
        <h2 class="tweet-username">${username}</h2>
        <time class="tweet-time">${formattedTime}</time>
      </div>
      <p class="tweet-content">${content}</p>
      ${image ? `<img src="${image}" class="tweet-image">` : ""}
      <div class="tweet-actions">
        <button class="action-btn like-btn" data-id="${_id}" data-liked="false">
          ❤️ <span class="like-count">${likes}</span>
        </button>
        <button class="action-btn delete-tweet-btn" data-id="${_id}">🗑️ Delete</button>
      </div>
    </article>
  `;

  // Add event listener for liking the tweet
  document.querySelector(".like-btn").addEventListener("click", async (event) => {
    await likeTweet(_id);
  });

  // Add event listener for deleting the tweet
  document.querySelector(".delete-tweet-btn").addEventListener("click", async (event) => {
    await deleteTweet(_id);
  });
}

// Function to like a tweet
async function likeTweet(tweetId) {
  try {
    const response = await fetch(`${API_URL}/api/posts/${tweetId}/like`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liked: true }),
    });

    if (!response.ok) throw new Error("Failed to like tweet.");
    const result = await response.json();

    // Update like count
    const likeCountSpan = document.querySelector(".like-count");
    likeCountSpan.textContent = result.likes;
  } catch (error) {
    console.error("Error liking tweet:", error);
  }
}

// Function to delete a tweet
async function deleteTweet(tweetId) {
  if (!confirm("Are you sure you want to delete this tweet?")) return;

  try {
    const response = await fetch(`${API_URL}/api/posts/${tweetId}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete tweet.");

    // Redirect back to main page after deleting
    window.location.href = "/";
  } catch (error) {
    console.error("Error deleting tweet:", error);
  }
}

// Load tweet when the page loads
document.addEventListener("DOMContentLoaded", fetchSingleTweet);
