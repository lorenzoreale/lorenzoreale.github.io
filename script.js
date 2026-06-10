document.addEventListener("DOMContentLoaded", () => {
  /* 1. Dynamic year in the footer */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }

  /* 2. Scroll reveal - skipped entirely if the user prefers reduced motion */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("active"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  /* 3. Mobile menu toggle (with aria-expanded + auto-close on navigation) */
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    const closeMenu = () => {
      navLinks.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("active");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    /* Close the menu on Escape for keyboard users */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* 4. CONTACT FORM (contact page only) - front-end ready, back-end deferred.
     To activate, set the two constants below and the form's action attribute
     in contact/index.html. Full instructions live in CONTACT-FORM.md.
       FORM_ENDPOINT   - the POST endpoint, e.g. "https://api.web3forms.com/submit"
       FORM_ACCESS_KEY - only needed when using Web3Forms */
  const FORM_ENDPOINT = "https://api.web3forms.com/submit";
  const FORM_ACCESS_KEY = "33ad46dc-fab6-476f-ad4e-f398094ff58b";

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const statusEl = contactForm.querySelector(".form-status");
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    const showStatus = (message, isError) => {
      statusEl.textContent = message;
      statusEl.classList.toggle("is-error", isError);
      statusEl.classList.toggle("is-success", !isError);
    };

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (FORM_ENDPOINT === "REPLACE_WITH_ENDPOINT") {
        console.log("Contact form not yet connected: set FORM_ENDPOINT and FORM_ACCESS_KEY in script.js.");
        return;
      }

      /* Honeypot: a person never sees this box, so a tick means a bot */
      if (contactForm.elements.botcheck.checked) return;

      const payload = {
        name: contactForm.elements.name.value.trim(),
        email: contactForm.elements.email.value.trim(),
        company: contactForm.elements.company.value.trim(),
        message: contactForm.elements.message.value.trim(),
      };
      if (FORM_ACCESS_KEY !== "REPLACE_IF_USING_WEB3FORMS") {
        payload.access_key = FORM_ACCESS_KEY;
      }

      const restLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (response.ok && result.success) {
          showStatus("Thanks, your message has been sent. I'll reply as soon as I can.", false);
          contactForm.reset();
        } else {
          showStatus("Something went wrong and the message was not sent. Please try again, or email me directly.", true);
        }
      } catch {
        showStatus("Something went wrong and the message was not sent. Please try again, or email me directly.", true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = restLabel;
      }
    });
  }
});
