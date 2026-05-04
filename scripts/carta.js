function setupRevealCarta(corpoSelector, finaisSelectors = []) {
  const corpo = document.querySelector(corpoSelector);
  if (!corpo) return;

  const elementos = Array.from(corpo.querySelectorAll('p, h3, blockquote, ul'));
  const finais = finaisSelectors
    .map((s) => document.querySelector(s))
    .filter(Boolean);
  const todos = [...elementos, ...finais];

  if (!('IntersectionObserver' in window)) {
    todos.forEach((el) => el.classList.add('revealed'));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = todos.indexOf(entry.target);
          const delay = Math.max(0, idx % 6) * 60;
          setTimeout(() => entry.target.classList.add('revealed'), delay);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
  );

  todos.forEach((el) => obs.observe(el));
}

export function initCarta() {
  // Carta original (Ato 6)
  setupRevealCarta('#carta-corpo', ['#carta-assinatura', '#carta-virar']);

  // Continuação (Ato 6.5)
  setupRevealCarta(
    '#continuacao-corpo',
    ['#encantamento', '#pelucias', '#carta-encerramento', '#continuacao-assinatura', '#continuacao-virar'],
  );
}
