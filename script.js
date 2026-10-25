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

  /* 4. CONTACT FORM (contact page only) - live.
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
        looking_for: contactForm.elements.looking_for.value,
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

  /* 5. FOCUS MODE on report screenshots (case-study pages).
     Mirrors the focus-mode icon on a Power BI visual: a button in the
     corner, or a click on the image, opens it full size in a dialog.
     Esc, the backdrop and the button close it. */
  const shots = document.querySelectorAll(".media-shot img");
  if (shots.length && typeof HTMLDialogElement === "function") {
    const view = document.createElement("dialog");
    view.className = "focus-view";
    view.setAttribute("aria-label", "Report page, full size");
    view.innerHTML = '<div class="focus-view-bar"><span></span><button class="btn btn-ghost" type="button">Back to page</button></div>';
    document.body.appendChild(view);
    const title = view.querySelector("span");
    const big = document.createElement("img");   // added on first open, so no empty image sits in the page
    const pageName = (img) => img.alt.split(":")[0];

    const open = (img) => {
      if (!big.isConnected) view.appendChild(big);
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      title.textContent = pageName(img);
      view.showModal();
    };
    view.querySelector("button").addEventListener("click", () => view.close());
    view.addEventListener("click", (e) => { if (e.target === view) view.close(); });

    const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
    shots.forEach((img) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "focus-btn";
      btn.innerHTML = icon + "Focus mode";
      btn.setAttribute("aria-label", "Focus mode: open " + pageName(img) + " full size");
      img.after(btn);
      btn.addEventListener("click", () => open(img));
      img.addEventListener("click", () => open(img));
    });
  }

  /* 6. VISIT COUNTING - GoatCounter.
     Cookieless and stores no personal data, so no consent banner is needed.
     Loaded from here so every page that includes script.js is counted without
     touching the HTML. count.js ignores localhost by itself, and opening any
     page with #toggle-goatcounter stops counting visits from that browser. */
  const counter = document.createElement("script");
  counter.async = true;
  counter.src = "https://gc.zgo.at/count.js";
  counter.dataset.goatcounter = "https://lorenzoreale.goatcounter.com/count";
  document.body.appendChild(counter);
});
