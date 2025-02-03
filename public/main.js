const API_URL = "https://twitter-clone-a1wa.onrender.com";  // Access the global variable for API_URL
const tweetForm = document.getElementById('tweetForm');
const feed = document.getElementById('feed');
const tweetBox = document.getElementById('tweet-box');
const counterProgress = document.getElementById('counter-progress');
const charCounter = document.getElementById('char-counter');
const maxLength = 280;
const radius = 20; 
const circumference = 2 * Math.PI * radius;

const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const removeImageButton = document.getElementById("removeImageButton");
const uploadLabel = document.getElementById("uploadLabel");

// Assign PFP element
const postFormPfp = document.getElementById("postFormPfp");

counterProgress.style.strokeDasharray = circumference;
counterProgress.style.strokeDashoffset = circumference;

tweetBox.addEventListener('input', () => {
  const currentLength = tweetBox.value.length;
  const progress = currentLength / maxLength;
  const offset = circumference * (1 - progress);
  counterProgress.style.strokeDashoffset = offset;
});

tweetBox.addEventListener('focus', () => {
  charCounter.style.opacity = '1';
});

tweetBox.addEventListener('blur', () => {
  charCounter.style.opacity = '0';
});

const pfpArray = [
  '/img/pfp1.svg',
  '/img/pfp2.svg',
  '/img/pfp3.svg',
  '/img/pfp4.svg',
  '/img/pfp5.svg'
];

// Function to get a random PFP
function getRandomPfp() {
  const randomIndex = Math.floor(Math.random() * pfpArray.length);
  return pfpArray[randomIndex];
}

document.addEventListener("DOMContentLoaded", () => {
  const storedPfp = localStorage.getItem("userPfp");

  if (storedPfp) {
    postFormPfp.src = storedPfp;
  } else {
    const assignedPfp = getRandomPfp();
    postFormPfp.src = assignedPfp;
    localStorage.setItem("userPfp", assignedPfp);
  }

  fetchAndDisplayPosts(); // Fetch and load existing tweets
});


// Store PFPs for each tweet
const storedPfps = JSON.parse(localStorage.getItem("tweetPfps")) || {};

function createTweetElement({ _id, username, content, imageUrl, createdAt, likes = 0 }) {
  if (!_id) {
    console.error("❌ Error: Tweet ID is missing!");
    return;
  }

  const tweetArticle = document.createElement("article");
  tweetArticle.classList.add("tweet");
  tweetArticle.dataset.id = _id;

  const tweetPfp = storedPfps[_id] || getRandomPfp();
  const formattedTime = new Date(createdAt).toLocaleTimeString();

  tweetArticle.innerHTML = `
    <div class="tweet-header">
      <img src="${tweetPfp}" alt="${username}'s profile picture" class="tweet-pfp">
      <div class="tweet-user-info">
        <h2 class="tweet-username">${username}</h2>
        <time class="tweet-time" datetime="${createdAt}">${formattedTime}</time>
      </div>
      <button class="delete-tweet-btn" data-id="${_id}" title="Delete Tweet">🗑️</button>
    </div>
    ${content ? `<p class="tweet-content">${content}</p>` : ""}
    ${imageUrl ? `<img src="${API_URL}${imageUrl}" class="tweet-image">` : ""}
    <div class="tweet-actions">
      <button class="action-btn like-btn" data-id="${_id}" data-liked="false" title="Like">
        ❤️ <span class="like-count">${likes}</span>
      </button>
      <button class="action-btn comment-btn" data-id="${_id}" title="Comment">
        💬 Comment
      </button>
      <button class="action-btn share-btn" data-id="${_id}" title="Share">
        ↗️ Share
      </button>
    </div>
  `;

  return tweetArticle;
}

feed.addEventListener("click", async (event) => {
  const likeBtn = event.target.closest(".like-btn");
  const deleteBtn = event.target.closest(".delete-tweet-btn");

  // Handle Like Button Click
  if (likeBtn) {
    const tweetElement = likeBtn.closest(".tweet");
    const tweetId = tweetElement?.dataset.id;
    const likeCountSpan = likeBtn.querySelector(".like-count");
    let currentCount = parseInt(likeCountSpan.textContent, 10) || 0;

    const isLiked = likeBtn.dataset.liked === "true"; // Check if it's liked

    try {
      let response;
      if (isLiked) {
        // If the tweet is already liked, "unlike" it by decrementing the like count
        response = await fetch(`${API_URL}/api/posts/${tweetId}/like`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ liked: false }), // "unlike"
        });

        if (response.ok) {
          currentCount = Math.max(0, currentCount - 1); // Prevent going negative
          likeCountSpan.textContent = currentCount;
          likeBtn.dataset.liked = "false";
        }
      } else {
        // "like" it by incrementing the like count
        response = await fetch(`${API_URL}/api/posts/${tweetId}/like`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ liked: true }), // "like"
        });

        if (response.ok) {
          currentCount++;
          likeCountSpan.textContent = currentCount;
          likeBtn.dataset.liked = "true";
        }
      }
    } catch (error) {
      console.error("Error liking/unliking tweet:", error);
    }
  }

  // Handle Delete Button Click
  if (deleteBtn) {
    event.stopPropagation(); // Prevent click from redirecting to tweet page

    const tweetId = deleteBtn.dataset.id;
    const tweetElement = deleteBtn.closest(".tweet");

    try {
      const response = await fetch(`${API_URL}/api/posts/${tweetId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        tweetElement.remove(); // Remove tweet from the feed on success
      } else {
        alert("Failed to delete tweet.");
      }
    } catch (error) {
      console.error("Error deleting tweet:", error);
      alert("Error deleting tweet.");
    }
  }
});


// Share button: Copy link to clipboard and notify user
feed.addEventListener("click", async (event) => {
  const shareBtn = event.target.closest(".share-btn");
  if (!shareBtn) return;

  const tweetId = shareBtn.dataset.id;
  const tweetLink = `${window.location.origin}/tweet.html?id=${tweetId}`;

  try {
    await navigator.clipboard.writeText(tweetLink);
    alert("🔗 Link copied! You can now share it.");
  } catch (err) {
    console.error("Error copying link:", err);
    alert("Failed to copy link. Please copy manually.");
  }
});


// Also make "Comment" button open the tweet page
feed.addEventListener("click", (event) => {
  const commentBtn = event.target.closest(".comment-btn");
  if (!commentBtn) return;

  const tweetId = commentBtn.dataset.id;
  window.location.href = `/tweet.html?id=${tweetId}`;
});

// Listen for share button click
feed.addEventListener("click", (event) => {
  const shareBtn = event.target.closest(".share-btn");
  if (!shareBtn) return;

  const tweetId = shareBtn.dataset.id;
  window.location.href = `/tweet.html?id=${tweetId}`;
});

async function fetchAndDisplayPosts() {
  try {
    const response = await fetch(`${API_URL}/api/posts`);
    const posts = await response.json();

    feed.innerHTML = ""; 

    posts.forEach((post) => {
      const tweetElement = createTweetElement(post);
      feed.appendChild(tweetElement);
    });
  } catch (error) {
    console.error("Error fetching tweets:", error);
  }
}

// Call this when the page loads
document.addEventListener("DOMContentLoaded", fetchAndDisplayPosts);

// Listen for file selection
imageUpload.addEventListener("change", function () {
  const file = this.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      imagePreview.src = e.target.result;
      imagePreviewContainer.style.display = "block";
    };

    reader.readAsDataURL(file);
  }
});

// Remove Image Functionality
removeImageButton.addEventListener("click", () => {
  imageUpload.value = ""; // Clear file input
  imagePreviewContainer.style.display = "none"; // Hide preview
});

tweetForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = tweetForm.elements.username.value.trim();
  const tweetContent = tweetBox.value.trim();
  const currentTime = new Date();

  // Allow tweet if there's text OR an image
  if (!username) {
    alert("Username is required!");
    return;
  }
  if (!tweetContent && !imageUpload.files[0]) {
    alert("Tweet cannot be empty! Add text or an image.");
    return;
  }

  const formData = new FormData();
  formData.append("username", username);
  if (tweetContent) formData.append("tweet", tweetContent);

  if (imageUpload.files[0]) {
    formData.append("image", imageUpload.files[0]);
  }

  try {
    const response = await fetch(`${API_URL}/api/upload-tweet`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();

      const newTweet = createTweetElement({
        _id: result.post._id,
        username,
        content: tweetContent,
        imageUrl: result.imageUrl || null,
        createdAt: currentTime.toISOString(),
      });

      // Prepend new tweet to show at the top
      feed.prepend(newTweet);
      tweetForm.reset();
      imagePreviewContainer.style.display = "none";
    } else {
      alert("Failed to post tweet.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error posting tweet.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const feed = document.getElementById("feed");

  if (!feed) {
    console.error("❌ Error: #feed section not found.");
    return;
  }

  // Load liked posts from localStorage
  const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || {};

  // Like button functionality
  feed.addEventListener("click", async (event) => {
    const likeBtn = event.target.closest(".like-btn");
    if (!likeBtn) return;

    const tweetElement = likeBtn.closest(".tweet");
    const tweetId = tweetElement?.dataset.id;

    if (!tweetId) {
      console.error("❌ Error: tweetId is undefined!");
      return;
    }

    const likeCountSpan = likeBtn.querySelector(".like-count");
    let currentCount = parseInt(likeCountSpan.textContent, 10) || 0;

    const isLiked = likedPosts[tweetId] || false; // Check if already liked

    try {
      let response;
      if (isLiked) {
        // If the tweet is already liked, "unlike" it by decrementing the like count
        response = await fetch(`${API_URL}/${tweetId}/like`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ liked: false }), // Send the "unlike" request
        });

        if (response.ok) {
          const result = await response.json();
          currentCount = Math.max(0, currentCount - 1); // Ensure like count does not go negative
          likeCountSpan.textContent = currentCount;
          likeBtn.dataset.liked = "false"; // Mark it as unliked
          likedPosts[tweetId] = false; // Update localStorage
        }
      } else {
        // If the tweet is not liked, "like" it by incrementing the like count
        response = await fetch(`${API_URL}/api/posts/${tweetId}/like`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ liked: true }), // Send the "like" request
        });

        if (response.ok) {
          const result = await response.json();
          currentCount++; // Increment like count
          likeCountSpan.textContent = currentCount;
          likeBtn.dataset.liked = "true"; // Mark it as liked
          likedPosts[tweetId] = true; // Update localStorage
        }
      }

      // Store the updated liked status in localStorage
      localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
    } catch (error) {
      console.error("Error liking/unliking tweet:", error);
    }
  });
});
