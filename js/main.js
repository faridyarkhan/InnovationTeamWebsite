/* ==========================================================
   Innovantage India Pvt Ltd - main script
   Features: mobile menu + Escape/outside close, header scroll state,
   active link + aria-current, marquee pause control, scroll reveal,
   back-to-top, WAI-ARIA tabs + keyboard nav, reduced-motion counters
   ========================================================== */
(function () {
  "use strict";

  var prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header scroll shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var updateHeaderState = function () {
      header.classList.toggle("scrolled", window.scrollY > 12);
    };
    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var hamburger = document.getElementById("hamburger");
  var nav = document.getElementById("nav");
  if (hamburger && nav) {
    var setMenuOpen = function (open, returnFocus) {
      nav.classList.toggle("open", open);
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", String(open));
      if (!open && returnFocus) hamburger.focus();
    };

    hamburger.addEventListener("click", function () {
      var isOpen = nav.classList.contains("open");
      setMenuOpen(!isOpen, false);
    });

    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        setMenuOpen(false, false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setMenuOpen(false, true);
      }
    });

    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && header && !header.contains(e.target)) {
        setMenuOpen(false, false);
      }
    });
  }

  /* ---------- Highlight current page in nav ---------- */
  var page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach(function (a) {
    if (a.getAttribute("href") === page) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });

  /* ---------- Capabilities marquee pause/play control ---------- */
  var marquee = document.getElementById("capabilitiesMarquee");
  var marqueeToggle = document.getElementById("marqueeToggle");
  if (marquee && marqueeToggle) {
    marqueeToggle.addEventListener("click", function () {
      var paused = marquee.classList.toggle("is-paused");
      marqueeToggle.setAttribute("aria-pressed", String(paused));
      marqueeToggle.textContent = paused ? "Play" : "Pause";
      marqueeToggle.setAttribute(
        "aria-label",
        paused ? "Play scrolling capabilities" : "Pause scrolling capabilities"
      );
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ---------- Back to top ---------- */
  var topBtn = document.getElementById("backToTop");
  if (topBtn) {
    var updateTopBtn = function () {
      topBtn.classList.toggle("show", window.scrollY > 400);
    };
    updateTopBtn();
    window.addEventListener("scroll", updateTopBtn, { passive: true });
    topBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  /* ---------- WAI-ARIA Tabs (Platforms & Engineering Capabilities) ---------- */
  var tabButtons = Array.prototype.slice.call(document.querySelectorAll(".tab-btn"));
  var tabPanels = Array.prototype.slice.call(document.querySelectorAll(".tab-panel"));

  function activateTab(btn, shouldFocus) {
    var target = btn.getAttribute("data-tab");
    tabButtons.forEach(function (b) {
      var selected = b === btn;
      b.classList.toggle("active", selected);
      b.setAttribute("aria-selected", String(selected));
      b.setAttribute("tabindex", selected ? "0" : "-1");
    });
    tabPanels.forEach(function (panel) {
      var active = panel.id === target;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
    if (shouldFocus) btn.focus();
  }

  tabButtons.forEach(function (btn, index) {
    btn.addEventListener("click", function () {
      activateTab(btn, false);
    });

    btn.addEventListener("keydown", function (e) {
      var nextIndex = null;
      if (e.key === "ArrowRight") nextIndex = (index + 1) % tabButtons.length;
      else if (e.key === "ArrowLeft") nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      else if (e.key === "Home") nextIndex = 0;
      else if (e.key === "End") nextIndex = tabButtons.length - 1;

      if (nextIndex !== null) {
        e.preventDefault();
        activateTab(tabButtons[nextIndex], true);
      }
    });
  });

  /* ---------- Counters (stats band) ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && !prefersReducedMotion && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var end = parseInt(el.getAttribute("data-count"), 10);
          var suffix = el.getAttribute("data-suffix") || "";
          var start = null;
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / 1100, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * end) + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          co.unobserve(el);
        });
      },
      { threshold: 0.35 }
    );
    counters.forEach(function (c) {
      co.observe(c);
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll(".js-year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
