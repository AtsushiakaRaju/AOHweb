// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- SMOOTH SCROLLING & HEADER EFFECT ---
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if(targetElement){
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Header background change on scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (header) {
            header.style.background = window.scrollY > 50 
                ? 'rgba(0,0,0,0.98)' 
                : 'rgba(0,0,0,0.95)';
        }
    });

    // --- FIREBASE & COMMUNITY FEATURES ---

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyD8QNCb0sDpNG7RjF7DkkqHCS41_T9CcuQ",
        authDomain: "aoh-website-temp.firebaseapp.com",
        projectId: "aoh-website-temp",
        storageBucket: "aoh-website-temp.appspot.com",
        messagingSenderId: "537972977277",
        appId: "1:537972977277:web:f7d9f31b9b3d4cf6f7cb14"
    };

    // Initialize Firebase, but only if the firebase object is available
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();

        // Function to load comments and calculate average rating for a specific game
        const loadCommentsAndRatings = (gameId) => {
            const gameCard = document.getElementById(gameId);
            if (!gameCard) return;

            const commentsList = gameCard.querySelector('.comments-list');
            const avgRatingEl = gameCard.querySelector('.avg-rating');
            const starsDisplayEl = gameCard.querySelector('.stars-display');
            const reviewCountEl = gameCard.querySelector('.review-count');
            
            try {
                // Listen for real-time updates from Firestore for instant comment display
                db.collection('comments').where('gameId', '==', gameId).orderBy('timestamp', 'desc')
                  .onSnapshot(snapshot => {
                    commentsList.innerHTML = ''; // Clear existing comments
                    let totalRating = 0;
                    let reviewCount = snapshot.size;

                    if (snapshot.empty) {
                        commentsList.innerHTML = '<p>No reviews yet. Be the first!</p>';
                    } else {
                        snapshot.forEach(doc => {
                            const comment = doc.data();
                            totalRating += comment.rating;
                            const commentEl = document.createElement('div');
                            commentEl.className = 'comment-item';
                            
                            // Use textContent to prevent security issues (XSS attacks) from user input
                            const userStrong = document.createElement('strong');
                            userStrong.textContent = `${comment.username} rated it ${comment.rating}/5`;
                            const commentP = document.createElement('p');
                            commentP.textContent = comment.comment;

                            commentEl.appendChild(userStrong);
                            commentEl.appendChild(commentP);
                            commentsList.appendChild(commentEl);
                        });
                    }

                    // Calculate and display average rating
                    if (reviewCount > 0) {
                        const avgRating = (totalRating / reviewCount).toFixed(1);
                        const roundedAvg = Math.round(avgRating);
                        avgRatingEl.textContent = avgRating;
                        starsDisplayEl.innerHTML = '★'.repeat(roundedAvg) + '☆'.repeat(5 - roundedAvg);
                        reviewCountEl.textContent = `(${reviewCount} reviews)`;
                    } else {
                        avgRatingEl.textContent = 'N/A';
                        starsDisplayEl.innerHTML = '☆☆☆☆☆';
                        reviewCountEl.textContent = '(0 reviews)';
                    }
                });
            } catch(error) {
                console.error(`Error loading reviews for ${gameId}:`, error);
                commentsList.innerHTML = '<p>Could not load reviews.</p>';
            }
        };

        // Handle star rating input selection
        document.querySelectorAll('.star-input').forEach(starContainer => {
            const stars = starContainer.querySelectorAll('span');
            const ratingInput = starContainer.parentElement.querySelector('.rating-value');
            
            stars.forEach(star => {
                star.addEventListener('click', () => {
                    const ratingValue = star.dataset.value;
                    ratingInput.value = ratingValue;
                    stars.forEach(s => {
                        s.classList.toggle('selected', s.dataset.value <= ratingValue);
                    });
                });
            });
        });

        // Handle comment form submission
        document.querySelectorAll('.comment-form').forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const gameId = form.dataset.gameId;
                const rating = parseInt(form.querySelector('.rating-value').value);
                const username = form.querySelector('input[name="username"]').value;
                const comment = form.querySelector('textarea[name="comment"]').value;
                const submitButton = form.querySelector('button[type="submit"]');

                if (rating === 0) {
                    alert('Please select a star rating before submitting.');
                    return;
                }
                
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';

                try {
                    // Add comment to Firestore database
                    await db.collection('comments').add({
                        gameId: gameId,
                        username: username,
                        comment: comment,
                        rating: rating,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    form.reset(); // Clear the form
                    form.querySelector('.rating-value').value = '0'; // Reset hidden rating value
                    form.querySelectorAll('.star-input span').forEach(s => s.classList.remove('selected')); // Reset stars
                } catch (error) {
                    console.error("Error adding review: ", error);
                    alert('Sorry, there was an error submitting your review.');
                } finally {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit';
                }
            });
        });

        // Initially load comments and ratings for all relevant games
        loadCommentsAndRatings('skyflutter-dash');
        loadCommentsAndRatings('og-snake');
    } else {
        console.error("Firebase is not loaded. Make sure the Firebase SDK scripts are included in your HTML before script.js.");
    }
    
    // --- OTHER INTERACTIVE FEATURES (WISHLIST, ETC.) ---
    document.querySelectorAll('.game-btn').forEach(btn => {
      // Only add the pop-up alert for buttons that have a "data-action"
      if (btn.dataset.action) {
        btn.addEventListener('click', e => {
          e.preventDefault(); // Prevents the link from going to "#"
          const action = btn.dataset.action;
          let message = '';
          switch (action) {
            case 'wishlist':
              message = '❤️ Added to wishlist! You\'ll be notified when this game releases.';
              break;
            case 'updates':
              message = '📧 You\'ll receive updates about this upcoming game!';
              break;
          }
          if (message) alert(message);
        });
      }
    });

});
