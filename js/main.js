/* Άνω Σουβλάκι — interactions */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- Scroll progress bar ---------- */
  var progress = document.getElementById("scrollProgress");
  function updateProgress() {
    var max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = "scaleX(" + p + ")";
  }

  /* ---------- Smart header: κρύβεται κατεβαίνοντας ---------- */
  var header = document.getElementById("siteHeader");
  var lastY = 0;
  function updateHeader() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);
    if (y > 320 && y > lastY + 6) header.classList.add("is-hidden");
    else if (y < lastY - 6 || y < 320) header.classList.remove("is-hidden");
    lastY = y;
  }

  var scrollTicking = false;
  window.addEventListener("scroll", function () {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(function () {
      updateHeader();
      updateProgress();
      scrollTicking = false;
    });
  }, { passive: true });
  updateHeader();
  updateProgress();

  /* ---------- Custom cursor (desktop) ---------- */
  if (finePointer && !prefersReduced) {
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    var cx = -100, cy = -100, rx = -100, ry = -100;
    var cursorSeen = false;
    document.addEventListener("mousemove", function (e) {
      cx = e.clientX; cy = e.clientY;
      if (!cursorSeen) { cursorSeen = true; document.body.classList.add("has-cursor"); }
      dot.style.left = cx + "px";
      dot.style.top = cy + "px";
    }, { passive: true });
    (function followRing() {
      rx += (cx - rx) * 0.16;
      ry += (cy - ry) * 0.16;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(followRing);
    })();
    document.addEventListener("mouseover", function (e) {
      var hit = e.target.closest("a, button, summary, .tab, [data-tilt]");
      ring.classList.toggle("is-active", !!hit);
    }, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  function closeNav() {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Άνοιγμα μενού");
    mobileNav.classList.remove("is-open");
    mobileNav.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") === "true";
    if (open) { closeNav(); return; }
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Κλείσιμο μενού");
    mobileNav.classList.add("is-open");
    mobileNav.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });
  mobileNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeNav);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* ---------- Hero title: word-by-word reveal ---------- */
  var title = document.getElementById("heroTitle");
  if (title && !prefersReduced) {
    var wi = 0;
    var wrapWords = function (node) {
      var frag = document.createDocumentFragment();
      node.childNodes.forEach(function (child) {
        if (child.nodeType === 3) {
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span");
            w.className = "w";
            var inner = document.createElement("span");
            inner.textContent = part;
            inner.style.setProperty("--wi", wi++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
        } else if (child.nodeType === 1) {
          if (child.tagName === "BR") { frag.appendChild(child.cloneNode()); return; }
          var el = child.cloneNode(false);
          el.appendChild(wrapWords(child));
          frag.appendChild(el);
        }
      });
      return frag;
    };
    var wrapped = wrapWords(title);
    title.textContent = "";
    title.appendChild(wrapped);
  }

  /* ---------- Flip words (hero) ---------- */
  var flip = document.getElementById("flipWords");
  if (flip) {
    var words = flip.dataset.words.split("|");
    if (prefersReduced) {
      flip.textContent = words[0];
    } else {
      // Δημιουργία όλων των spans ώστε το πλάτος να μη «χοροπηδά»
      flip.innerHTML = "";
      var spans = words.map(function (w) {
        var s = document.createElement("span");
        s.className = "flip-word";
        s.textContent = w;
        flip.appendChild(s);
        return s;
      });
      var idx = 0;
      spans[0].classList.add("is-in");
      setInterval(function () {
        var cur = spans[idx];
        idx = (idx + 1) % spans.length;
        var next = spans[idx];
        cur.classList.remove("is-in");
        cur.classList.add("is-out");
        next.classList.remove("is-out");
        next.classList.add("is-in");
        setTimeout(function () { cur.classList.remove("is-out"); }, 500);
      }, 2600);
    }
  }

  /* ---------- Hero: mouse parallax ---------- */
  var heroSection = document.getElementById("hero");
  if (heroSection && finePointer && !prefersReduced) {
    var heroImg = heroSection.querySelector(".hero-media");
    var heroContent = heroSection.querySelector(".hero-content");
    var tx = 0, ty = 0, gx = 0, gy = 0;
    heroSection.addEventListener("mousemove", function (e) {
      var r = heroSection.getBoundingClientRect();
      gx = (e.clientX - r.left) / r.width - 0.5;
      gy = (e.clientY - r.top) / r.height - 0.5;
    }, { passive: true });
    (function heroParallax() {
      tx += (gx - tx) * 0.05;
      ty += (gy - ty) * 0.05;
      heroImg.style.transform = "translate3d(" + (tx * -14) + "px," + (ty * -10) + "px,0)";
      heroContent.style.transform = "translate3d(" + (tx * 8) + "px," + (ty * 6) + "px,0)";
      requestAnimationFrame(heroParallax);
    })();
  }

  /* ---------- Ember particles (hero) ---------- */
  var canvas = document.getElementById("embers");
  if (canvas && !prefersReduced) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var running = true;

    function resize() {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    }
    resize();
    window.addEventListener("resize", resize);

    function spawn() {
      var w = canvas.width, h = canvas.height;
      return {
        x: Math.random() * w,
        y: h + 10,
        r: (Math.random() * 2.2 + 0.6) * devicePixelRatio,
        vy: (Math.random() * 0.7 + 0.35) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.45 * devicePixelRatio,
        life: 0,
        maxLife: Math.random() * 320 + 220,
        flicker: Math.random() * Math.PI * 2
      };
    }
    for (var i = 0; i < 54; i++) {
      var p = spawn();
      p.y = Math.random() * canvas.height;
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.life++;
        p.flicker += 0.12;
        p.x += p.vx + Math.sin(p.life * 0.02) * 0.35;
        p.y -= p.vy;
        var fade = 1 - p.life / p.maxLife;
        if (fade <= 0 || p.y < -12) { particles[i] = spawn(); continue; }
        var alpha = Math.max(0, fade * (0.55 + Math.sin(p.flicker) * 0.25));
        var grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grd.addColorStop(0, "rgba(255,171,94," + alpha + ")");
        grd.addColorStop(1, "rgba(224,85,31,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    tick();

    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (visible && !running) { running = true; tick(); }
      else if (!visible) { running = false; }
    }).observe(canvas);
  }

  /* ---------- Καπνός (CTA band + hero) ---------- */
  function spawnSmoke(target, count) {
    if (!target || prefersReduced) return;
    for (var s = 0; s < count; s++) {
      var puff = document.createElement("span");
      puff.className = "smoke";
      var size = 60 + Math.random() * 110;
      puff.style.width = size + "px";
      puff.style.height = size + "px";
      puff.style.left = Math.random() * 100 + "%";
      puff.style.animationDuration = 9 + Math.random() * 9 + "s";
      puff.style.animationDelay = -Math.random() * 14 + "s";
      target.appendChild(puff);
    }
  }
  spawnSmoke(document.querySelector(".cta-band"), 7);
  spawnSmoke(document.querySelector(".hero-media"), 5);

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el, idx) {
      el.style.setProperty("--stagger", idx % 4);
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Spotlight cards: ο κέρσορας «φωτίζει» ---------- */
  if (finePointer) {
    document.querySelectorAll("[data-spotlight], .menu-item").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      }, { passive: true });
    });
  }

  /* ---------- 3D tilt (bento & frames) ---------- */
  if (finePointer && !prefersReduced) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var raf = null;
      el.addEventListener("mousemove", function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = el.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = "perspective(700px) rotateX(" + (py * -5) + "deg) rotateY(" + (px * 6) + "deg) translateY(-2px)";
          raf = null;
        });
      });
      el.addEventListener("mouseleave", function () {
        el.style.transition = "transform .5s cubic-bezier(.22,1,.36,1)";
        el.style.transform = "";
        setTimeout(function () { el.style.transition = ""; }, 500);
      });
    });
  }

  /* ---------- Menu tabs ---------- */
  var tabs = document.querySelectorAll(".tab");
  var items = document.querySelectorAll(".menu-item");
  function showCat(cat) {
    var d = 0;
    items.forEach(function (item) {
      var match = item.dataset.cat === cat;
      item.classList.toggle("is-hidden", !match);
      item.classList.remove("anim-in");
      if (match) {
        void item.offsetWidth;
        item.style.setProperty("--d", d++);
        item.classList.add("anim-in");
      }
    });
  }
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      showCat(tab.dataset.cat);
    });
  });
  showCat("pites");

  /* ---------- Ώρες: σήμερα + ανοιχτά/κλειστά ---------- */
  var now = new Date();
  var day = now.getDay();
  var hoursRow = document.querySelector('#hoursTable tr[data-day="' + day + '"]');
  if (hoursRow) hoursRow.classList.add("today");

  function isOpenNow() {
    var d = now.getDay(), h = now.getHours(), m = now.getMinutes();
    var t = h * 60 + m;
    if (t >= 17 * 60) return d !== 0;
    if (t < 30) return d !== 1;
    return false;
  }
  var pill = document.getElementById("statusPill");
  if (pill) {
    var open = isOpenNow();
    pill.classList.add(open ? "open" : "closed");
    pill.querySelector(".status-text").textContent = open ? "Ανοιχτά τώρα" : "Κλειστά τώρα";
  }

  /* ---------- Number tickers ---------- */
  function animateNumber(el, target, opts) {
    opts = opts || {};
    var decimals = opts.decimals || 0;
    var prefix = opts.prefix || "";
    var suffix = opts.suffix || "";
    var pad = opts.pad || 0;
    function fmt(v) {
      var s = v.toFixed(decimals);
      if (pad) s = s.padStart(pad, "0");
      return prefix + s + suffix;
    }
    if (prefersReduced) { el.textContent = fmt(target); return; }
    var start = null;
    var step = function (ts) {
      if (!start) start = ts;
      var pr = Math.min((ts - start) / 1300, 1);
      var eased = 1 - Math.pow(1 - pr, 3);
      el.textContent = fmt(target * eased);
      if (pr < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  var ratingEl = document.getElementById("ratingNum");
  if (ratingEl) {
    new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) {
        animateNumber(ratingEl, parseFloat(ratingEl.dataset.target), { decimals: 1 });
        obs.disconnect();
      }
    }, { threshold: 0.6 }).observe(ratingEl);
  }

  document.querySelectorAll("[data-ticker]").forEach(function (el) {
    new IntersectionObserver(function (entries, obs) {
      if (!entries[0].isIntersecting) return;
      animateNumber(el, parseFloat(el.dataset.ticker), {
        decimals: el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0,
        prefix: el.dataset.prefix || "",
        suffix: el.dataset.suffix || "",
        pad: el.dataset.prefix ? 2 : 0
      });
      obs.disconnect();
    }, { threshold: 0.5 }).observe(el);
  });

  /* ---------- Reviews: infinite moving cards ---------- */
  var rail = document.getElementById("reviewsRail");
  if (rail) {
    var originals = Array.prototype.slice.call(rail.querySelectorAll(".review-card"));
    // Διπλασιασμός καρτών για αδιάκοπη ροή
    originals.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      rail.appendChild(clone);
    });

    var half = 0;
    function measureHalf() {
      half = 0;
      originals.forEach(function (c) { half += c.offsetWidth; });
      half += originals.length * 20; // gap
    }
    measureHalf();
    window.addEventListener("resize", measureHalf);

    var paused = false;
    var dragging = false;
    rail.classList.add("is-auto");
    rail.addEventListener("mouseenter", function () { paused = true; });
    rail.addEventListener("mouseleave", function () { paused = false; });
    rail.addEventListener("focusin", function () { paused = true; });
    rail.addEventListener("focusout", function () { paused = false; });

    if (!prefersReduced) {
      (function autoScroll() {
        if (!paused && !dragging && half > 0) {
          rail.scrollLeft += 0.6;
          if (rail.scrollLeft >= half) rail.scrollLeft -= half;
        }
        requestAnimationFrame(autoScroll);
      })();
    }

    var cards = rail.querySelectorAll(".review-card");
    function currentIndex() {
      var best = 0, bestDist = Infinity;
      cards.forEach(function (card, i) {
        var d = Math.abs(card.offsetLeft - rail.offsetLeft - rail.scrollLeft);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }
    function goTo(idx) {
      idx = Math.max(0, Math.min(cards.length - 1, idx));
      var target = cards[idx].offsetLeft - rail.offsetLeft;
      rail.scrollTo({ left: target, behavior: prefersReduced ? "auto" : "smooth" });
    }
    document.getElementById("railPrev").addEventListener("click", function () {
      paused = true;
      goTo(currentIndex() - 1);
      setTimeout(function () { paused = false; }, 2500);
    });
    document.getElementById("railNext").addEventListener("click", function () {
      paused = true;
      goTo(currentIndex() + 1);
      setTimeout(function () { paused = false; }, 2500);
    });

    var startX = 0, scrollStart = 0;
    rail.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      dragging = true;
      startX = e.clientX;
      scrollStart = rail.scrollLeft;
      rail.classList.add("dragging");
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      rail.scrollLeft = scrollStart - (e.clientX - startX);
    });
    window.addEventListener("pointerup", function () {
      dragging = false;
      rail.classList.remove("dragging");
    });
  }

  /* ---------- FAQ: ομαλό άνοιγμα/κλείσιμο ---------- */
  document.querySelectorAll(".faq details").forEach(function (det) {
    var summary = det.querySelector("summary");
    var content = det.querySelector("p");
    if (!summary || !content || prefersReduced || !content.animate) return;
    summary.addEventListener("click", function (e) {
      e.preventDefault();
      if (det.open) {
        content.animate(
          [{ height: content.offsetHeight + "px", opacity: 1 }, { height: "0px", opacity: 0 }],
          { duration: 260, easing: "ease-in-out", fill: "forwards" }
        );
        setTimeout(function () { det.open = false; }, 270);
      } else {
        det.open = true;
        var h = content.offsetHeight;
        content.animate(
          [{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }],
          { duration: 300, easing: "cubic-bezier(.22,1,.36,1)" }
        );
      }
    });
  });

  /* ---------- Μαγνητικά κουμπιά ---------- */
  if (!prefersReduced && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.22;
        btn.style.transform = "translate(" + x + "px," + y + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
        btn.style.transition = "transform .45s cubic-bezier(.22,1,.36,1)";
        setTimeout(function () { btn.style.transition = ""; }, 450);
      });
    });
  }

  /* ---------- Back to top ---------- */
  var backTop = document.getElementById("backTop");
  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("is-visible", window.scrollY > innerHeight * 1.2);
    }, { passive: true });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Sticky κάτω μπάρα (mobile) ---------- */
  var stickyBar = document.getElementById("stickyBar");
  var hero = document.getElementById("hero");
  if (stickyBar && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var pastHero = !entries[0].isIntersecting;
      stickyBar.classList.toggle("is-visible", pastHero);
      stickyBar.setAttribute("aria-hidden", pastHero ? "false" : "true");
    }, { rootMargin: "-80px 0px 0px 0px" }).observe(hero);
  }

  /* ---------- Έτος στο footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
