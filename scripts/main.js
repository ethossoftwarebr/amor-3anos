import { startCoracoes, stopCoracoes, bigHeartShower } from './coracoes.js';
import { initTimeline } from './timeline.js';
import { initCarta } from './carta.js';
import { initContrato } from './contrato.js';
import { initFinal } from './final.js';
import { startMusic, setupMiniplayer } from './audio.js';

const INICIO_NAMORO = new Date('2023-05-05T00:00:00-03:00').getTime();

// === Contador em tempo real ===
function tickContador() {
  const agora = Date.now();
  const diff = Math.max(0, agora - INICIO_NAMORO);

  const dias = Math.floor(diff / 86_400_000);
  const horas = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutos = Math.floor((diff % 3_600_000) / 60_000);
  const segundos = Math.floor((diff % 60_000) / 1000);

  const setNum = (key, value) => {
    const el = document.querySelector(`[data-counter="${key}"]`);
    if (el) el.textContent = value.toLocaleString('pt-BR');
  };

  setNum('dias', dias);
  setNum('horas', horas);
  setNum('minutos', minutos);
  setNum('segundos', segundos);
}

// === Máquina de escrever ===
function typewriter(el, text, speed = 35) {
  return new Promise((resolve) => {
    el.textContent = '';
    el.innerHTML = '<span class="cursor"></span>';
    const cursor = el.querySelector('.cursor');
    let i = 0;

    const tick = () => {
      if (i >= text.length) {
        setTimeout(() => cursor?.remove(), 2000);
        resolve();
        return;
      }
      const char = text[i++];
      const node = document.createTextNode(char);
      el.insertBefore(node, cursor);

      // pausa maior em pontuação
      const delay = /[.,!?]/.test(char) ? speed * 8 : speed + (Math.random() * 30 - 15);
      setTimeout(tick, delay);
    };

    tick();
  });
}

// === Reveal genérico via Intersection Observer ===
function setupRevealOnScroll(selector, threshold = 0.15) {
  const els = document.querySelectorAll(selector);
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    },
    { threshold, rootMargin: '0px 0px -10% 0px' }
  );
  els.forEach((el) => obs.observe(el));
}

// === Click "Abrir a carta" === (consent gesture)
let aberturaIniciada = false;

async function comecarJornada() {
  if (aberturaIniciada) return;
  aberturaIniciada = true;

  const btn = document.getElementById('btn-comecar');
  btn?.classList.add('clicked');

  // scroll suave para abertura
  document.getElementById('abertura')?.scrollIntoView({ behavior: 'smooth' });

  // chuva de corações
  bigHeartShower(40);
  startCoracoes({ rate: 320 });

  // dispara música (Saturno) — gesto do usuário libera autoplay
  startMusic();

  // espera o scroll iniciar e dispara máquina de escrever
  await new Promise((r) => setTimeout(r, 800));
  const texto = document.getElementById('abertura-texto');
  if (texto) {
    const fullText = texto.dataset.text || '';
    await typewriter(texto, fullText, 32);
  }
}

// === Inicialização ===
function init() {
  // Contador
  tickContador();
  setInterval(tickContador, 1000);

  // Botão da capa
  const btnComecar = document.getElementById('btn-comecar');
  btnComecar?.addEventListener('click', comecarJornada);

  // Trigger automático se ela rolar pra abertura sem clicar
  const abertura = document.getElementById('abertura');
  if (abertura) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.3) {
            comecarJornada();
            obs.disconnect();
          }
        });
      },
      { threshold: [0.3] }
    );
    obs.observe(abertura);
  }

  // Reveal genérico
  setupRevealOnScroll('.fade-in');

  // Mini-player
  setupMiniplayer();

  // Atos modulares
  initTimeline();
  initCarta();
  initContrato({ onConfirm: handleSim });
  initFinal();
}

// === Handlers do contrato ===
function handleSim({ assinaturaURL, selfieURL }) {
  const finalSection = document.getElementById('final');
  finalSection.hidden = false;
  finalSection.scrollIntoView({ behavior: 'smooth' });

  // Confete + corações
  if (window.confetti) {
    const duration = 4500;
    const end = Date.now() + duration;
    const colors = ['#e60026', '#ff1744', '#ff4d6d', '#8b0014', '#ffffff'];
    (function frame() {
      window.confetti({
        particleCount: 6,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      window.confetti({
        particleCount: 6,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  bigHeartShower(80);

  // guarda dados pro download
  window.__contratoData = { assinaturaURL, selfieURL };
}


// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
