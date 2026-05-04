const COR_VARIANTES = ['', 'coracao--escuro', 'coracao--brilhante', 'coracao--branco'];

let corLoopId = null;
let burstLoopId = null;

function criarCoracao({ size, dur, left, drift = 0, delay = 0 } = {}) {
  const heart = document.createElement('div');
  const variante = COR_VARIANTES[Math.floor(Math.random() * COR_VARIANTES.length)];
  heart.className = `coracao ${variante}`.trim();

  const sz = size ?? Math.random() * 18 + 14;
  const d = dur ?? Math.random() * 6 + 7;
  const l = left ?? Math.random() * 100;
  const dr = drift ?? (Math.random() - 0.5) * 80;

  heart.style.left = `${l}%`;
  heart.style.width = `${sz}px`;
  heart.style.height = `${sz}px`;
  heart.style.animationDuration = `${d}s`;
  heart.style.setProperty('--drift', `${dr}px`);
  heart.style.animationDelay = `${delay}ms`;

  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), d * 1000 + delay + 500);
  return heart;
}

export function startCoracoes({ rate = 320, duration = [7, 13] } = {}) {
  if (corLoopId) clearInterval(corLoopId);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Loop principal: 1 coração a cada `rate`ms
  corLoopId = setInterval(() => {
    criarCoracao({
      size: Math.random() * 18 + 14,
      dur: Math.random() * (duration[1] - duration[0]) + duration[0],
    });
  }, rate);

  // Loop de rajadas: a cada 6-9s, dispara uma rajada de 6-12 corações próximos
  if (burstLoopId) clearInterval(burstLoopId);
  function agendarRajada() {
    const wait = 6000 + Math.random() * 3000;
    burstLoopId = setTimeout(() => {
      const count = 6 + Math.floor(Math.random() * 7);
      const baseLeft = Math.random() * 80 + 10;
      for (let i = 0; i < count; i++) {
        criarCoracao({
          size: Math.random() * 14 + 18,
          dur: 6 + Math.random() * 4,
          left: baseLeft + (Math.random() - 0.5) * 20,
          delay: i * 70,
        });
      }
      agendarRajada();
    }, wait);
  }
  agendarRajada();
}

export function stopCoracoes() {
  if (corLoopId) {
    clearInterval(corLoopId);
    corLoopId = null;
  }
  if (burstLoopId) {
    clearTimeout(burstLoopId);
    burstLoopId = null;
  }
}

export function bigHeartShower(count = 80) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      criarCoracao({
        size: Math.random() * 26 + 18,
        dur: 4 + Math.random() * 4,
      });
    }, i * 60);
  }
}

// Burst pontual em uma posição (ex: ao clicar SIM)
export function heartBurst(x, y, count = 30) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const xPct = (x / window.innerWidth) * 100;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      criarCoracao({
        size: Math.random() * 20 + 16,
        dur: 5 + Math.random() * 3,
        left: xPct + (Math.random() - 0.5) * 30,
        drift: (Math.random() - 0.5) * 200,
      });
    }, i * 35);
  }
}
