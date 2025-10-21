/* Futuristic Control Grid — optimized ribbon / trace / interactivity
   - Canvas for blueprint grid + animated traces
   - Mouse parallax tilt for nodes
   - Intersection observer to reveal nodes
   - Lightweight, no external libs
*/

(() => {
  // elements
  const section = document.getElementById('control-grid');
  const blueprintCanvas = document.getElementById('blueprintCanvas');
  const traceCanvas = document.getElementById('traceCanvas');
  const nodes = Array.from(document.querySelectorAll('.node'));

  // size canvases to section
  function sizeCanvases() {
    const rect = section.getBoundingClientRect();
    const w = Math.max(600, Math.round(rect.width));
    const h = Math.max(400, Math.round(rect.height));
    [blueprintCanvas, traceCanvas].forEach(c => {
      c.width = w; c.height = h;
      c.style.width = w + 'px'; c.style.height = h + 'px';
    });
  }
  window.addEventListener('resize', sizeCanvases);
  sizeCanvases();

  const bc = blueprintCanvas.getContext('2d', { alpha: true });
  const tc = traceCanvas.getContext('2d', { alpha: true });

  // Draw subtle blueprint grid (static-ish, slightly animated)
  function drawBlueprint(t) {
    const w = blueprintCanvas.width, h = blueprintCanvas.height;
    bc.clearRect(0,0,w,h);

    // big faint horizontal lines
    bc.save();
    bc.strokeStyle = 'rgba(0, 110, 255, 0.03)';
    bc.lineWidth = 1;
    const spacing = Math.max(48, Math.round(w/24));
    for (let y=spacing/2; y<h; y+=spacing) {
      bc.beginPath();
      bc.moveTo(0, y + Math.sin((t*0.0002)+(y*0.001))*6);
      bc.lineTo(w, y + Math.sin((t*0.0002)+(y*0.001))*6);
      bc.stroke();
    }
    bc.restore();

    // diagonal faint stripe
    bc.save();
    bc.globalAlpha = 0.035;
    bc.fillStyle = 'rgba(0,209,255,0.04)';
    for (let i = -w; i < w; i += 120) {
      bc.fillRect(i + (t*0.02%w), 0, 2, h);
    }
    bc.restore();
  }

  // trace lines that flow between nodes (animated)
  const traces = [];
  function buildTraces() {
    // compute node centers relative to section
    const sectRect = section.getBoundingClientRect();
    traces.length = 0;
    nodes.forEach((n, i) => {
      const r = n.getBoundingClientRect();
      const cx = (r.left - sectRect.left) + r.width/2;
      const cy = (r.top - sectRect.top) + r.height/2;
      traces.push({ x: cx, y: cy, i });
    });
  }
  buildTraces();
  window.addEventListener('resize', buildTraces);

  function drawTraces(t) {
    const w = traceCanvas.width, h = traceCanvas.height;
    tc.clearRect(0,0,w,h);

    // animated bezier connections
    tc.save();
    tc.globalCompositeOperation = 'lighter';
    for (let i = 0; i < traces.length; i++) {
      const a = traces[i];
      const b = traces[(i+1) % traces.length];
      const mx = (a.x + b.x) / 2 + Math.sin((t*0.0007) + i) * 24;
      const my = (a.y + b.y) / 2 + Math.cos((t*0.0009) + i) * 18;

      const grad = tc.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0, 'rgba(0,209,255,0.09)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.035)');
      grad.addColorStop(1, 'rgba(255,255,255,0.015)');

      tc.strokeStyle = grad;
      tc.lineWidth = 1.6;
      tc.beginPath();
      tc.moveTo(a.x, a.y);
      tc.quadraticCurveTo(mx, my, b.x, b.y);
      tc.stroke();

      // moving highlight
      const pos = (Math.sin((t*0.002) + i) + 1) / 2;
      const px = a.x + (b.x - a.x) * pos;
      const py = a.y + (b.y - a.y) * pos;
      tc.beginPath();
      tc.fillStyle = 'rgba(0,209,255,0.09)';
      tc.arc(px, py, 6, 0, Math.PI*2);
      tc.fill();
    }
    tc.restore();
  }

  // particles lightly drifting
  const particles = [];
  function initParticles() {
    particles.length = 0;
    const w = traceCanvas.width, h = traceCanvas.height;
    const count = Math.max(20, Math.round((w*h)/90000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: 0.6 + Math.random()*1.8,
        vx: (Math.random()-0.5)*0.2,
        vy: (Math.random()*0.2)-0.05,
        a: 0.04 + Math.random()*0.25
      });
    }
  }
  initParticles();

  function drawParticles() {
    const w = traceCanvas.width, h = traceCanvas.height;
    tc.save();
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -30) p.y = h + 20;
      tc.beginPath();
      tc.fillStyle = `rgba(0,209,255,${p.a})`;
      tc.arc(p.x, p.y, p.r, 0, Math.PI*2);
      tc.fill();
    }
    tc.restore();
  }

  // animation loop
  let start = performance.now();
  function frame(t) {
    drawBlueprint(t);
    drawTraces(t);
    drawParticles(t);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // rebuild traces & particles after initial layout stable
  setTimeout(() => { buildTraces(); initParticles(); }, 400);

  // INTERACTION: node tilt on mouse move & hover
  let hoverNode = null;
  nodes.forEach((node) => {
    node.addEventListener('mouseenter', () => {
      node.classList.add('hovered');
      hoverNode = node;
    });
    node.addEventListener('mouseleave', () => {
      node.classList.remove('hovered');
      node.style.transform = '';
      hoverNode = null;
    });
  });

  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const mx = (e.clientX - cx) / rect.width;
    const my = (e.clientY - cy) / rect.height;

    // tilt any hovered node slightly towards cursor
    if (hoverNode) {
      const r = hoverNode.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) - 0.5;
      const ny = ((e.clientY - r.top) / r.height) - 0.5;
      const tiltX = Math.max(-12, Math.min(12, -ny*14));
      const tiltY = Math.max(-12, Math.min(12, nx*14));
      hoverNode.style.transform = `translateZ(18px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }

    // gentle parallax of canvases via CSS transform
    const blueprintOffsetX = mx * 18;
    const blueprintOffsetY = my * 10;
    blueprintCanvas.style.transform = `translate3d(${blueprintOffsetX}px, ${blueprintOffsetY}px, 0)`;
    traceCanvas.style.transform = `translate3d(${blueprintOffsetX*0.6}px, ${blueprintOffsetY*0.6}px, 0)`;
  });

  // intersection observer: reveal nodes with stagger
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        const el = ent.target;
        const idx = parseInt(el.getAttribute('data-idx') || '0', 10);
        setTimeout(() => el.classList.add('visible'), idx * 120);
      }
    });
  }, { threshold: 0.18 });

  nodes.forEach(n => obs.observe(n));

  // performance: reduce effects on small screens / hidden tabs
  function shouldReduceMotion() {
    return window.innerWidth < 720 || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  // If reduced, stop particle updates by clearing arrays
  if (shouldReduceMotion()) {
    particles.length = 0;
  }

  // handle visibility
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // nothing heavy here – we rely on rAF pause when tab hidden by browser
    }
  });

  // initial resize to align everything
  window.dispatchEvent(new Event('resize'));
})();
/* Command Deck — Realistic Cinematic Background (v2)
   Enhanced depth with smooth grid, light rays & glow pulses
   by GPT-5
*/

(() => {
  const section = document.getElementById('command-deck');
  const depthCanvas = document.getElementById('depthCanvas');
  const pulseCanvas = document.getElementById('pulseCanvas');
  const holo = document.getElementById('holoCard');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fit canvas to section
  function fit() {
    const rect = section.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    [depthCanvas, pulseCanvas].forEach(c => {
      c.width = w;
      c.height = h;
    });
  }
  window.addEventListener('resize', fit);
  fit();

  const dCtx = depthCanvas.getContext('2d', { alpha: true });
  const pCtx = pulseCanvas.getContext('2d', { alpha: true });

  // Grid parameters
  const grid = {
    spacing: 80,
    lineColor: 'rgba(0,209,255,0.05)',
    lightColor: 'rgba(0,209,255,0.07)'
  };

  // Light beams (soft moving streaks)
  const beams = Array.from({ length: 3 }).map(() => ({
    x: Math.random(),
    y: Math.random(),
    w: 0.002 + Math.random() * 0.004,
    speed: 0.00005 + Math.random() * 0.0002,
    alpha: 0.08 + Math.random() * 0.1
  }));

  // Floating haze particles
  const dust = Array.from({ length: 30 }).map(() => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.5 + Math.random() * 2,
    vx: (Math.random() - 0.5) * 0.05,
    vy: (Math.random() - 0.5) * 0.05,
    a: 0.02 + Math.random() * 0.2
  }));

  // Animate depth background
  function drawDepth(ts) {
    const w = depthCanvas.width;
    const h = depthCanvas.height;
    dCtx.clearRect(0, 0, w, h);

    // Background gradient
    const bgGrad = dCtx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#020409');
    bgGrad.addColorStop(1, '#010b14');
    dCtx.fillStyle = bgGrad;
    dCtx.fillRect(0, 0, w, h);

    // Grid lines (horizontal + subtle parallax)
    const offset = (ts * 0.02) % grid.spacing;
    dCtx.strokeStyle = grid.lineColor;
    dCtx.lineWidth = 1;
    for (let y = offset; y < h; y += grid.spacing) {
      dCtx.beginPath();
      dCtx.moveTo(0, y);
      dCtx.lineTo(w, y);
      dCtx.stroke();
    }

    // Light rays
    for (let beam of beams) {
      beam.x += beam.speed;
      if (beam.x > 1.2) beam.x = -0.2;

      const grad = dCtx.createLinearGradient(
        beam.x * w,
        0,
        (beam.x + beam.w) * w,
        h
      );
      grad.addColorStop(0, 'rgba(0,209,255,0)');
      grad.addColorStop(0.5, grid.lightColor);
      grad.addColorStop(1, 'rgba(0, 4, 255, 0)');

      dCtx.fillStyle = grad;
      dCtx.globalAlpha = beam.alpha;
      dCtx.fillRect(beam.x * w, 0, beam.w * w, h);
      dCtx.globalAlpha = 1;
    }

    // Dust / light motes
    dCtx.globalCompositeOperation = 'lighter';
    for (let p of dust) {
      p.x += p.vx * 0.5;
      p.y += p.vy * 0.5;
      if (p.x < 0) p.x = 1;
      if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1;
      if (p.y > 1) p.y = 0;
      const px = p.x * w;
      const py = p.y * h;
      dCtx.fillStyle = `rgba(0,209,255,${p.a})`;
      dCtx.beginPath();
      dCtx.arc(px, py, p.r, 0, Math.PI * 2);
      dCtx.fill();
    }
    dCtx.globalCompositeOperation = 'source-over';
  }

  // Pulse glow overlay
  function drawPulses(ts) {
    const w = pulseCanvas.width;
    const h = pulseCanvas.height;
    pCtx.clearRect(0, 0, w, h);
    const t = ts * 0.001;

    const cx = w * 0.65;
    const cy = h * 0.4;
    const rad = 160 + Math.sin(t * 1.5) * 40;

    const glow = pCtx.createRadialGradient(cx, cy, 0, cx, cy, rad * 2);
    glow.addColorStop(0, 'rgba(0,209,255,0.15)');
    glow.addColorStop(0.4, 'rgba(0,209,255,0.04)');
    glow.addColorStop(1, 'rgba(0,209,255,0)');
    pCtx.fillStyle = glow;
    pCtx.fillRect(0, 0, w, h);
  }

  // Animate
  function animate(ts) {
    drawDepth(ts);
    drawPulses(ts);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // Parallax tilt for holo + subtle motion of background
  section.addEventListener('mousemove', e => {
    if (reduced) return;
    const rect = section.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) - 0.5;
    const my = ((e.clientY - rect.top) / rect.height) - 0.5;
    const tiltY = mx * 8;
    const tiltX = -my * 6;
    holo.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    depthCanvas.style.transform = `translate3d(${mx * 30}px, ${my * 15}px, 0)`;
  });

  section.addEventListener('mouseleave', () => {
    if (reduced) return;
    holo.style.transform = '';
    depthCanvas.style.transform = '';
  });

  // Reveal when in view
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) section.classList.add('visible');
    });
  }, { threshold: 0.2 });
  obs.observe(section);
})();
const canvas = document.getElementById('project-bg');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

let particles = [];

for (let i = 0; i < 80; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2,
    dx: (Math.random() - 0.5) * 0.5,
    dy: (Math.random() - 0.5) * 0.5
  });
}

function animate() {
  ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00eaff';
  
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });

  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

