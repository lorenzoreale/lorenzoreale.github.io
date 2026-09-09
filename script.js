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

  /* 3. NAVIGATION - no script required.
     The letterhead nav row carries the links on desktop and the bottom tab
     bar takes over below 780px. Both are plain markup with the current page
     marked by aria-current, so there is no menu to open, close or trap focus
     in, and navigation keeps working with JavaScript disabled. */

  /* 4. Portfolio source links (case-study pages).
     The github.com/lorenzoreale/powerbi-portfolio repo is public, so every
     [data-repo-link] resolves to a direct GitHub link (data-repo-link holds
     the optional path within the repo, data-repo-label the public link text).
     Set this back to false to revert to "available on request" mailto links. */
  const PORTFOLIO_REPO_PUBLIC = true;
  const PORTFOLIO_REPO_URL = "https://github.com/lorenzoreale/powerbi-portfolio";

  if (PORTFOLIO_REPO_PUBLIC) {
    document.querySelectorAll("[data-repo-link]").forEach((el) => {
      const path = el.getAttribute("data-repo-link");
      el.href = path ? PORTFOLIO_REPO_URL + "/tree/main/" + path : PORTFOLIO_REPO_URL;
      el.textContent = el.getAttribute("data-repo-label") || "View the full project on GitHub";
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  }

  /* 5. CONTACT FORM (contact page only) - live.
     Posts JSON to Web3Forms, which emails the message on. The access key is
     public by design: it identifies the destination inbox, not the account.
     The <form action> in contact/index.html is the no-JS fallback and must
     stay in step with FORM_ENDPOINT. */
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

    const FAILED = "Something went wrong and the message was not sent. Please try again, or email me directly.";

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      /* Honeypot: a person never sees this box, so a tick means a bot.
         Returning before the button is touched leaves the form untouched. */
      if (contactForm.elements.botcheck.checked) return;

      const payload = {
        access_key: FORM_ACCESS_KEY,
        name: contactForm.elements.name.value.trim(),
        email: contactForm.elements.email.value.trim(),
        company: contactForm.elements.company.value.trim(),
        message: contactForm.elements.message.value.trim(),
      };

      const restLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      /* A hung request must not leave the button reading "Sending..." forever */
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        const result = await response.json();
        if (response.ok && result.success) {
          showStatus("Thanks, your message has been sent. I'll reply as soon as I can.", false);
          contactForm.reset();
        } else {
          showStatus(FAILED, true);
        }
      } catch {
        showStatus(FAILED, true);
      } finally {
        clearTimeout(timeout);
        submitBtn.disabled = false;
        submitBtn.textContent = restLabel;
      }
    });
  }
});
