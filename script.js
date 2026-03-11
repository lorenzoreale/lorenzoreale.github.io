document.addEventListener("DOMContentLoaded", () => {
  // 1. Dynamic Year Update
  const yearEl = document.getElementById("year");
  if(yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }

  // 2. Scroll Reveal Observer
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); 
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
  
  // 3. Mobile Menu Toggle & Auto-Close
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // AUTO-CLOSE: When a user clicks a link, close the menu
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }
});
