const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- Brillo que sigue al cursor --- */
const glow = document.getElementById('cursorGlow');
if (glow && !prefersReducedMotion) {
  window.addEventListener('mousemove', (e) => {
    glow.style.opacity = '1';
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
  window.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
}

/* --- Fondo animado del hero: red de puntos --- */
const canvas = document.getElementById('heroCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width, height, points;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function initPoints() {
    const count = Math.floor((width * height) / 18000);
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(227,165,74,0.5)';

    points.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.strokeStyle = `rgba(227,165,74,${0.12 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  initPoints();
  window.addEventListener('resize', () => { resize(); initPoints(); });

  if (!prefersReducedMotion) {
    draw();
  } else {
    draw();
  }
}

/* --- Revelado al hacer scroll --- */
const revealEls = document.querySelectorAll('[data-reveal]');
if (revealEls.length && !prefersReducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* --- Efecto de escritura + botón copiar en los bloques de terminal --- */
document.querySelectorAll('.project-terminal').forEach((terminal) => {
  const codeEl = terminal.querySelector('code');
  const cursorEl = terminal.querySelector('.cursor-blink');
  const bar = terminal.querySelector('.terminal-bar');
  const fullCmd = '$ ' + codeEl.dataset.cmd;

  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copiar';
  copyBtn.className = 'copy-btn';
  bar.appendChild(copyBtn);

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(codeEl.dataset.cmd).then(() => {
      copyBtn.textContent = '¡Copiado!';
      setTimeout(() => { copyBtn.textContent = 'Copiar'; }, 1500);
    });
  });

  function typeCommand() {
    if (prefersReducedMotion) {
      codeEl.textContent = fullCmd;
      if (cursorEl) cursorEl.style.display = 'none';
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      codeEl.textContent = fullCmd.slice(0, i + 1);
      i++;
      if (i >= fullCmd.length) clearInterval(interval);
    }, 22);
  }

  const termObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        typeCommand();
        termObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  termObserver.observe(terminal);
});
