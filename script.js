const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  smoothTouch: false,
  touchMultiplier: 2,
});
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);

  // 3D Skew Effect
  const content = document.getElementById('main-content');
  if (content) {
    // Skew based on velocity (limit to small angles)
    const skew = Math.min(Math.max(lenis.velocity * 0.15, -7), 7);
    content.style.transform = `skewY(${skew}deg)`;
  }
}
requestAnimationFrame(raf);

// ---- Page Loader ----
window.addEventListener("load", () => {
  setTimeout(
    () => document.getElementById("pageLoader").classList.add("hidden"),
    1200,
  );
});

// ---- Nav scroll ----
const nav = document.getElementById("mainNav");
window.addEventListener("scroll", () =>
  nav.classList.toggle("scrolled", window.scrollY > 60),
);

// ---- Active nav link ----
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav a");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((s) => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinks.forEach((l) => {
    l.classList.remove("active");
    if (l.getAttribute("href") === "#" + current) l.classList.add("active");
  });
});

// ---- Countdown ----
const weddingDate = new Date("2026-03-16T18:00:00+05:30").getTime();
function updateCD() {
  const diff = weddingDate - Date.now();
  if (diff <= 0) {
    document.getElementById("days").textContent = "🎊";
    return;
  }
  document.getElementById("days").textContent = Math.floor(diff / 864e5);
  document.getElementById("hours").textContent = String(
    Math.floor((diff % 864e5) / 36e5),
  ).padStart(2, "0");
  document.getElementById("minutes").textContent = String(
    Math.floor((diff % 36e5) / 6e4),
  ).padStart(2, "0");
  document.getElementById("seconds").textContent = String(
    Math.floor((diff % 6e4) / 1e3),
  ).padStart(2, "0");
}
updateCD();
setInterval(updateCD, 1000);

// ---- Floating marigold petals ----
(function createPetals() {
  const container = document.getElementById("petals");
  for (let i = 0; i < 20; i++) {
    const p = document.createElement("div");
    p.classList.add("petal");
    const size = Math.random() * 16 + 6;
    p.style.width = size + "px";
    p.style.height = size + "px";
    p.style.left = Math.random() * 100 + "%";
    p.style.animationDuration = Math.random() * 8 + 6 + "s";
    p.style.animationDelay = Math.random() * 10 + "s";
    container.appendChild(p);
  }
})();

// ---- Scroll Reveal ----
const revealEls = document.querySelectorAll(".reveal");
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  },
  { threshold: 0.05, rootMargin: "0px 0px -10px 0px" },
);
revealEls.forEach((el) => revealObs.observe(el));

// Fallback: also check on native scroll events (helps on mobile where Lenis doesn't control scroll)
window.addEventListener("scroll", () => {
  revealEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 10 && rect.bottom > 0) {
      el.classList.add("visible");
    }
  });
}, { passive: true });

// ---- Lightbox ----
function openLightbox(el) {
  document.getElementById("lightboxImg").src = el.querySelector("img").src;
  document.getElementById("lightbox").classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  document.getElementById("lightbox").classList.remove("active");
  document.body.style.overflow = "";
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

// ---- RSVP Google Sheets ----
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwHw_VW9M6Ck_Oc6p38WCTaoJzLAPLmS3jO6frzne9wnrloi-OFv5_7riN92foPW-HVww/exec';

function handleRSVP(e) {
  e.preventDefault();
  const name = document.getElementById("guestName").value.trim();
  const guests = document.getElementById("guestCount").value;
  const attending = document.getElementById("attending").value;
  const message = document.getElementById("message").value.trim();
  if (!name || !guests || !attending) {
    alert("Please fill all required fields.");
    return false;
  }

  const btn = document.querySelector(".btn-rsvp");
  btn.disabled = true;
  btn.innerHTML = "⏳ Sending...";

  // Build URL with query params — reliable method for Apps Script
  const params = new URLSearchParams({
    name: name,
    guests: guests,
    attending: attending,
    message: message
  });

  // Use hidden iframe to submit via GET (avoids all CORS issues)
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.name = 'rsvp_frame';
  document.body.appendChild(iframe);
  iframe.src = GOOGLE_SHEET_URL + '?' + params.toString();

  // Show success after a short delay (iframe won't fire events cross-origin)
  setTimeout(() => {
    btn.innerHTML = "✅ RSVP Sent Successfully!";
    btn.style.background = "linear-gradient(135deg, #2ecc71, #27ae60)";
    document.getElementById("rsvpForm").reset();
    setTimeout(() => {
      btn.innerHTML = '🎉 Send RSVP';
      btn.style.background = "";
      btn.disabled = false;
      document.body.removeChild(iframe);
    }, 4000);
  }, 2000);

  return false;
}

// ---- Curtain Reveal Logic ----
function initCurtains() {
  const left = document.getElementById('curtainLeft');
  const right = document.getElementById('curtainRight');
  if (!left || !right) return;

  let isDragging = false;
  let startX = 0;
  let activeCurtain = null;

  const handleStart = (e, curtain) => {
    isDragging = true;
    activeCurtain = curtain;
    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    curtain.style.transition = 'none'; // Direct control
  };

  // Sync drag logic: Opening one opens both
  const handleMove = (e) => {
    if (!isDragging || !activeCurtain) return;
    e.preventDefault();
    const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const delta = currentX - startX;

    // Calculate open amount (always positive for opening)
    // If dragging Left curtain: delta should be negative to open.
    // If dragging Right curtain: delta should be positive to open.

    let openAmount = 0;
    if (activeCurtain === left) {
      // Dragging left curtain to left (negative delta) = opening
      if (delta < 0) openAmount = Math.abs(delta);
    } else {
      // Dragging right curtain to right (positive delta) = opening
      if (delta > 0) openAmount = delta;
    }

    if (openAmount > 0) {
      // Apply mirrored transform to BOTH
      left.style.transform = `translateX(-${openAmount}px)`;
      right.style.transform = `translateX(${openAmount}px)`;
    }
  };

  const handleEnd = () => {
    if (!isDragging || !activeCurtain) return;
    isDragging = false;

    // Check threshold using left curtain's transform
    const transformVal = left.style.transform;
    const match = transformVal.match(/translateX\(([-]?\d+(\.\d+)?)px\)/);
    const currentShift = match ? Math.abs(parseFloat(match[1])) : 0;

    const threshold = window.innerWidth * 0.15;

    if (currentShift > threshold) {
      // Open both fully
      left.classList.add('open-left');
      right.classList.add('open-right');
      left.style.transform = '';
      right.style.transform = '';
    } else {
      // Reset both
      left.style.transition = 'transform 0.5s ease-out';
      right.style.transition = 'transform 0.5s ease-out';
      left.style.transform = 'translateX(0)';
      right.style.transform = 'translateX(0)';
    }
    activeCurtain = null;
  };

  // Bind events
  [left, right].forEach(c => {
    c.addEventListener('mousedown', (e) => handleStart(e, c));
    c.addEventListener('touchstart', (e) => handleStart(e, c), { passive: false });
  });

  window.addEventListener('mousemove', handleMove);
  window.addEventListener('touchmove', handleMove, { passive: false });
  window.addEventListener('mouseup', handleEnd);
  window.addEventListener('touchend', handleEnd);
}

// Initialize
initCurtains();
