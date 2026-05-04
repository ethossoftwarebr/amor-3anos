function setupRevealCarta(corpoSelector, finaisSelectors = []) {
  const corpo = document.querySelector(corpoSelector);
  if (!corpo) return;

  const elementos = Array.from(corpo.querySelectorAll('p, h3, blockquote, ul'));
  const finais = finaisSelectors
    .map((s) => document.querySelector(s))
    .filter(Boolean);
  const todos = [...elementos, ...finais];

  // Reduced motion: revela tudo imediatamente
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    todos.forEach((el) => el.classList.add('revealed'));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = todos.indexOf(entry.target);
          const delay = Math.max(0, idx % 6) * 50;
          setTimeout(() => entry.target.classList.add('revealed'), delay);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px' }
  );

  todos.forEach((el) => obs.observe(el));

  // Fallback: garante que tudo apareça mesmo se observer falhar
  // Quando a seção entra no viewport, agenda revelação progressiva
  const sectionEl = corpo.closest('section');
  if (sectionEl) {
    const sectionObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            todos.forEach((el, i) => {
              setTimeout(() => {
                if (!el.classList.contains('revealed')) {
                  el.classList.add('revealed');
                }
              }, i * 80 + 200);
            });
            sectionObs.disconnect();
          }
        });
      },
      { threshold: 0.05 }
    );
    sectionObs.observe(sectionEl);
  }
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
