// 1. Update Year
document.getElementById('year').textContent = new Date().getFullYear();

// 2. Mobile Menu Toggle
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('open');
}

// 3. (Optional) Highlights active link if you visit directly
// This adds the 'active' class based on the current URL if it's missing in HTML
const currentPath = window.location.pathname.split('/').pop();
const navLinks = document.querySelectorAll('.nav-links a');

navLinks.forEach(link => {
    if(link.getAttribute('href') === currentPath) {
        link.classList.add('active');
    }
});