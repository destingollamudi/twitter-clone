const tweetForm = document.getElementById('tweetForm');
const feed = document.getElementById('feed');
const tweetBox = document.getElementById('tweet-box');
const counterProgress = document.getElementById('counter-progress');
const charCounter = document.getElementById('char-counter');
const maxLength = 280;
const radius = 20; 
const circumference = 2 * Math.PI * radius; 


counterProgress.style.strokeDasharray = circumference;
counterProgress.style.strokeDashoffset = circumference;

tweetBox.addEventListener('input', () => {
  const currentLength = tweetBox.value.length;
  const progress = currentLength / maxLength;
  const offset = circumference * (1 - progress);
  counterProgress.style.strokeDashoffset = offset;
});

tweetBox.addEventListener('focus', () =>{
  charCounter.style.opacity = '1';
});

tweetBox.addEventListener('blur', () =>{
  charCounter.style.opacity = '0';
});

const pfpArray = [
  '/img/pfp1.svg',
  '/img/pfp2.svg',
  '/img/pfp3.svg',
  '/img/pfp4.svg',
  '/img/pfp5.svg'
];

function getRandomPfp() {
  const randomIndex = Math.floor(Math.random() * pfpArray.length);
  return pfpArray[randomIndex];
}

// Listen for form submission
tweetForm.addEventListener('submit', (e) => {
  e.preventDefault(); 

  const username = tweetForm.elements.username.value;
  const tweetContent = tweetBox.value;
  const currentTime = new Date();

  const tweetArticle = document.createElement('article');
  tweetArticle.classList.add('tweet');

  const randomPfp = getRandomPfp();

  tweetArticle.innerHTML = `
    <div class="tweet-header">
      <img src="${randomPfp}" alt="${username}'s profile picture" class="tweet-pfp">
      <div class="tweet-user-info">
        <h2 class="tweet-username">${username}</h2>
        <time class="tweet-time" datetime="${currentTime.toISOString()}">
          ${currentTime.toLocaleTimeString()}
        </time>
      </div>
    </div>
    <p class="tweet-content">${tweetContent}</p>
    <div class="tweet-actions">
      <button class="action-btn like-btn" title="Like">
        <span>❤️</span><span class="like-count">10</span>
      </button>
      <button class="action-btn retweet-btn" title="Retweet">
          <span>🔁</span>
      </button>
      <button class="action-btn comment-btn" title="Comment">
        <span>💬</span>
      </button>
      <button class="action-btn share-btn" title="Share">
        <span>↗️</span>
      </button>
    </div>
  `;

  feed.prepend(tweetArticle);
  tweetForm.reset();
});


feed.addEventListener('click', (event) => {
  const likeBtn = event.target.closest('.like-btn');
  if (likeBtn) {
    const likeCountSpan = likeBtn.querySelector('.like-count');
    let currentCount = parseInt(likeCountSpan.textContent, 10) || 0;

    if (likeBtn.dataset.liked === "true") {
      currentCount = Math.max(0, currentCount - 1);
      likeBtn.dataset.liked = "false";
    } else {
      currentCount++;
      likeBtn.dataset.liked = "true";
    }

    likeCountSpan.textContent = currentCount;
  }
});

