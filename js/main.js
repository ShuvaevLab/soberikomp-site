/* ===================================================================
   СОБЕРИ КОМП САМ — main.js v2
   Particle canvas + theme toggle + GSAP reveals + interact.js game
   =================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  // ----- 1. Lucide icons (defensive) -----
  function refreshIcons() {
    try { if (window.lucide) lucide.createIcons(); } catch (e) {}
  }
  refreshIcons();

  // ----- 2. Theme -----
  const themeToggleBtn = document.getElementById("themeToggleWrap");
  try {
    const saved = localStorage.getItem("sks-theme");
    if (saved) document.documentElement.dataset.theme = saved;
  } catch (e) {}
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const html = document.documentElement;
      const next = html.dataset.theme === "dark" ? "light" : "dark";
      html.dataset.theme = next;
      try { localStorage.setItem("sks-theme", next); } catch (e) {}
      updateCanvasColors();
    });
  }

  // ----- 3. Burger / mobile menu -----
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", () => mobileMenu.classList.toggle("open"));
    mobileMenu.querySelectorAll(".mobile-link").forEach(l =>
      l.addEventListener("click", () => mobileMenu.classList.remove("open"))
    );
  }

  // ----- 4. Navbar scroll state -----
  const navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    });
  }

  // ----- 5. Particle Canvas Background -----
  const canvas = document.getElementById("techCanvas");
  let width, height, particles = [];
  const mouse = { x: null, y: null, radius: 150 };
  let particleColor, lineColor, activeLineColor;
  let canvasCtx;

  function updateCanvasColors() {
    const isLight = document.documentElement.dataset.theme === "light";
    particleColor = isLight ? "rgba(34,149,211,0.5)"  : "rgba(0,243,255,0.5)";
    lineColor     = isLight ? "rgba(34,149,211,0.15)" : "rgba(0,243,255,0.15)";
    activeLineColor = isLight ? "rgba(231,47,81,0.3)" : "rgba(255,0,234,0.3)";
  }

  function initCanvas() {
    if (!canvas) return;
    canvasCtx = canvas.getContext("2d");
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    const num = Math.floor((width * height) / 14000);
    for (let i = 0; i < num; i++) {
      particles.push({
        x: Math.random() * width, y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speedX: Math.random() - 0.5, speedY: Math.random() - 0.5
      });
    }
    updateCanvasColors();
  }

  function drawCanvas() {
    if (!canvasCtx) return;
    canvasCtx.clearRect(0, 0, width, height);
    canvasCtx.fillStyle = particleColor;
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      p1.x += p1.speedX; p1.y += p1.speedY;
      if (p1.x > width || p1.x < 0) p1.speedX *= -1;
      if (p1.y > height || p1.y < 0) p1.speedY *= -1;
      canvasCtx.beginPath();
      canvasCtx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
      canvasCtx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x, dy = p1.y - p2.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 110) {
          const a = Math.max(0, 0.15 - dist / 1100);
          canvasCtx.strokeStyle = lineColor.replace(/0\.\d+/, a.toFixed(3));
          canvasCtx.beginPath(); canvasCtx.moveTo(p1.x, p1.y); canvasCtx.lineTo(p2.x, p2.y); canvasCtx.stroke();
        }
      }
      if (mouse.x != null) {
        const dx = p1.x - mouse.x, dy = p1.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < mouse.radius) {
          const a = Math.max(0, 0.3 - dist / mouse.radius);
          canvasCtx.strokeStyle = activeLineColor.replace(/0\.\d+/, a.toFixed(3));
          canvasCtx.beginPath(); canvasCtx.moveTo(p1.x, p1.y); canvasCtx.lineTo(mouse.x, mouse.y); canvasCtx.stroke();
          p1.x += dx * 0.01; p1.y += dy * 0.01;
        }
      }
    }
    requestAnimationFrame(drawCanvas);
  }

  if (canvas) {
    window.addEventListener("resize", initCanvas);
    window.addEventListener("mousemove", e => { mouse.x = e.x; mouse.y = e.y; });
    window.addEventListener("mouseleave", () => { mouse.x = null; mouse.y = null; });
    initCanvas(); drawCanvas();
  }

  // ----- 6. GSAP Reveals + skill bar fills -----
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll(".bar-fill").forEach(bar => bar.style.transition = "none");
    document.querySelectorAll(".bar-fill").forEach(bar => bar.style.width = "0%");
    ScrollTrigger.create({
      trigger: ".skill-bars", start: "top 80%",
      onEnter: () => {
        const bars = gsap.utils.toArray(".bar-fill");
        bars.forEach(b => b.style.width = "0%");
        gsap.to(bars, {
          width: (i, el) => el.getAttribute("data-width"),
          duration: 1.4,
          ease: "power2.out",
          stagger: 0.6,
        });
      },
      onLeaveBack: () => {
        const bars = gsap.utils.toArray(".bar-fill");
        gsap.killTweensOf(bars);
        bars.forEach(b => b.style.width = "0%");
      },
    });
    gsap.utils.toArray(".gs-reveal").forEach(el => {
      gsap.fromTo(el,
        { y: 50, autoAlpha: 0 },
        { duration: 1.1, y: 0, autoAlpha: 1, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" } }
      );
    });
  }

  // ===================================================================
  // 7. ASSEMBLY ANIMATION — GSAP auto-play loop on scroll
  // ===================================================================
  const assemblyStage = document.getElementById("assemblyStage");
  if (assemblyStage && window.gsap) {
    const partIds = ["anim-cpu", "anim-cooler", "anim-ram", "anim-gpu"];
    const stepIds = ["asm-step-cpu", "asm-step-cooler", "asm-step-ram", "asm-step-gpu", "asm-step-boot"];
    const bootEl  = document.getElementById("assemblyBoot");
    const offsets = { "anim-cpu":-280, "anim-cooler":0, "anim-ram":300, "anim-gpu":0 };
    const offsetY = { "anim-cpu":0, "anim-cooler":-280, "anim-ram":0, "anim-gpu":300 };

    function resetAssembly() {
      partIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) gsap.set(el, { opacity:0, x: offsets[id], y: offsetY[id] });
      });
      if (bootEl) gsap.set(bootEl, { opacity:0, scale:1 });
      stepIds.forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove("is-active"); });
    }

    function buildAssemblyTl() {
      const tl = gsap.timeline({ paused:true });
      const snap = { duration:0.55, ease:"back.out(1.8)" };
      const flash = { scale:1.12, duration:0.12, yoyo:true, repeat:1, ease:"power2.out" };

      partIds.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        tl.to(el, { opacity:1, x:0, y:0, ...snap }, i === 0 ? 0 : "+=0.35");
        tl.to(el, flash, "<0.45");
        tl.call(() => { const s = document.getElementById(stepIds[i]); if (s) s.classList.add("is-active"); });
      });

      tl.to(bootEl, { opacity:1, scale:1.15, duration:0.2, ease:"power3.out" }, "+=0.5");
      tl.to(bootEl, { scale:1, duration:0.3 });
      tl.call(() => { const s = document.getElementById("asm-step-boot"); if (s) s.classList.add("is-active"); });
      tl.to(bootEl, { opacity:0, duration:0.5, delay:2 });
      tl.call(() => { setTimeout(() => { resetAssembly(); tl.restart(); }, 800); });
      return tl;
    }

    resetAssembly();
    const assemblyTl = buildAssemblyTl();
    let assemblyStarted = false;

    ScrollTrigger.create({
      trigger: assemblyStage, start:"top 85%", end:"bottom 5%",
      onEnter() { if (!assemblyStarted) { assemblyStarted = true; assemblyTl.play(); } else { assemblyTl.play(); } },
      onLeave() { assemblyTl.pause(); },
      onEnterBack() { assemblyTl.play(); },
      onLeaveBack() { assemblyTl.pause(); },
    });
  }

  // ===================================================================
  // 8. GAME — point-in-polygon hit-test on operator-traced zones.json
  //          (zones.json is the single source of truth for hit geometry,
  //           hand-traced via the HTML annotator — see SOBERI_KOMPSAM_SITE_README §0c)
  // ===================================================================

  const gameStage  = document.getElementById("gameStage");
  const gameBoard  = document.getElementById("gameBoard");
  const overlaySvg = document.getElementById("gameBoardOverlay");
  const boardImg   = gameBoard ? gameBoard.querySelector(".game-board-photo") : null;
  const startBtn   = document.getElementById("gameStart");
  const resetBtn   = document.getElementById("gameReset");
  const statusEl   = document.getElementById("gameStatus");
  const successEl  = document.getElementById("gameSuccess");
  const partsBin   = document.getElementById("gameParts");

  if (!gameStage || !gameBoard || !overlaySvg || !boardImg || !window.interact) return;

  const installed = { cpu:false, cooler:false, ram:false, gpu:false, psu:false };

  // Visual placement size per part (% of board) — polygons are for hit-testing,
  // size is hand-tuned so each component reads as the right thing on placement.
  const PLACEMENT_PCT = {
    cpu:    { w: 22, h: 21 },
    cooler: { w: 32, h: 28 },
    ram:    { w: 17, h: 56 },
    gpu:    { w: 60, h: 18 },
    psu:    { w: 14, h: 22 },
  };
  let zonesData = null;
  const zoneNodes = {};

  function setStatus(msg, type = "neutral") {
    if (!statusEl) return;
    statusEl.classList.remove("is-error", "is-ok");
    if (type === "error") statusEl.classList.add("is-error");
    if (type === "ok") statusEl.classList.add("is-ok");
    statusEl.innerHTML = msg;
  }

  function applyBoardGeometry(zd) {
    gameBoard.style.aspectRatio = `${zd.image_width_px} / ${zd.image_height_px}`;
    overlaySvg.setAttribute("viewBox", `0 0 ${zd.image_width_px} ${zd.image_height_px}`);
  }

  function polyCentroid(points) {
    let sx = 0, sy = 0, n = 0;
    for (const [x, y] of points) { sx += x; sy += y; n++; }
    return [sx / n, sy / n];
  }

  function pointInPolygon(p, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const intersect = ((yi > p[1]) !== (yj > p[1])) &&
        (p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function renderZones(zd) {
    const SVGNS = "http://www.w3.org/2000/svg";
    while (overlaySvg.firstChild) overlaySvg.removeChild(overlaySvg.firstChild);
    for (const zone of zd.zones) {
      const accept = zone.accepts[0];
      const points = zone.polygon.map(p => p.join(",")).join(" ");
      const poly = document.createElementNS(SVGNS, "polygon");
      poly.setAttribute("points", points);
      poly.setAttribute("class", "game-zone");
      poly.setAttribute("data-zone-id", zone.id);
      poly.setAttribute("data-accept", accept);
      if (zone.id === "cpu_cooler") poly.classList.add("is-hidden");
      overlaySvg.appendChild(poly);
      zoneNodes[zone.id] = { polygon: poly };
    }
  }

  function showCoolerZone() {
    const n = zoneNodes.cpu_cooler;
    if (!n) return;
    n.polygon.classList.remove("is-hidden");
  }

  function clientToImageCoords(clientX, clientY) {
    const rect = boardImg.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;
    const ix = (clientX - rect.left) / rect.width  * zonesData.image_width_px;
    const iy = (clientY - rect.top)  / rect.height * zonesData.image_height_px;
    return [ix, iy];
  }

  function findHitZone(partType, imgPt) {
    for (const z of zonesData.zones) {
      if (!z.accepts.includes(partType)) continue;
      if (z.id === "cpu_cooler" && !installed.cpu) continue;
      if (pointInPolygon(imgPt, z.polygon)) return z;
    }
    return null;
  }

  // Swap sidebar image → slotted variant when part is dropped (if data-img-slotted set)
  function applySlottedImage(partEl) {
    const slotted = partEl.dataset.imgSlotted;
    if (!slotted) return;
    const img = partEl.querySelector("img");
    if (!img) return;
    if (!partEl.dataset.imgSidebarSnapshot) {
      partEl.dataset.imgSidebarSnapshot = img.getAttribute("src");
    }
    img.setAttribute("src", slotted);
  }

  function restoreSidebarImage(partEl) {
    const snap = partEl.dataset.imgSidebarSnapshot;
    if (!snap) return;
    const img = partEl.querySelector("img");
    if (img) img.setAttribute("src", snap);
    delete partEl.dataset.imgSidebarSnapshot;
  }

  function placePart(partEl, zone) {
    const partType = partEl.dataset.part;
    const size = PLACEMENT_PCT[partType] || { w: 18, h: 18 };
    const [cx, cy] = polyCentroid(zone.polygon);
    const cxPct = (cx / zonesData.image_width_px) * 100;
    const cyPct = (cy / zonesData.image_height_px) * 100;
    let leftPct = cxPct - size.w / 2;
    let topPct  = cyPct - size.h / 2;
    leftPct = Math.max(0, Math.min(100 - size.w, leftPct));
    topPct  = Math.max(0, Math.min(100 - size.h, topPct));

    partEl.style.position = "absolute";
    partEl.style.left   = `${leftPct}%`;
    partEl.style.top    = `${topPct}%`;
    partEl.style.width  = `${size.w}%`;
    partEl.style.height = `${size.h}%`;
    partEl.style.transform = "none";
    partEl.dataset.dx = 0;
    partEl.dataset.dy = 0;
    partEl.dataset.placedIn = zone.id;
    applySlottedImage(partEl);
    gameBoard.appendChild(partEl);

    const node = zoneNodes[zone.id];
    if (node) {
      node.polygon.classList.add("is-filled");
      node.polygon.classList.remove("is-target");
    }
    installed[partType] = true;

    if (partType === "cpu") {
      showCoolerZone();
      setStatus(`> <span class="game-status-cursor">_</span> CPU установлен. <span style="color:var(--neon-cyan)">Добавьте кулер</span> — система охлаждения критична!`);
    } else {
      const left = ["cpu","cooler","ram","gpu","psu"].filter(k => !installed[k]);
      if (left.length === 0) {
        setStatus(`> <span class="game-status-cursor">_</span> Все компоненты установлены. <span style="color:var(--neon-green)">Нажмите «Запуск»</span>`);
      } else {
        const names = { cpu:"CPU", cooler:"кулер", ram:"память", gpu:"видеокарту", psu:"питание" };
        setStatus(`> <span class="game-status-cursor">_</span> ${partEl.dataset.name} установлен. Осталось: ${left.map(k => names[k]).join(", ")}`);
      }
    }
    if (resetBtn) resetBtn.style.display = "inline-flex";
    playBeep(900, 80);
  }

  function snapBack(partEl) {
    partEl.style.transition = "transform .35s cubic-bezier(.4,1.3,.5,1)";
    partEl.style.transform  = "translate(0, 0)";
    partEl.dataset.dx = 0;
    partEl.dataset.dy = 0;
    setTimeout(() => partEl.style.transition = "", 360);
  }

  function highlightTargetUnderPointer(partType, clientX, clientY) {
    Object.values(zoneNodes).forEach(n => n.polygon.classList.remove("is-target"));
    const pt = clientToImageCoords(clientX, clientY);
    if (!pt) return;
    const z = findHitZone(partType, pt);
    if (z && zoneNodes[z.id]) zoneNodes[z.id].polygon.classList.add("is-target");
  }

  function clearTargetHighlights() {
    Object.values(zoneNodes).forEach(n => n.polygon.classList.remove("is-target"));
  }

  // -------- Drag wiring (interact.js draggable on parts; hit-test in end()) --------
  interact(".game-part").draggable({
    inertia: false,
    autoScroll: true,
    listeners: {
      start(event) {
        if (event.target.dataset.placedIn) { event.interaction.stop(); return; }
        event.target.classList.add("is-dragging");
      },
      move(event) {
        const t = event.target;
        const x = (parseFloat(t.dataset.dx) || 0) + event.dx;
        const y = (parseFloat(t.dataset.dy) || 0) + event.dy;
        t.style.transform = `translate(${x}px, ${y}px)`;
        t.dataset.dx = x; t.dataset.dy = y;
        highlightTargetUnderPointer(t.dataset.part, event.clientX, event.clientY);
      },
      end(event) {
        const t = event.target;
        t.classList.remove("is-dragging");
        clearTargetHighlights();
        if (!zonesData) { snapBack(t); return; }
        const pt = clientToImageCoords(event.clientX, event.clientY);
        if (pt) {
          const z = findHitZone(t.dataset.part, pt);
          if (z) { placePart(t, z); return; }
        }
        playBeep(180, 200);
        snapBack(t);
      }
    }
  });

  // -------- POST start --------
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const errors = [];
      if (!installed.cpu)    errors.push("Установите процессор (CPU)");
      if (!installed.ram)    errors.push("Добавьте оперативную память (RAM)");
      if (installed.cpu && !installed.cooler) errors.push("Кулер обязателен — установите систему охлаждения CPU");
      if (!installed.psu)    errors.push("Подключите питание (24-pin ATX)");

      if (errors.length > 0) {
        setStatus(`> <span style="color:#ff4d6d">❌ Ошибка POST:</span><br>> ${errors.join("<br>> ")}`, "error");
        playPostFail();
        if (successEl) successEl.hidden = true;
        return;
      }

      const beepMsg = installed.gpu
        ? "Система стабильна. POST пройден. Запуск ОС..."
        : "POST пройден (встроенная графика). Запуск ОС...";
      setStatus(`> <span style="color:var(--neon-green)">✓ ${beepMsg}</span>`, "ok");
      playPostOk();
      if (successEl) {
        successEl.hidden = false;
        setTimeout(() => successEl.scrollIntoView({ behavior: "smooth", block: "center" }), 350);
      }
    });
  }

  // -------- Reset --------
  // Snapshot original sidebar order ONCE so reset always restores to the
  // intended layout (cpu → cooler → ram → gpu → psu), independent of which
  // parts were actually placed and in what order.
  const ORIGINAL_PART_ORDER = ["cpu", "cooler", "ram", "gpu", "psu"];
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      Object.keys(installed).forEach(k => installed[k] = false);
      ORIGINAL_PART_ORDER.forEach(partType => {
        const p = document.querySelector(`.game-part[data-part="${partType}"]`);
        if (!p) return;
        restoreSidebarImage(p);
        // Wipe ALL inline styles set during drag/place (position, size, transform).
        // setAttribute("style","") is more reliable than per-property style.x = "".
        p.setAttribute("style", "");
        p.dataset.dx = 0;
        p.dataset.dy = 0;
        delete p.dataset.placedIn;
        // Re-append into sidebar in canonical order.
        partsBin.appendChild(p);
      });
      Object.values(zoneNodes).forEach(n => {
        n.polygon.classList.remove("is-filled", "is-target");
      });
      const cooler = zoneNodes.cpu_cooler;
      if (cooler) {
        cooler.polygon.classList.add("is-hidden");
      }
      setStatus(`> <span class="game-status-cursor">_</span> Ожидание компонентов...`);
      if (successEl) successEl.hidden = true;
      resetBtn.style.display = "none";
      refreshIcons();
    });
  }

  // -------- Auto-disassemble when game scrolls out of viewport --------
  // The visitor builds the PC, hits POST, watches the success video, then
  // continues scrolling. When they scroll back to the game we want the
  // board fresh again so they (or another viewer) can replay it without
  // hunting for the «Разобрать» button. Triggers only when something
  // actually got placed (or success was shown) — empty board stays empty.
  const gameSectionEl = document.getElementById("game");
  if (gameSectionEl && resetBtn) {
    const autoResetObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) return;
        const anyPlaced = Object.values(installed).some(v => v);
        const successVisible = successEl && !successEl.hidden;
        if (anyPlaced || successVisible) resetBtn.click();
      });
    }, { threshold: 0, rootMargin: "0px" });
    autoResetObserver.observe(gameSectionEl);
  }

  // -------- Audio (Web Audio API beeps, AMI POST style) --------
  let audioCtx;
  function getAudioCtx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    return audioCtx;
  }
  function playBeep(freq, durMs, volume = 0.18) {
    const ctx = getAudioCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "square"; osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + durMs / 1000);
    osc.start(t); osc.stop(t + durMs / 1000);
  }
  function playPostOk()   { playBeep(880, 220, 0.22); }
  function playPostFail() { [0, 280, 560].forEach(off => setTimeout(() => playBeep(440, 160, 0.22), off)); }

  // -------- Bootstrap: prefer inline zones-data (works under file://),
  //          fall back to fetch(assets/ai/zones.json) when served via http(s) --------
  function applyZones(zd) {
    zonesData = zd;
    applyBoardGeometry(zd);
    renderZones(zd);
  }
  function loadInlineZones() {
    const inlineEl = document.getElementById("zones-data");
    if (!inlineEl) return null;
    try {
      const zd = JSON.parse(inlineEl.textContent);
      if (zd && Array.isArray(zd.zones) && zd.zones.length) return zd;
    } catch (e) {
      console.warn("Inline zones-data parse failed:", e);
    }
    return null;
  }

  const inlineZd = loadInlineZones();
  if (inlineZd) {
    applyZones(inlineZd);
  } else {
    const zonesUrl = gameBoard.dataset.zones || "assets/ai/zones.json";
    fetch(`${zonesUrl}?v=20260506a`, { cache: "no-cache" })
      .then(r => { if (!r.ok) throw new Error(`zones.json HTTP ${r.status}`); return r.json(); })
      .then(applyZones)
      .catch(err => {
        console.error("Game zones load failed:", err);
        setStatus(`> <span style="color:#ff4d6d">⚠ Не удалось загрузить разметку платы. Перезагрузите страницу.</span>`, "error");
      });
  }

  (function lazyLoadVideos() {
    const videos = document.querySelectorAll("video");
    if (!videos.length) return;
    const swap = (v) => {
      const sources = v.querySelectorAll("source[data-src]");
      if (!sources.length) return;
      sources.forEach((s) => {
        s.src = s.dataset.src;
        s.removeAttribute("data-src");
      });
      try { v.load(); } catch (e) {}
    };
    if (!("IntersectionObserver" in window)) {
      videos.forEach(swap);
      return;
    }
    const obs = new IntersectionObserver((entries, self) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        swap(entry.target);
        self.unobserve(entry.target);
      });
    }, { rootMargin: "200px 0px", threshold: 0 });
    videos.forEach((v) => obs.observe(v));
  })();

  refreshIcons();
});
