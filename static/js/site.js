(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clips = Array.from(document.querySelectorAll("video[data-autoplay]"));

  const play = (v) => {
    if (v.closest("[hidden]")) return;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  };

  if (reduceMotion) {
    clips.forEach((v) => { v.controls = true; });
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) play(target);
        else target.pause();
      });
    }, { rootMargin: "120px 0px", threshold: 0.15 });
    clips.forEach((v) => io.observe(v));
  } else {
    clips.forEach(play);
  }

  // Lightbox for figures (.zoom) and videos (.frame).
  const viewer = document.getElementById("viewer");
  const body = document.getElementById("viewer-body");
  const title = document.getElementById("viewer-title");

  const open = (src, label) => {
    body.replaceChildren();
    let el;
    if (/\.(mp4|webm)$/i.test(src)) {
      el = document.createElement("video");
      Object.assign(el, { src, controls: true, autoplay: true, loop: true, muted: true, playsInline: true });
    } else {
      el = document.createElement("img");
      Object.assign(el, { src, alt: label || "" });
    }
    body.appendChild(el);
    title.textContent = label || "";
    viewer.showModal();
  };

  document.querySelectorAll(".frame, .zoom").forEach((btn) => {
    btn.addEventListener("click", () => open(btn.dataset.full, btn.dataset.title));
  });

  viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); });
  viewer.addEventListener("close", () => body.replaceChildren());

  // BibTeX copy.
  document.querySelectorAll(".copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = document.querySelector(btn.dataset.copy).innerText;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied";
      } catch {
        btn.textContent = "Select & copy";
      }
      setTimeout(() => { btn.textContent = "Copy"; }, 1600);
    });
  });

  if ("IntersectionObserver" in window) {
    // Animate the bar charts the first time they scroll into view.
    const charts = document.querySelector(".charts");
    if (charts) {
      const once = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          charts.classList.add("animate");
          once.disconnect();
        }
      }, { threshold: 0.3 });
      once.observe(charts);
    }

    // Highlight the nav link of the section in view.
    const links = new Map(
      Array.from(document.querySelectorAll(".topbar nav a")).map((a) => [a.getAttribute("href").slice(1), a])
    );
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        links.forEach((a, id) => a.classList.toggle("active", id === target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((_, id) => {
      const s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }
})();
