export function initTimeline() {
  const capitulos = document.querySelectorAll('.capitulo');
  if (!capitulos.length) return;

  // Reveal por scroll
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else if (entry.boundingClientRect.top > 0) {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: [0.25, 0.5], rootMargin: '0px 0px -10% 0px' }
    );
    capitulos.forEach((c) => obs.observe(c));
  } else {
    capitulos.forEach((c) => c.classList.add('visible'));
  }

  // 3D tilt no hover (apenas em devices com mouse fino)
  if (matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
    capitulos.forEach((cap) => {
      const wrap = cap.querySelector('.capitulo__foto-wrap');
      const foto = cap.querySelector('.capitulo__foto');
      if (!wrap || !foto) return;

      const MAX_TILT = 8;

      function onMove(e) {
        const rect = wrap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - y) * MAX_TILT;
        const ry = (x - 0.5) * MAX_TILT;
        foto.style.transform = `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(20px)`;
      }

      function onLeave() {
        foto.style.transform = '';
      }

      wrap.addEventListener('mousemove', onMove);
      wrap.addEventListener('mouseleave', onLeave);
    });
  }

  // Parallax suave do número decorativo conforme o scroll
  if ('IntersectionObserver' in window && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    const numeros = document.querySelectorAll('.capitulo__numero');
    let ticking = false;

    function update() {
      numeros.forEach((num) => {
        const cap = num.closest('.capitulo');
        if (!cap) return;
        const rect = cap.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = (vh - rect.top) / (vh + rect.height);
        const offset = (progress - 0.5) * -60;
        num.style.transform = `translateY(${offset}px)`;
      });
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }
}
