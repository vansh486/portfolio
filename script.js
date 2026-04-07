const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#siteNav");
const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
const revealItems = document.querySelectorAll(".reveal");
const sections = Array.from(document.querySelectorAll("main section[id]"));
const scrollProgress = document.querySelector("#scrollProgress");
const footerMeta = document.querySelector("#footerMeta");
const toast = document.querySelector("#toast");
const contactForm = document.querySelector("#contactForm");
const copyEmailButton = document.querySelector("#copyEmail");
const tiltCard = document.querySelector("[data-tilt]");

let toastTimer = null;

if (footerMeta) {
  footerMeta.textContent = `Open to internships and collaborative projects in ${new Date().getFullYear()}.`;
}

function setMenuState(isOpen) {
  if (!menuButton || !siteNav) return;

  menuButton.setAttribute("aria-expanded", String(isOpen));
  siteNav.classList.toggle("is-open", isOpen);
}

if (menuButton && siteNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;

    const clickedInsideNav = siteNav.contains(target);
    const clickedToggle = menuButton.contains(target);

    if (!clickedInsideNav && !clickedToggle) {
      setMenuState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      setMenuState(false);
    }
  });
}

function showToast(message, isError = false) {
  if (!toast) return;

  if (toastTimer) {
    window.clearTimeout(toastTimer);
  }

  toast.textContent = message;
  toast.classList.toggle("is-error", isError);
  toast.classList.add("is-visible");
  toast.setAttribute("aria-hidden", "false");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
    toast.setAttribute("aria-hidden", "true");
  }, 3200);
}

function animateCounter(card) {
  if (!card || card.dataset.animated === "true") return;

  const valueElement = card.querySelector(".metric-value");
  const targetValue = Number(card.dataset.target || 0);
  const suffix = card.dataset.suffix || "";

  if (!valueElement || !Number.isFinite(targetValue)) return;

  card.dataset.animated = "true";

  const duration = 1100;
  const startTime = performance.now();

  function tick(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(targetValue * eased);
    valueElement.textContent = `${currentValue}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    }
  }

  window.requestAnimationFrame(tick);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");

      if (entry.target.hasAttribute("data-counter")) {
        animateCounter(entry.target);
      }

      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -5% 0px",
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const currentId = entry.target.getAttribute("id");
      navLinks.forEach((link) => {
        const isMatch = link.getAttribute("href") === `#${currentId}`;
        link.classList.toggle("is-active", isMatch);
      });
    });
  },
  {
    threshold: 0.35,
    rootMargin: "-20% 0px -55% 0px",
  }
);

sections.forEach((section) => sectionObserver.observe(section));

function updateScrollProgress() {
  if (!scrollProgress) return;

  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const percent = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

  scrollProgress.style.width = `${percent}%`;
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector("button[type='submit']");
    contactForm.classList.add("is-sending");

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const response = await fetch(contactForm.action, {
        method: contactForm.method,
        body: new FormData(contactForm),
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Form request failed");
      }

      contactForm.reset();
      showToast("Message sent. I will get back to you soon.");
    } catch (error) {
      showToast("Could not send the message. Please try again later.", true);
      console.error(error);
    } finally {
      contactForm.classList.remove("is-sending");
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Message";
      }
    }
  });
}

if (copyEmailButton) {
  copyEmailButton.addEventListener("click", async () => {
    const email = copyEmailButton.getAttribute("data-email");

    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      showToast("Email copied to clipboard.");
    } catch (error) {
      showToast(`Email: ${email}`);
      console.error(error);
    }
  });
}

if (tiltCard && window.matchMedia("(hover: hover)").matches) {
  tiltCard.addEventListener("pointermove", (event) => {
    const rect = tiltCard.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 14;
    const rotateX = (0.5 - y) * 12;

    tiltCard.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  tiltCard.addEventListener("pointerleave", () => {
    tiltCard.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0)";
  });
}
