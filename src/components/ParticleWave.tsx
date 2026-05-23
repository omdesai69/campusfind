import { useEffect, useRef } from "react";

/* ── Simplex 2D noise (unchanged helper) ── */
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;
const permBase = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
const perm = new Uint8Array(512);
for (let i = 0; i < 512; i++) perm[i] = permBase[i & 255];
const grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];

function noise2D(xin: number, yin: number): number {
  const s = (xin + yin) * F2;
  const i = Math.floor(xin + s), j = Math.floor(yin + s);
  const t = (i + j) * G2;
  const x0 = xin - (i - t), y0 = yin - (j - t);
  const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
  const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
  const ii = i & 255, jj = j & 255;
  const gi0 = perm[ii + perm[jj]] % 12;
  const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
  const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;
  let n0 = 0, n1 = 0, n2 = 0;
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0); }
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1); }
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2); }
  return 70 * (n0 + n1 + n2);
}

/* ── Particle type ── */
interface Particle {
  x: number; y: number;
  baseX: number; baseY: number;
  vx: number; vy: number;
  size: number;
  pulse: number;      // phase offset for pulsing glow
  brightness: number; // 0-1, how bright this node is
  layer: number;      // 0 = back, 1 = mid, 2 = front  (parallax depth)
}

export default function ParticleWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0, height = 0, dpr = 1;
    let particles: Particle[] = [];
    let mouseX = -9999, mouseY = -9999;
    let animId = 0;
    let time = 0;

    /* ── Color palette (gold to warm amber) ── */
    const COLORS = [
      { r: 212, g: 168, b: 67 },   // primary gold  #D4A843
      { r: 196, g: 154, b: 59 },   // darker gold   #C49A3B
      { r: 230, g: 190, b: 100 },  // light gold    #E6BE64
      { r: 180, g: 140, b: 50 },   // deep amber    #B48C32
    ];

    function createParticles() {
      particles = [];
      const area = width * height;
      const count = Math.min(Math.floor(area / 4500), 280);

      for (let i = 0; i < count; i++) {
        const layer = i < count * 0.3 ? 0 : i < count * 0.7 ? 1 : 2;
        const depthScale = 0.5 + layer * 0.25;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseX: Math.random() * width,
          baseY: Math.random() * height,
          vx: 0, vy: 0,
          size: (1 + Math.random() * 2) * depthScale,
          pulse: Math.random() * Math.PI * 2,
          brightness: 0.3 + Math.random() * 0.7,
          layer,
        });
      }
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = width + "px";
      canvas!.style.height = height + "px";
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
      createParticles();
    }

    /* ── Main animation loop ── */
    function animate() {
      time += 0.005;
      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = "#141414";
      ctx!.fillRect(0, 0, width, height);

      /* ── 1. Draw subtle aurora waves at the top ── */
      drawAurora();

      /* ── 2. Update particle positions ── */
      const mouseRadius = 160;
      for (const p of particles) {
        // Noise-based organic drift
        const depthSpeed = 0.3 + p.layer * 0.35;
        const nx = noise2D(p.baseX * 0.001, time * depthSpeed) * 40;
        const ny = noise2D(p.baseY * 0.001 + 300, time * depthSpeed + 100) * 40;
        
        let targetX = p.baseX + nx;
        let targetY = p.baseY + ny;

        // Slow base drift across the screen
        p.baseX += Math.sin(time * 0.2 + p.pulse) * 0.08;
        p.baseY += Math.cos(time * 0.15 + p.pulse) * 0.06;

        // Wrap around edges
        if (p.baseX < -50) p.baseX = width + 50;
        if (p.baseX > width + 50) p.baseX = -50;
        if (p.baseY < -50) p.baseY = height + 50;
        if (p.baseY > height + 50) p.baseY = -50;

        // Mouse repulsion
        const dx = targetX - mouseX;
        const dy = targetY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius && dist > 0) {
          const force = (1 - dist / mouseRadius) * 60;
          targetX += (dx / dist) * force;
          targetY += (dy / dist) * force;
        }

        // Smooth spring to target
        p.vx += (targetX - p.x) * 0.04;
        p.vy += (targetY - p.y) * 0.04;
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;
      }

      /* ── 3. Draw connection lines between nearby particles ── */
      drawConnections();

      /* ── 4. Draw particles (glowing nodes) ── */
      drawParticles();

      animId = requestAnimationFrame(animate);
    }

    function drawAurora() {
      ctx!.save();
      ctx!.globalCompositeOperation = "lighter";
      
      for (let wave = 0; wave < 3; wave++) {
        const yBase = height * (0.15 + wave * 0.12);
        const amplitude = 30 + wave * 15;
        const alpha = 0.012 - wave * 0.003;

        ctx!.beginPath();
        ctx!.moveTo(0, yBase);

        for (let x = 0; x <= width; x += 4) {
          const n1 = noise2D(x * 0.002 + wave * 10, time * 0.4 + wave);
          const n2 = noise2D(x * 0.004 + wave * 20, time * 0.6 - wave * 0.5);
          const y = yBase + (n1 + n2 * 0.5) * amplitude;
          ctx!.lineTo(x, y);
        }

        ctx!.lineTo(width, height);
        ctx!.lineTo(0, height);
        ctx!.closePath();

        const grad = ctx!.createLinearGradient(0, yBase - amplitude, 0, yBase + amplitude * 3);
        grad.addColorStop(0, `rgba(212, 168, 67, ${alpha * 2})`);
        grad.addColorStop(0.3, `rgba(212, 168, 67, ${alpha})`);
        grad.addColorStop(1, "rgba(212, 168, 67, 0)");
        ctx!.fillStyle = grad;
        ctx!.fill();
      }

      ctx!.restore();
    }

    function drawConnections() {
      ctx!.save();
      ctx!.globalCompositeOperation = "lighter";
      const maxDist = 120;

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        if (a.layer === 0) continue; // skip back-layer for performance

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          if (b.layer === 0) continue;
          if (Math.abs(a.layer - b.layer) > 1) continue; // only connect same/adjacent layers

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.15 * Math.min(a.brightness, b.brightness);
            const col = COLORS[0];
            ctx!.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha})`;
            ctx!.lineWidth = (1 - dist / maxDist) * 1.2;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      ctx!.restore();
    }

    function drawParticles() {
      ctx!.save();
      ctx!.globalCompositeOperation = "lighter";

      for (const p of particles) {
        const pulseVal = Math.sin(time * 2 + p.pulse) * 0.3 + 0.7;
        const alpha = p.brightness * pulseVal * (0.4 + p.layer * 0.2);
        const col = COLORS[p.layer % COLORS.length];
        const glowSize = p.size * (3 + pulseVal * 2);

        // Outer glow
        const grd = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
        grd.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha * 0.8})`);
        grd.addColorStop(0.4, `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha * 0.2})`);
        grd.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);
        ctx!.fillStyle = grd;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        ctx!.fill();

        // Bright core
        ctx!.fillStyle = `rgba(${Math.min(col.r + 40, 255)}, ${Math.min(col.g + 40, 255)}, ${Math.min(col.b + 20, 255)}, ${alpha})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.restore();
    }

    /* ── Event listeners ── */
    const handleMouseMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    const handleMouseLeave = () => { mouseX = -9999; mouseY = -9999; };
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) { mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY; }
    };
    const handleTouchEnd = () => { mouseX = -9999; mouseY = -9999; };

    resize();
    animId = requestAnimationFrame(animate);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouch, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
    />
  );
}
