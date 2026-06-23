const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");
let W, H, rafId = null, t = 0;

function isDark() {
  return document.documentElement.dataset.theme === "dark";
}
function palette() {
  return isDark()
    ? {
        washes: ["#3a5560","#3d5347","#5a4a36","#5c4030","#5a3f3c"],
        leaves: ["#6f8f6a","#88a07a","#a89464"],
        petals: ["#caa089","#b08aa0","#d9c081"],
        pollen: "rgba(236,227,211,",
      }
    : {
        washes: ["#6f93a6","#94ab8a","#d9c3a3","#c47e5e","#d99a92"],
        leaves: ["#94ab8a","#aac09a","#7f9a72"],
        petals: ["#e7b9a4","#d99a92","#e6cf9a"],
        pollen: "rgba(120,100,70,",
      };
}

function rand(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(rand(a, b)); }

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

let washes;
function initWashes() {
  washes = Array.from({ length: 6 }, (_, i) => ({
    x: rand(0, W), y: rand(0, H),
    r: Math.min(W, H) * rand(0.22, 0.42),
    dx: rand(-0.12, 0.12), dy: rand(-0.1, 0.1),
    ph: rand(0, Math.PI * 2), ci: i % 5,
  }));
}
function drawWashes(p) {
  ctx.save();
  ctx.filter = "blur(70px)";
  ctx.globalCompositeOperation = isDark() ? "lighter" : "multiply";
  washes.forEach((b) => {
    const pulse = 1 + Math.sin(t * 0.4 + b.ph) * 0.08;
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * pulse);
    const c = p.washes[b.ci];
    g.addColorStop(0, c + (isDark() ? "55" : "44"));
    g.addColorStop(1, c + "00");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * pulse, 0, Math.PI * 2);
    ctx.fill();
    b.x += b.dx; b.y += b.dy;
    if (b.x < -b.r) b.x = W + b.r; if (b.x > W + b.r) b.x = -b.r;
    if (b.y < -b.r) b.y = H + b.r; if (b.y > H + b.r) b.y = -b.r;
  });
  ctx.restore();
}

let flora;
function initFlora() {
  flora = Array.from({ length: 16 }, () => {
    const leaf = Math.random() > 0.45;
    return {
      x: rand(0, W), y: rand(-H * 0.2, H),
      size: rand(9, 20),
      vy: rand(0.18, 0.5),
      vx: rand(-0.25, 0.25),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.01, 0.01),
      sway: rand(0, Math.PI * 2),
      dsway: rand(0.008, 0.018),
      leaf,
      ci: leaf ? randInt(0, 3) : randInt(0, 3),
    };
  });
}
function drawLeaf(f, p) {
  ctx.save();
  ctx.translate(f.x + Math.sin(f.sway) * 16, f.y);
  ctx.rotate(f.rot + Math.sin(f.sway) * 0.3);
  ctx.globalAlpha = isDark() ? 0.5 : 0.62;
  if (f.leaf) {
    ctx.fillStyle = p.leaves[f.ci];
    ctx.beginPath();
    ctx.moveTo(0, -f.size);
    ctx.quadraticCurveTo(f.size * 0.7, 0, 0, f.size);
    ctx.quadraticCurveTo(-f.size * 0.7, 0, 0, -f.size);
    ctx.fill();
    ctx.strokeStyle = isDark() ? "rgba(0,0,0,0.25)" : "rgba(90,110,80,0.4)";
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, -f.size); ctx.lineTo(0, f.size); ctx.stroke();
  } else {
    ctx.fillStyle = p.petals[f.ci];
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 / 5) * i);
      ctx.beginPath();
      ctx.ellipse(0, -f.size * 0.55, f.size * 0.34, f.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = isDark() ? "#d9b873" : "#e6c060";
    ctx.beginPath(); ctx.arc(0, 0, f.size * 0.26, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function updateFlora(p) {
  flora.forEach((f) => {
    f.y += f.vy; f.x += f.vx; f.rot += f.vr; f.sway += f.dsway;
    if (f.y > H + 30) { f.y = -30; f.x = rand(0, W); }
    if (f.x < -40) f.x = W + 40; if (f.x > W + 40) f.x = -40;
    drawLeaf(f, p);
  });
}

let pollen;
function initPollen() {
  pollen = Array.from({ length: 38 }, () => ({
    x: rand(0, W), y: rand(0, H),
    r: rand(0.8, 2.4),
    dx: rand(-0.18, 0.18), dy: rand(-0.16, 0.16),
    pulse: rand(0, Math.PI * 2), dp: rand(0.01, 0.02),
  }));
}
function drawPollen(p) {
  pollen.forEach((d) => {
    d.pulse += d.dp;
    const a = (0.25 + Math.abs(Math.sin(d.pulse)) * 0.4) * (isDark() ? 0.5 : 1);
    ctx.fillStyle = p.pollen + a + ")";
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
    d.x += d.dx; d.y += d.dy;
    if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
    if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
  });
}

function init() { resize(); initWashes(); initFlora(); initPollen(); }
function draw() {
  ctx.clearRect(0, 0, W, H);
  const p = palette();
  drawWashes(p);
  drawPollen(p);
  updateFlora(p);
  t += 0.016;
  rafId = requestAnimationFrame(draw);
}
export function pauseCanvas() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }
export function resumeCanvas() { if (!rafId) draw(); }

document.addEventListener("visibilitychange", () => document.hidden ? pauseCanvas() : resumeCanvas());
window.addEventListener("resize", init);
init();
draw();
