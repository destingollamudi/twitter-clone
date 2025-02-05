const API_URL = "http://localhost:5500"; // Ensure this is correct for backend communication


const tweetsPerPage = 15;
let currentPage = 1;  // Track current page

export async function fetchPosts(page = 1) {
  try {
    const response = await fetch(`${API_URL}/api/posts?page=${page}&limit=${tweetsPerPage}`);
    if (!response.ok) throw new Error("Failed to fetch tweets.");

    const { posts, totalPages } = await response.json(); // Expect backend to return totalPages

    // Clear existing feed before appending new tweets
    feed.innerHTML = "";

    posts.forEach((post) => {
      const tweetElement = createTweetElement(post);
      feed.appendChild(tweetElement);
    });

    updatePaginationButtons(totalPages);
  } catch (error) {
    console.error("Error fetching tweets:", error);
  }
}


// Post a new tweet with an image
export async function postTweet(event) {
  event.preventDefault();

  const formData = new FormData();
  const content = document.querySelector("#tweet-box").value;
  const mediaFile = document.querySelector("#mediaUpload").files[0];

  formData.append("content", content);
  if (mediaFile) formData.append("media", mediaFile);

  try {
    const response = await fetch(`${window.API_URL}/api/upload-tweet`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to post tweet.");
    const newTweet = await response.json();
    console.log("Tweet posted:", newTweet);

    // Clear input fields
    document.querySelector("#tweet-box").value = "";
    document.querySelector("#mediaUpload").value = "";
    mediaPreviewContainer.style.display = "none";

    // Refresh feed to show the new tweet
    fetchPosts();
  } catch (error) {
    console.error("Error posting tweet:", error);
  }
}


// Like a tweet
export async function likeTweet(tweetId) {
  try {
    const response = await fetch(`${API_URL}/api/posts/${tweetId}/like`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to like/unlike tweet.");
    return await response.json();
  } catch (error) {
    console.error("Error liking/unliking tweet:", error);
  }
}

// Delete a tweet
export async function deleteTweet(tweetId) {
  try {
    const response = await fetch(`${API_URL}/api/posts/${tweetId}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete tweet.");
    return true;
  } catch (error) {
    console.error("Error deleting tweet:", error);
  }
}
