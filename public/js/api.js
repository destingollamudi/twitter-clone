const API_URL = "http://localhost:5500"; // Ensure this is correct for backend communication

// Fetch all posts
export async function fetchPosts() {
  try {
    const response = await fetch(`${API_URL}/api/posts`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching tweets:", error);
  }
}

// Post a new tweet with an image
export async function postTweet(formData) {
  try {
    const response = await fetch(`${API_URL}/api/upload-tweet`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to post tweet.");
    return await response.json();
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
