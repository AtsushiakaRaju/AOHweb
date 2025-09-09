// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- UI INTERACTIONS THAT DON'T NEED FIREBASE (RUN IMMEDIATELY) ---

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
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

    // Handle star rating input selection - THIS IS THE FIX
    // This code now runs instantly and doesn't wait for Firebase.
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
    
    // Handle Wishlist/Updates buttons
    document.querySelectorAll('.game-btn[data-action]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
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
    });


    // --- FIREBASE & DATA-DEPENDENT FEATURES ---

    // This async function will fetch the config and then initialize Firebase
    async function initializeFirebase() {
        try {
            const response = await fetch('/.netlify/functions/firebase-config');
            if (!response.ok) {
                throw new Error(`Failed to fetch Firebase config (${response.status})`);
            }
            const firebaseConfig = await response.json();

            if (typeof firebase !== 'undefined' && firebaseConfig.apiKey) {
                firebase.initializeApp(firebaseConfig);
                const db = firebase.firestore();
                // Once Firebase is ready, set up the features that depend on it
                setupDatabaseFeatures(db);
            } else {
                console.error("Firebase library not loaded or config missing API key.");
            }
        } catch (error) {
            console.error("Could not initialize Firebase:", error);
        }
    }

    // This function sets up all features that NEED a database connection
    function setupDatabaseFeatures(db) {
        
        // Function to load comments and ratings from Firestore
        const loadCommentsAndRatings = (gameId) => {
            const gameCard = document.getElementById(gameId);
            if (!gameCard) return;

            const commentsList = gameCard.querySelector('.comments-list');
            const avgRatingEl = gameCard.querySelector('.avg-rating');
            const starsDisplayEl = gameCard.querySelector('.stars-display');
            const reviewCountEl = gameCard.querySelector('.review-count');
            
            db.collection('comments').where('gameId', '==', gameId).orderBy('timestamp', 'desc')
              .onSnapshot(snapshot => {
                commentsList.innerHTML = '';
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
                        
                        const userStrong = document.createElement('strong');
                        userStrong.textContent = `${comment.username} rated it ${comment.rating}/5`;
                        const commentP = document.createElement('p');
                        commentP.textContent = comment.comment;

                        commentEl.appendChild(userStrong);
                        commentEl.appendChild(commentP);
                        commentsList.appendChild(commentEl);
                    });
                }

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
              }, error => {
                  console.error(`Error fetching reviews for ${gameId}: `, error);
                  commentsList.innerHTML = '<p>Error loading reviews.</p>';
              });
        };

        // Handle comment form submission (needs the 'db' object)
        document.querySelectorAll('.comment-form').forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const gameId = form.dataset.gameId;
                const rating = parseInt(form.querySelector('.rating-value').value);
                const comment = form.querySelector('textarea[name="comment"]').value;
                const submitButton = form.querySelector('button[type="submit"]');

                if (rating === 0) {
                    alert('Please select a star rating before submitting.');
                    return;
                }
                
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';

                try {
                    await db.collection('comments').add({
                        gameId: gameId,
                        username: "Anonymous",
                        comment: comment,
                        rating: rating,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    form.reset();
                    form.querySelector('.rating-value').value = '0';
                    form.querySelectorAll('.star-input span').forEach(s => s.classList.remove('selected'));
                } catch (error) {
                    console.error("Error adding review: ", error);
                    alert('Sorry, there was an error submitting your review.');
                } finally {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit';
                }
            });
        });

        // Initially load data for the games
        loadCommentsAndRatings('skyflutter-dash');
        loadCommentsAndRatings('og-snake');
    }

    // Start the Firebase initialization process
    initializeFirebase();

});

