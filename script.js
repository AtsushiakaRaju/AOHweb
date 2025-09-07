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
  btn.addEventListener('click', e => {
    e.preventDefault();
    const action = btn.dataset.action; // use data-action instead of textContent
    switch (action) {
      case 'play':
        showAlert('🎮 Game launching in web player! (Connect to your actual game)');
        break;
      case 'download':
        showAlert('⬇️ Download starting! (Trigger your game download)');
        break;
      case 'wishlist':
        showAlert('❤️ Added to wishlist! You\'ll be notified when this game releases.');
        break;
      case 'updates':
        showAlert('📧 You\'ll receive updates about this upcoming game!');
        break;
      case 'subscribe':
        showAlert('📬 Newsletter subscription activated! Welcome to the AOH community!');
        break;
    }
  });
});

// CTA button interaction
const ctaBtn = document.querySelector('.cta-button[data-action="contact"]');
if (ctaBtn) {
  ctaBtn.addEventListener('click', e => {
    e.preventDefault();
    showAlert('📞 Contact form would open here! For now, reach us at contact@altofhonor.com');
  });
}

// Social links interaction
document.querySelectorAll('.social-links a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const platform = link.dataset.platform; // use data-platform attribute
    showAlert(`🔗 This would open your ${platform} page! Connect your actual social media links here.`);
  });
});
