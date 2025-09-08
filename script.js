// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Header scroll effect
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  header.style.background = window.scrollY > 100 
    ? 'rgba(0,0,0,0.98)' 
    : 'rgba(0,0,0,0.95)';
});

// Utility alert handler
const showAlert = msg => alert(msg);

// Game button interactions
document.querySelectorAll('.game-btn').forEach(btn => {
  // Only add the pop-up alert for buttons that have a "data-action"
  if (btn.dataset.action) {
    btn.addEventListener('click', e => {
      e.preventDefault(); // Prevents the link from going to "#"
      const action = btn.dataset.action;
      switch (action) {
        case 'wishlist':
          showAlert('❤️ Added to wishlist! You\'ll be notified when this game releases.');
          break;
        case 'updates':
          showAlert('📧 You\'ll receive updates about this upcoming game!');
          break;
      }
    });
  }
});

// CTA button interaction (Note: This won't find anything now as the investor button is gone, which is fine)
const ctaBtn = document.querySelector('.cta-button[data-action="contact"]');
if (ctaBtn) {
  ctaBtn.addEventListener('click', e => {
    e.preventDefault();
    showAlert('📞 Contact form would open here! For now, reach us at contact@altofhonor.com');
  });
}
