import { addTweet, createTweetElement } from './tweet.js';
import { fetchPosts } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  fetchPosts().then(posts => {
    const feed = document.getElementById('feed');
    posts.forEach(post => {
      const tweetElement = createTweetElement(post);
      feed.appendChild(tweetElement);
    });
  });

  // Add tweet to the feed
  document.getElementById('tweetForm').addEventListener('submit', addTweet);
});
