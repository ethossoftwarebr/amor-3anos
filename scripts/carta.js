export function initCarta() {
  const corpo = document.getElementById('carta-corpo');
  const assinatura = document.getElementById('carta-assinatura');
  const virar = document.getElementById('carta-virar');

  if (!corpo) return;

  const paragrafos = Array.from(corpo.querySelectorAll('p'));
  const finais = [assinatura, virar].filter(Boolean);
  const todos = [...paragrafos, ...finais];

  if (!('IntersectionObserver' in window)) {
    todos.forEach((el) => el.classList.add('revealed'));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger: cada parágrafo entra com pequeno atraso baseado na ordem
          const idx = todos.indexOf(entry.target);
          const delay = Math.max(0, idx) * 80;
          setTimeout(() => entry.target.classList.add('revealed'), delay);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
  );

  todos.forEach((el) => obs.observe(el));
}
