// === Animações de futebol no contrato ===

let intervalId = null;

function getContrato() {
  return document.getElementById('contrato');
}

function reduzirMovimento() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function spawnBolaRolando() {
  const contrato = getContrato();
  if (!contrato) return;

  const bola = document.createElement('span');
  bola.className = 'bola-rolando';
  bola.setAttribute('aria-hidden', 'true');

  const dur = 9 + Math.random() * 8;
  const yPct = 8 + Math.random() * 84;
  const direcao = Math.random() < 0.5 ? 1 : -1;
  const tamanho = 22 + Math.random() * 14;

  bola.textContent = '⚽';
  bola.style.cssText = `
    position: absolute;
    top: ${yPct}%;
    ${direcao === 1 ? 'left: -50px' : 'right: -50px'};
    font-size: ${tamanho}px;
    animation: bola-rolando-${direcao === 1 ? 'lr' : 'rl'} ${dur}s linear forwards;
    z-index: 0;
    pointer-events: none;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
    opacity: 0.65;
  `;

  contrato.appendChild(bola);
  setTimeout(() => bola.remove(), dur * 1000 + 500);
}

export function bolaBurst(count = 18) {
  if (reduzirMovimento()) return;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const bola = document.createElement('span');
      bola.className = 'bola-burst';
      bola.textContent = '⚽';
      const angle = Math.random() * 360;
      const dist = 120 + Math.random() * 220;
      const dur = 1.6 + Math.random() * 0.8;
      const tamanho = 18 + Math.random() * 14;
      bola.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        font-size: ${tamanho}px;
        z-index: 95;
        pointer-events: none;
        --angle: ${angle}deg;
        --dist: ${dist}px;
        --dur: ${dur}s;
        animation: bola-burst var(--dur) cubic-bezier(0.16, 0.84, 0.44, 1) forwards;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
      `;
      document.body.appendChild(bola);
      setTimeout(() => bola.remove(), dur * 1000 + 200);
    }, i * 30);
  }
}

export function trofeuShower(count = 6) {
  if (reduzirMovimento()) return;
  const icones = ['🏆', '⚽', '🥇', '⭐'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const it = document.createElement('span');
      it.className = 'trofeu-fall';
      it.textContent = icones[Math.floor(Math.random() * icones.length)];
      const x = Math.random() * 100;
      const dur = 3 + Math.random() * 2;
      const rot = (Math.random() - 0.5) * 540;
      const sz = 26 + Math.random() * 18;
      it.style.cssText = `
        position: fixed;
        left: ${x}%;
        top: -60px;
        font-size: ${sz}px;
        z-index: 90;
        pointer-events: none;
        --rot: ${rot}deg;
        --dur: ${dur}s;
        animation: trofeu-fall var(--dur) cubic-bezier(0.4, 0, 0.6, 1) forwards;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.45));
      `;
      document.body.appendChild(it);
      setTimeout(() => it.remove(), dur * 1000 + 200);
    }, i * 120);
  }
}

export function initFutebol() {
  const contrato = getContrato();
  if (!contrato || reduzirMovimento()) return;

  // Spawn periódico de bolas rolando — só quando o contrato está visível
  let visible = false;
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        visible = e.isIntersecting && e.intersectionRatio > 0.1;
        if (visible && !intervalId) {
          intervalId = setInterval(() => {
            if (visible) spawnBolaRolando();
          }, 3500);
          // Spawn imediato pra não esperar
          spawnBolaRolando();
        } else if (!visible && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      });
    }, { threshold: [0.1] });
    obs.observe(contrato);
  } else {
    intervalId = setInterval(spawnBolaRolando, 3500);
  }

  // Quando a digital completa: burst de bolas
  document.addEventListener('digital:complete', () => bolaBurst(12));

  // Quando clica renovar: trofeu shower + bola burst
  document.addEventListener('contrato:renovado', () => {
    bolaBurst(20);
    trofeuShower(8);
  });
}
