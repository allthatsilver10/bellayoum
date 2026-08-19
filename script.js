/* ============================================================================
   BELLA YOUM — Theatre Portfolio & Archive
   ============================================================================

   WHAT THIS FILE DOES, IN ORDER
     1  Load the photo data
     2  Router          — which page is showing
     3  Fresnel spotlight
     4  Curtain intro
     5  Portfolio       — built from the data
     6  Archive doors   — built from the data
     7  Gallery         — built from the data, justified rows
     8  Lightbox
     9  Language switch
    10  Start

   NOTHING HERE NEEDS EDITING TO ADD PHOTOS.
   Drop files into archive/<room>/ or projects/<folder>/ and ask Claude to
   rebuild gallery-data.json. This file reads whatever is in there.
   ========================================================================= */

(function () {
  "use strict";

  /* ==========================================================================
     1 · LOAD THE PHOTO DATA
     ------------------------------------------------------------------------
     gallery-data.json is the real file. Chrome will not let a page read a
     .json off your own hard drive, so when you just double-click index.html
     we fall back to gallery-data.js, which holds exactly the same data.
     Both are written by tools/build-gallery.py, so they cannot disagree.
     ====================================================================== */
  function loadData() {
    return fetch("gallery-data.json", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .catch(function () {
        return window.GALLERY_DATA || { projects: [], archive: {} };
      });
  }

  var DATA = { projects: [], archive: {} };

  /* ==========================================================================
     2 · ROUTER
     ------------------------------------------------------------------------
     The address bar drives everything:
        #/            opening
        #/profile     #/portfolio     #/archive     #/contact
        #/archive/pottery | photography | boxing
     Every link in the HTML is a normal href, so the back button works and
     any page can be shared as a link.
     ====================================================================== */
  var PAGES = ["opening", "profile", "portfolio", "archive", "gallery", "contact"];

  var TITLES = {
    opening:   "Bella Youm — Stage Manager",
    profile:   "Profile — Bella Youm",
    portfolio: "Portfolio — Bella Youm",
    archive:   "Archive — Bella Youm",
    gallery:   "Archive — Bella Youm",
    contact:   "Contact — Bella Youm"
  };

  function parseHash() {
    var raw = (location.hash || "#/").replace(/^#\/?/, "");
    var bits = raw.split("/").filter(Boolean);
    if (!bits.length) return { page: "opening" };
    if (bits[0] === "archive" && bits[1]) return { page: "gallery", room: bits[1] };
    return { page: PAGES.indexOf(bits[0]) > -1 ? bits[0] : "opening" };
  }

  function route() {
    var r = parseHash();

    PAGES.forEach(function (name) {
      var section = document.getElementById("page-" + name);
      if (!section) return;
      var show = name === r.page;
      section.hidden = !show;
      section.classList.toggle("entering", show);
    });

    // highlight the menu item we are on ("gallery" still belongs to Archive)
    var lit = r.page === "gallery" ? "archive" : r.page;
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      a.classList.toggle("active", a.dataset.nav === lit);
    });

    if (r.page === "gallery") renderGallery(r.room);

    document.title = TITLES[r.page] || TITLES.opening;
    var foot = document.getElementById("foot-page");
    if (foot) foot.textContent = r.page.charAt(0).toUpperCase() + r.page.slice(1);

    window.scrollTo({ top: 0 });
  }

  /* ==========================================================================
     3 · FRESNEL SPOTLIGHT
     ------------------------------------------------------------------------
     A cone is drawn from the lantern's lens down to whatever the cursor is
     over. Because it is a four-point polygon recalculated each time, the
     light lands exactly on the word at any angle — including the name, which
     sits far over on the left.

     Only elements marked data-spot in the HTML can be lit.
     ====================================================================== */
  function initSpotlight() {
    var head = document.getElementById("site-head");
    var beam = document.getElementById("beam");
    var pool = document.getElementById("pool");
    if (!head || !beam || !pool) return;

    var targets = document.querySelectorAll("[data-spot]");

    function aim(el) {
      // the lantern is hidden on phones, so skip the whole thing there
      if (window.matchMedia("(max-width: 640px)").matches) return;

      var h = head.getBoundingClientRect();
      var r = el.getBoundingClientRect();

      var lensX = h.width / 2;                   // where the light comes from
      var lensY = 36;
      var atX = r.left - h.left + r.width / 2;   // what we are lighting
      var atY = r.top - h.top + r.height + 10;

      var apex = 8;                              // cone half-width at the lens
      var base = r.width / 2 + 40;               // cone half-width at the word

      beam.style.clipPath =
        "polygon(" +
        (lensX - apex) + "px " + lensY + "px, " +
        (lensX + apex) + "px " + lensY + "px, " +
        (atX + base) + "px " + atY + "px, " +
        (atX - base) + "px " + atY + "px)";

      beam.style.background =
        "radial-gradient(circle 520px at " + lensX + "px " + lensY + "px," +
        " rgba(255,255,255,.36) 0%, rgba(255,255,255,.14) 46%, rgba(255,255,255,0) 100%)";

      beam.classList.add("on");

      pool.style.left = atX + "px";
      pool.style.top = (atY - 16) + "px";
      pool.style.width = Math.max(120, r.width + 80) + "px";
      pool.classList.add("on");
    }

    targets.forEach(function (el) {
      el.addEventListener("mouseenter", function () { aim(el); });
      el.addEventListener("focus", function () { aim(el); });
    });

    head.addEventListener("mouseleave", function () {
      beam.classList.remove("on");
      pool.classList.remove("on");
    });
  }

  /* ==========================================================================
     4 · CURTAIN INTRO
     ------------------------------------------------------------------------
     Plays once per browser session so it never gets in the way of someone
     clicking around. The Replay button on the Opening page runs it again.
     ====================================================================== */
  function initIntro() {
    var intro = document.getElementById("intro");
    var replay = document.getElementById("replay");
    if (!intro) return;

    var seen = false;
    try { seen = sessionStorage.getItem("introSeen") === "1"; } catch (e) { /* private mode */ }

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seen || reduced) {
      intro.classList.add("skip");
    } else {
      intro.classList.add("run");
      try { sessionStorage.setItem("introSeen", "1"); } catch (e) { /* ignore */ }
    }

    if (replay) {
      replay.addEventListener("click", function () {
        var fresh = intro.cloneNode(true);
        fresh.classList.remove("skip");
        fresh.classList.add("run");
        intro.replaceWith(fresh);
        intro = fresh;
      });
    }
  }

  /* ==========================================================================
     5 · PORTFOLIO
     ------------------------------------------------------------------------
     One block per production, newest first, all in the same format.
     Clicking a photograph moves to the next one.
     ====================================================================== */
  function renderPortfolio() {
    var wrap = document.getElementById("productions");
    if (!wrap) return;

    if (!DATA.projects.length) {
      wrap.innerHTML = '<p class="gallery-empty">No productions yet.</p>';
      return;
    }

    wrap.innerHTML = DATA.projects.map(function (p, i) {
      var number = String(i + 1).padStart(2, "0");

      var slides = p.photos.map(function (photo, n) {
        return '<img src="' + photo.src + '" alt="' + escapeHtml(p.title) + ', photo ' + (n + 1) + '"' +
               (n === 0 ? ' class="on"' : ' loading="lazy"') + '>';
      }).join("");

      var dots = p.photos.map(function (_, n) {
        return '<span class="dot' + (n === 0 ? " on" : "") + '"></span>';
      }).join("");

      return '' +
        '<article class="production">' +
          '<div class="slideshow" data-slideshow tabindex="0" role="button" ' +
               'aria-label="' + escapeHtml(p.title) + ' — next photo">' +
            slides +
            '<div class="slide-ui">' +
              '<div class="dots">' + dots + '</div>' +
              '<span class="slide-hint" data-en="Click for next" data-kr="클릭하면 다음">Click for next</span>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<div class="production-no">' + number + '</div>' +
            '<h2>' + escapeHtml(p.title) + '</h2>' +
            '<dl class="credits">' +
              creditRow("Date", "날짜", p.date) +
              creditRow("Director", "연출", p.director) +
              creditRow("Venue", "장소", p.venue) +
              creditRow("My Role", "역할", p.role) +
            '</dl>' +
          '</div>' +
        '</article>';
    }).join("");

    wrap.querySelectorAll("[data-slideshow]").forEach(setupSlideshow);
    applyLanguage();                       // the new markup needs translating too
  }

  function creditRow(labelEn, labelKr, value) {
    if (!value) return "";
    return '<div><dt data-en="' + labelEn + '" data-kr="' + labelKr + '">' + labelEn + '</dt>' +
           '<dd>' + escapeHtml(value) + '</dd></div>';
  }

  function setupSlideshow(box) {
    var images = box.querySelectorAll("img");
    var dots = box.querySelectorAll(".dot");
    var at = 0;

    function paint() {
      images.forEach(function (img, n) { img.classList.toggle("on", n === at); });
      dots.forEach(function (d, n) { d.classList.toggle("on", n === at); });
    }
    function next() {
      at = (at + 1) % images.length;
      paint();
    }

    box.addEventListener("click", next);
    box.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); next(); }
    });
  }

  /* ==========================================================================
     6 · ARCHIVE DOORS
     ====================================================================== */
  function renderDoors() {
    var wrap = document.getElementById("doors");
    if (!wrap) return;

    var rooms = Object.keys(DATA.archive);

    wrap.innerHTML = rooms.map(function (key, i) {
      var room = DATA.archive[key];
      var count = room.count || (room.items ? room.items.length : 0);
      return '' +
        '<a class="door" href="#/archive/' + key + '">' +
          '<img src="' + room.cover + '" alt="' + escapeHtml(room.title) + '" loading="lazy">' +
          '<span class="door-index">' + String(i + 1).padStart(2, "0") + '</span>' +
          '<span class="door-veil"></span>' +
          '<span class="door-label">' +
            '<b data-en="' + escapeHtml(room.title) + '" data-kr="' +
              escapeHtml(room.title_kr || room.title) + '">' + escapeHtml(room.title) + '</b>' +
            '<i>' + count + ' photographs</i>' +
          '</span>' +
        '</a>';
    }).join("");

    applyLanguage();
  }

  /* ==========================================================================
     7 · GALLERY — justified rows
     ------------------------------------------------------------------------
     Photographs keep their own proportions and are never cropped, but every
     row is filled to the exact page width. That is what makes the left
     margin, the right margin and every gap identical on every row, while
     the pictures themselves stay different sizes.

     A photo marked "feature" in gallery-data.json gets a row of its own.
     ====================================================================== */
  var currentRoom = null;

  function renderGallery(roomKey) {
    var room = DATA.archive[roomKey];
    var grid = document.getElementById("gallery");
    var title = document.getElementById("gallery-title");
    var count = document.getElementById("gallery-count");
    if (!grid) return;

    if (!room) {
      if (title) title.textContent = "Not found";
      if (count) count.textContent = "";
      grid.innerHTML = '<p class="gallery-empty">That archive room does not exist.</p>';
      return;
    }

    currentRoom = roomKey;

    if (title) {
      title.textContent = room.title;
      title.dataset.en = room.title;
      title.dataset.kr = room.title_kr || room.title;
    }
    if (count) count.textContent = (room.items.length || 0) + " photographs";

    if (!room.items.length) {
      grid.innerHTML = '<p class="gallery-empty">No photographs in this room yet.</p>';
      return;
    }

    layoutGallery();
    applyLanguage();
  }

  function targetRowHeight(width) {
    if (width < 640) return 230;
    if (width < 980) return 300;
    return 360;
  }

  function layoutGallery() {
    var grid = document.getElementById("gallery");
    var room = DATA.archive[currentRoom];
    if (!grid || !room || !room.items.length) return;

    var total = grid.clientWidth;
    if (!total) return;                              // page is hidden — try later

    var gap = parseFloat(getComputedStyle(grid).rowGap) || 20;
    var target = targetRowHeight(window.innerWidth);

    // --- group the photographs into rows ---------------------------------
    var rows = [];
    var row = [];
    var ratioSum = 0;

    // A row is stretched to the page width only if it was closed because it
    // actually filled up. A row cut short — by a feature photo, or by running
    // out of photographs — keeps the normal height, otherwise a single
    // portrait would balloon to fill the whole screen.
    function flush(stretch) {
      if (!row.length) return;
      rows.push({ items: row, ratios: ratioSum, full: stretch });
      row = []; ratioSum = 0;
    }

    room.items.forEach(function (item) {
      var ratio = (item.w || 3) / (item.h || 2);

      if (item.feature) {                    // a photograph that wants its own row
        flush(false);
        rows.push({ items: [item], ratios: ratio, full: true });
        return;
      }

      row.push(item);
      ratioSum += ratio;

      if (ratioSum * target + gap * (row.length - 1) >= total) flush(true);
    });

    flush(false);

    // --- work out each row's height and each photograph's width ----------
    grid.innerHTML = rows.map(function (r) {
      var available = total - gap * (r.items.length - 1);
      var height = r.full ? available / r.ratios : target;

      var cells = r.items.map(function (item) {
        var ratio = (item.w || 3) / (item.h || 2);
        var width = height * ratio;
        var caption = item.caption
          ? '<figcaption>' + escapeHtml(item.caption) + '</figcaption>' : "";

        return '' +
          '<figure class="gallery-item" data-index="' + room.items.indexOf(item) + '" ' +
                  'style="width:' + width.toFixed(2) + 'px;height:' + height.toFixed(2) + 'px">' +
            '<img src="' + item.src + '" alt="' +
                 escapeHtml(item.caption || "Archive photograph") + '" loading="lazy">' +
            caption +
          '</figure>';
      }).join("");

      return '<div class="gallery-row">' + cells + "</div>";
    }).join("");

    grid.querySelectorAll(".gallery-item").forEach(function (fig) {
      fig.addEventListener("click", function () {
        openLightbox(Number(fig.dataset.index));
      });
    });
  }

  // redraw the rows when the window changes size, but not on every pixel
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var page = document.getElementById("page-gallery");
      if (page && !page.hidden) layoutGallery();
    }, 160);
  });

  /* ==========================================================================
     8 · LIGHTBOX
     ====================================================================== */
  var lbAt = 0;

  function openLightbox(index) {
    var box = document.getElementById("lightbox");
    if (!box) return;
    lbAt = index;
    box.hidden = false;
    document.body.style.overflow = "hidden";
    paintLightbox();
  }

  function closeLightbox() {
    var box = document.getElementById("lightbox");
    if (!box) return;
    box.hidden = true;
    document.body.style.overflow = "";
  }

  function stepLightbox(by) {
    var items = DATA.archive[currentRoom].items;
    lbAt = (lbAt + by + items.length) % items.length;
    paintLightbox();
  }

  function paintLightbox() {
    var items = DATA.archive[currentRoom].items;
    var item = items[lbAt];
    var img = document.getElementById("lb-img");
    img.src = item.src;
    img.alt = item.caption || "Archive photograph";
    document.getElementById("lb-caption").textContent =
      (item.caption ? item.caption + "   ·   " : "") + (lbAt + 1) + " / " + items.length;
  }

  function initLightbox() {
    var box = document.getElementById("lightbox");
    if (!box) return;

    document.getElementById("lb-close").addEventListener("click", closeLightbox);
    document.getElementById("lb-prev").addEventListener("click", function () { stepLightbox(-1); });
    document.getElementById("lb-next").addEventListener("click", function () { stepLightbox(1); });

    box.addEventListener("click", function (e) {
      if (e.target === box) closeLightbox();       // click the dark area to close
    });

    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    });
  }

  /* ==========================================================================
     9 · LANGUAGE SWITCH
     ------------------------------------------------------------------------
     Anything with data-en and data-kr gets swapped. The choice is remembered.
     ====================================================================== */
  var lang = "en";

  function applyLanguage() {
    document.querySelectorAll("[data-en][data-kr]").forEach(function (el) {
      var text = lang === "kr" ? el.dataset.kr : el.dataset.en;
      if (text) el.textContent = text;
    });
    document.documentElement.lang = lang === "kr" ? "ko" : "en";
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.classList.toggle("on", b.dataset.lang === lang);
    });
  }

  function initLanguage() {
    try {
      var saved = localStorage.getItem("lang");
      if (saved === "kr" || saved === "en") lang = saved;
    } catch (e) { /* ignore */ }

    document.querySelectorAll(".lang button").forEach(function (b) {
      b.addEventListener("click", function () {
        lang = b.dataset.lang;
        try { localStorage.setItem("lang", lang); } catch (e) { /* ignore */ }
        applyLanguage();
      });
    });

    applyLanguage();
  }

  /* ==========================================================================
     HELPERS
     ====================================================================== */
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* ==========================================================================
     10 · START
     ====================================================================== */
  function start() {
    initIntro();
    initSpotlight();
    initLightbox();
    initLanguage();

    loadData().then(function (data) {
      DATA = data;
      renderPortfolio();
      renderDoors();
      route();
    });

    window.addEventListener("hashchange", route);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
