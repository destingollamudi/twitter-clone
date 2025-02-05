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

export function createTweetElement({ _id, username, content, media, mediaType, createdAt, likes = 0 }) {
  const tweetPfp = getRandomPfp();
  const formattedTime = new Date(createdAt).toLocaleTimeString();

  const tweetArticle = document.createElement('article');
  tweetArticle.classList.add('tweet');
  tweetArticle.dataset.id = _id;

  let mediaElement = "";
  if (mediaType === "image") {
    mediaElement = `<img src="${media}" class="tweet-image">`;
  } else if (mediaType === "video") {
    mediaElement = `<video src="${media}" class="tweet-video" controls></video>`;
  }

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
    ${mediaElement}  <!-- Now supports images and videos -->
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

const mediaUpload = document.getElementById("mediaUpload");
const mediaPreviewContainer = document.getElementById("imagePreviewContainer"); // Same container
const mediaPreview = document.getElementById("imagePreview"); // Use existing image element

mediaUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file) {
    const fileType = file.type.split("/")[0]; // Check if it's image or video

    if (fileType === "image") {
      const reader = new FileReader();
      reader.onload = function (e) {
        mediaPreview.src = e.target.result;
        mediaPreview.style.display = "block";
        mediaPreviewContainer.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else if (fileType === "video") {
      mediaPreview.src = URL.createObjectURL(file);
      mediaPreview.style.display = "block";
      mediaPreviewContainer.style.display = "block";
      mediaPreview.controls = true; // Add video controls
    }
  }
});

export function setUpFeed() {
  feed.addEventListener("click", async (event) => {
    const tweetElement = event.target.closest(".tweet");
    if (!tweetElement) return;

    const tweetId = tweetElement.dataset.id;

    // Handle Comment Button Click
    const commentBtn = event.target.closest(".comment-btn");
    if (commentBtn) {
      const commentSection = tweetElement.querySelector(".comment-section");
      if (commentSection.style.display === "none") {
        commentSection.style.display = "block";
        await fetchComments(tweetId, tweetElement);
      } else {
        commentSection.style.display = "none";
      }
    }

    // Handle Adding a Comment
    const commentForm = event.target.closest(".comment-form");
    if (commentForm) {
      event.preventDefault();
      const inputField = commentForm.querySelector(".comment-input");
      const commentText = inputField.value.trim();
      if (commentText) {
        await addComment(tweetId, commentText, tweetElement);
        inputField.value = "";
      }
    }
  });
}

async function fetchComments(tweetId, tweetElement) {
  try {
    const response = await fetch(`${API_URL}/api/posts/${tweetId}/comments`);
    if (!response.ok) throw new Error("Failed to fetch comments.");

    const comments = await response.json();
    const commentsContainer = tweetElement.querySelector(".comments-container");
    commentsContainer.innerHTML = "";

    comments.forEach(comment => {
      const commentElement = document.createElement("p");
      commentElement.classList.add("comment");
      commentElement.textContent = comment.text;
      commentsContainer.appendChild(commentElement);
    });

    // Update the comment count
    tweetElement.querySelector(".comment-count").textContent = comments.length;
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
}

async function addComment(tweetId, commentText, tweetElement) {
  try {
    const response = await fetch(`${API_URL}/api/posts/${tweetId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: commentText }),
    });

    if (!response.ok) throw new Error("Failed to add comment.");

    const newComment = await response.json();
    const commentsContainer = tweetElement.querySelector(".comments-container");

    const commentElement = document.createElement("p");
    commentElement.classList.add("comment");
    commentElement.textContent = newComment.text;
    commentsContainer.appendChild(commentElement);

    // Update the comment count
    const commentCountSpan = tweetElement.querySelector(".comment-count");
    commentCountSpan.textContent = parseInt(commentCountSpan.textContent) + 1;
  } catch (error) {
    console.error("Error adding comment:", error);
  }
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

document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchPosts(currentPage);
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  currentPage++;
  fetchPosts(currentPage);
});

// Update pagination button states
function updatePaginationButtons(totalPages) {
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage >= totalPages;
  document.getElementById("pageIndicator").textContent = `Page ${currentPage}`;
}
