const slides = Array.from(document.querySelectorAll(".slide"));
const slideWrap = document.getElementById("slides");
const currentPage = document.getElementById("currentPage");
const progressBar = document.getElementById("progressBar");
const phoneShell = document.querySelector(".phone-shell");
const sparkLayer = document.getElementById("sparkLayer");
const total = slides.length;
let activeIndexState = 0;

const formatPage = (index) => String(index + 1).padStart(2, "0");

function prepareRevealText() {
  document.querySelectorAll(".slide h1, .slide h2").forEach((heading) => {
    if (heading.dataset.revealed === "true") return;
    const text = heading.textContent.trim();
    heading.dataset.revealed = "true";
    heading.classList.add("reveal-text");
    heading.setAttribute("aria-label", text);
    heading.textContent = "";
    Array.from(text).forEach((char, index) => {
      const span = document.createElement("span");
      span.className = "char";
      span.style.setProperty("--char-index", index);
      span.setAttribute("aria-hidden", "true");
      span.innerHTML = char === " " ? "&nbsp;" : char;
      heading.appendChild(span);
    });
  });
}

function createPageDots() {
  const dotWrap = document.createElement("div");
  dotWrap.className = "page-dots";
  dotWrap.setAttribute("aria-hidden", "true");
  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "page-dot";
    dot.type = "button";
    dot.addEventListener("click", () => slides[index].scrollIntoView({ behavior: "smooth" }));
    dotWrap.appendChild(dot);
  });
  phoneShell.appendChild(dotWrap);
}

function setActive(index) {
  activeIndexState = index;
  slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
  currentPage.textContent = formatPage(index);
  progressBar.style.width = `${((index + 1) / total) * 100}%`;
  document.querySelectorAll(".page-dot").forEach((dot, i) => {
    dot.classList.toggle("is-active", i === index);
  });
}

function animateCount(el) {
  if (el.dataset.done === "true") return;
  const target = Number(el.dataset.count || 0);
  const duration = target > 2000 ? 1200 : 900;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased).toLocaleString("zh-CN");
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.dataset.done = "true";
    }
  }

  requestAnimationFrame(tick);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const index = slides.indexOf(entry.target);
      setActive(index);
      entry.target.querySelectorAll("[data-count]").forEach(animateCount);
    });
  },
  { root: slideWrap, threshold: 0.62 }
);

slides.forEach((slide) => observer.observe(slide));
prepareRevealText();
createPageDots();
setActive(0);

function createSparks(event, amount = 12) {
  if (!sparkLayer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rect = sparkLayer.getBoundingClientRect();
  const originX = event?.clientX ?? rect.left + rect.width / 2;
  const originY = event?.clientY ?? rect.top + rect.height / 2;
  const colors = ["#12d6c2", "#246fe5", "#ff5f7a", "#ffd86b"];

  for (let i = 0; i < amount; i += 1) {
    const spark = document.createElement("span");
    const angle = (Math.PI * 2 * i) / amount + Math.random() * 0.5;
    const distance = 34 + Math.random() * 44;
    spark.className = "spark";
    spark.style.left = `${originX - rect.left}px`;
    spark.style.top = `${originY - rect.top}px`;
    spark.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    spark.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    spark.style.setProperty("--spark-color", colors[i % colors.length]);
    sparkLayer.appendChild(spark);
    spark.addEventListener("animationend", () => spark.remove(), { once: true });
  }
}

document.querySelectorAll("[data-next]").forEach((button) => {
  button.addEventListener("click", () => {
    const activeIndex = slides.findIndex((slide) => slide.classList.contains("active"));
    const next = slides[Math.min(activeIndex + 1, slides.length - 1)];
    next.scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll(".flip-card").forEach((card) => {
  card.addEventListener("click", (event) => {
    document.querySelectorAll(".flip-card").forEach((item) => {
      if (item !== card) item.classList.remove("is-open");
    });
    card.classList.toggle("is-open");
    createSparks(event, 10);
  });
});

const choiceList = document.getElementById("choiceList");
const choiceResult = document.getElementById("choiceResult");

choiceList?.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  choiceList.querySelectorAll("button").forEach((item) => item.classList.remove("is-selected"));
  button.classList.add("is-selected");
  choiceResult.textContent = button.dataset.message;
  createSparks(event, 14);
  choiceResult.animate(
    [
      { transform: "translateY(8px)", opacity: 0.4 },
      { transform: "translateY(0)", opacity: 1 }
    ],
    { duration: 240, easing: "ease-out" }
  );
});

const skillWheel = document.querySelector(".skill-wheel");
const skillResult = document.getElementById("skillResult");

skillWheel?.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  skillWheel.querySelectorAll("button").forEach((item) => item.classList.remove("is-selected"));
  button.classList.add("is-selected");
  skillResult.textContent = button.dataset.tip || "把技能整理成作品和复盘，会比一句熟练掌握更有说服力。";
  createSparks(event, 12);
  skillResult.animate(
    [
      { transform: "translateY(8px)", opacity: 0.4 },
      { transform: "translateY(0)", opacity: 1 }
    ],
    { duration: 260, easing: "ease-out" }
  );
});

const checklist = document.getElementById("checklist");
const checkResult = document.getElementById("checkResult");
const checkMeter = document.getElementById("checkMeter");
const checkMeterValue = document.getElementById("checkMeterValue");

function updateChecklist() {
  if (!checklist) return;
  const inputs = Array.from(checklist.querySelectorAll("input"));
  const done = inputs.filter((input) => input.checked).length;
  const percent = Math.round((done / inputs.length) * 100);
  checkResult.textContent = `已完成 ${done}/${inputs.length} 项`;
  checkResult.classList.toggle("is-complete", done === inputs.length);
  checkMeter?.style.setProperty("--progress", `${percent}%`);
  if (checkMeterValue) checkMeterValue.textContent = `${percent}%`;
  if (done === inputs.length) {
    checkResult.textContent = "准备清单已点亮：可以开始整理作品集了";
  }
}

checklist?.addEventListener("change", (event) => {
  updateChecklist();
  createSparks(event, event.target.checked ? 16 : 6);
});

document.getElementById("restartBtn")?.addEventListener("click", (event) => {
  createSparks(event, 18);
  slides[0].scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("keydown", (event) => {
  const activeIndex = slides.findIndex((slide) => slide.classList.contains("active"));
  if (event.key === "ArrowDown" || event.key === "PageDown") {
    event.preventDefault();
    slides[Math.min(activeIndex + 1, total - 1)].scrollIntoView({ behavior: "smooth" });
  }
  if (event.key === "ArrowUp" || event.key === "PageUp") {
    event.preventDefault();
    slides[Math.max(activeIndex - 1, 0)].scrollIntoView({ behavior: "smooth" });
  }
});

function setupAmbientCanvas() {
  const canvas = document.getElementById("ambientCanvas");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  const pointCount = 32;
  const points = [];
  let width = 0;
  let height = 0;
  let rafId = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    points.length = 0;
    for (let i = 0; i < pointCount; i += 1) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1 + Math.random() * 1.8,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const hueShift = activeIndexState % 3;
    const lineColor = hueShift === 0 ? "18, 214, 194" : hueShift === 1 ? "36, 111, 229" : "255, 95, 122";
    points.forEach((point, index) => {
      point.x += point.vx;
      point.y += point.vy;
      if (point.x < 0 || point.x > width) point.vx *= -1;
      if (point.y < 0 || point.y > height) point.vy *= -1;

      for (let j = index + 1; j < points.length; j += 1) {
        const other = points[j];
        const dx = point.x - other.x;
        const dy = point.y - other.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 92) {
          ctx.strokeStyle = `rgba(${lineColor}, ${0.16 * (1 - distance / 92)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = `rgba(${lineColor}, 0.42)`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      ctx.fill();
    });
    rafId = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      draw();
    }
  });
}

setupAmbientCanvas();
