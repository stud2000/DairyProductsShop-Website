// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// Auto-dismiss flash messages
setTimeout(() => {
  document.querySelectorAll('.flash').forEach(el => {
    el.style.transition = 'opacity 0.5s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
  });
}, 5000);

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card, .why-card, .testimonial-card, .info-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// Active nav links
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.getAttribute('href') === currentPath) a.classList.add('active');
  if (currentPath.startsWith('/products') && a.getAttribute('href') === '/products') a.classList.add('active');
});

// Product variant selector
document.querySelectorAll('.variant-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

// Sticky call banner phone number click tracking
document.querySelectorAll('[data-call]').forEach(el => {
  el.addEventListener('click', () => {
    el.style.transform = 'scale(0.97)';
    setTimeout(() => el.style.transform = '', 150);
  });
});
