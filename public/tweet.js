document.addEventListener("DOMContentLoaded", fetchTweetById);
const API_URL = "https://twitter-clone-a1wa.onrender.com";

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

async function fetchTweetById() {
  const urlParams = new URLSearchParams(window.location.search);
  const tweetId = urlParams.get("id");

  if (!tweetId) {
    console.error("❌ Error: No Tweet ID found in URL");
    return;
  }

  try {
    console.log(`Fetching tweet with ID: ${tweetId}`);

    const response = await fetch(`${API_URL}/api/posts/${tweetId}`);
    
    // Check the response status and log the result
    console.log("Response Status:", response.status);
    if (!response.ok) {
      throw new Error(`Failed to load tweet. Status: ${response.status}`);
    }

    // Parse the response JSON
    const post = await response.json();
    console.log("Fetched Tweet Data:", post);

    // Ensure the tweet data is valid
    if (!post) {
      throw new Error("Tweet data is missing.");
    }

    // Check if the PFP for this tweet is already in localStorage
    let tweetPfp = localStorage.getItem(`tweetPfp_${tweetId}`);
    if (!tweetPfp) {
      tweetPfp = getRandomPfp(); // Generate a new PFP if it doesn't exist
      localStorage.setItem(`tweetPfp_${tweetId}`, tweetPfp); // Save it in localStorage
    }

    // Update Open Graph meta tags for sharing preview
    document.querySelector('meta[property="og:title"]').setAttribute("content", `${post.username}'s Tweet`);
    document.querySelector('meta[property="og:description"]').setAttribute("content", post.content || "See the full conversation and comments.");
    document.querySelector('meta[property="og:image"]').setAttribute("content", post.imageUrl ? `${API_URL}${post.imageUrl}` : "default-preview.jpg");
    document.querySelector('meta[property="og:url"]').setAttribute("content", window.location.href);

    // Populate the tweet content dynamically in the HTML
    document.getElementById("tweet-container").innerHTML = `
      <article class="tweet">
        <div class="tweet-header">
          <img src="${tweetPfp}" class="tweet-pfp">
          <div class="tweet-user-info">
            <h2 class="tweet-username">${post.username}</h2>
            <time class="tweet-time">${new Date(post.createdAt).toLocaleTimeString()}</time>
          </div>
        </div>
        ${post.content ? `<p class="tweet-content">${post.content}</p>` : ""}
        ${post.imageUrl ? `<img src="${API_URL}${post.imageUrl}" class="tweet-image">` : ""}
        <h3>Comments</h3>
        <div id="comments">
          ${post.comments.map(comment => `
            <div class="comment">
              <img src="${comment.profilePic}" class="comment-pfp">
              <p><strong>${comment.username}</strong>: ${comment.content}</p>
            </div>
          `).join("")}
        </div>
        <textarea id="comment-box" placeholder="Write a comment..."></textarea>
        <button id="post-comment">Post</button>
      </article>
    `;

    // Handle comment posting
    document.getElementById("post-comment").addEventListener("click", async () => {
      const content = document.getElementById("comment-box").value.trim();
      if (!content) return;

      try {
        await fetch(`${API_URL}/api/posts/${tweetId}/comment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "AnonUser", content, profilePic: getRandomPfp() }),
        });

        location.reload();
      } catch (error) {
        console.error("Error posting comment:", error);
      }
    });
  } catch (error) {
    console.error("Error fetching tweet:", error);
    document.getElementById("tweet-container").innerHTML = "<p>❌ Failed to load tweet.</p>";
  }
}
