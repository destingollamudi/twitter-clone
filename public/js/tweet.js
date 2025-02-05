import { getRandomPfp } from './utils.js';
import { postTweet, fetchPosts, likeTweet, deleteTweet } from './api.js';

const tweetForm = document.getElementById('tweetForm');
const tweetBox = document.getElementById('tweet-box');
const feed = document.getElementById('feed');
const maxLength = 280;
const counterProgress = document.getElementById('counter-progress');

// Update the progress bar when typing
tweetBox.addEventListener('input', () => {
  const currentLength = tweetBox.value.length;
  const progress = currentLength / maxLength;
  const offset = 2 * Math.PI * 20 * (1 - progress); // Circumference 2*PI*20
  counterProgress.style.strokeDashoffset = offset;
});

export function createTweetElement({ _id, username, content, image, createdAt, likes = 0 }) {
  const tweetPfp = getRandomPfp();
  const formattedTime = new Date(createdAt).toLocaleTimeString();

  const tweetArticle = document.createElement('article');
  tweetArticle.classList.add('tweet');
  tweetArticle.dataset.id = _id;

  tweetArticle.innerHTML = `
    <div class="tweet-header">
      <img src="${tweetPfp}" class="tweet-pfp">
      <div class="tweet-user-info">
        <h2 class="tweet-username">${username}</h2>
        <time class="tweet-time">${formattedTime}</time>
      </div>
      <button class="delete-tweet-btn" data-id="${_id}" title="Delete Tweet">🗑️</button>
    </div>
    <p class="tweet-content">${content}</p>
    ${image ? `<img src="${image}" class="tweet-image">` : ""}  <!-- FIXED IMAGE REFERENCE -->
    <div class="tweet-actions">
      <button class="action-btn like-btn" data-id="${_id}" title="Like">❤️ <span class="like-count">${likes}</span></button>
      <button class="action-btn comment-btn" data-id="${_id}" title="Comment">💬 Comment</button>
      <button class="action-btn share-btn" data-id="${_id}" title="Share">↗️ Share</button>
    </div>
  `;

  return tweetArticle;
}

export async function addTweet(e) {
  e.preventDefault();
  const formData = new FormData(tweetForm);

  try {
    const result = await postTweet(formData);
    
    const newTweet = createTweetElement({
      _id: result._id,
      username: formData.get("username"),
      content: formData.get("tweet"),
      image: result.image || null,  // FIXED PROPERTY NAME
      createdAt: new Date().toISOString(),
    });

    feed.prepend(newTweet);
  } catch (error) {
    console.error('Error adding tweet:', error);
  }
}


export function setUpFeed() {
  feed.addEventListener("click", async (event) => {
    // Like Button Logic
    const likeBtn = event.target.closest(".like-btn");
    if (likeBtn) {
      const tweetElement = likeBtn.closest(".tweet");
      const tweetId = tweetElement.dataset.id;
      const likeCountSpan = likeBtn.querySelector(".like-count");
      let currentCount = parseInt(likeCountSpan.textContent, 10) || 0;
      const isLiked = likeBtn.dataset.liked === "true"; // Check if it's liked

      try {
        // Check localStorage to prevent duplicate likes
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || {};

        // If the tweet is already liked, don't allow another like
        if (likedPosts[tweetId] && isLiked) {
          console.log('You have already liked this tweet.');
          return;
        }

        // Call the like/unlike function
        const result = await likeTweet(tweetId, isLiked);

        if (isLiked) {
          likeCountSpan.textContent = Math.max(0, currentCount - 1); // Decrement the like count
        } else {
          likeCountSpan.textContent = currentCount + 1; // Increment the like count
        }

        likeBtn.dataset.liked = isLiked ? "false" : "true"; // Toggle the like state
      } catch (error) {
        console.error("Error liking/unliking tweet:", error);
      }
    }

    // Delete Tweet Logic
    const deleteBtn = event.target.closest(".delete-tweet-btn");
    if (deleteBtn) {
      event.stopPropagation(); // Prevent click from redirecting to tweet page

      const tweetId = deleteBtn.dataset.id;
      const tweetElement = deleteBtn.closest(".tweet");

      try {
        const response = await deleteTweet(tweetId);
        if (response) {
          tweetElement.remove(); // Remove tweet from the feed on success
        } else {
          alert("Failed to delete tweet.");
        }
      } catch (error) {
        console.error("Error deleting tweet:", error);
        alert("Error deleting tweet.");
      }
    }

    // Share Button: Copy the tweet link to clipboard
    const shareBtn = event.target.closest(".share-btn");
    if (shareBtn) {
      const tweetId = shareBtn.dataset.id;
      const tweetLink = `${window.location.origin}/tweet.html?id=${tweetId}`;

      try {
        await navigator.clipboard.writeText(tweetLink);
        alert("🔗 Link copied! You can now share it.");
      } catch (err) {
        console.error("Error copying link:", err);
        alert("Failed to copy link. Please copy manually.");
      }
    }

    // Clicking on the tweet itself (except for the buttons) should redirect to the tweet page
    const tweetElement = event.target.closest(".tweet");
    if (tweetElement && !event.target.closest(".tweet-actions")) {
      const tweetId = tweetElement.dataset.id;
      window.location.href = `/tweet.html?id=${tweetId}`; // Redirect to tweet page
    }

    // Comment Button: Redirect to the tweet page
    const commentBtn = event.target.closest(".comment-btn");
    if (commentBtn) {
      const tweetId = commentBtn.dataset.id;
      window.location.href = `/tweet.html?id=${tweetId}`; // Redirect to tweet page
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchPosts(); // Fetch and display all posts
  setUpFeed(); // Setup like, delete events for the feed
  const likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || {};

  // Loop through all tweets and set the like state based on localStorage
  document.querySelectorAll('.tweet').forEach(tweetElement => {
    const tweetId = tweetElement.dataset.id;
    const likeBtn = tweetElement.querySelector('.like-btn');
    if (likedPosts[tweetId]) {
      likeBtn.dataset.liked = "true"; // Mark as liked
    } else {
      likeBtn.dataset.liked = "false"; // Mark as unliked
    }
  });
});

tweetForm.addEventListener("submit", addTweet);
