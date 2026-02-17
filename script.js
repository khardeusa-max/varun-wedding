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
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -30px 0px" },
);
document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

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
