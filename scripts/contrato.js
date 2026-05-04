// === Impressão digital (substitui canvas de assinatura) ===
function setupDigital() {
  const area = document.getElementById('digital-area');
  const limpar = document.getElementById('digital-limpar');
  const progresso = document.getElementById('digital-progresso');

  if (!area) return { isEmpty: () => true, getDataURL: () => null };

  const traces = Array.from(area.querySelectorAll('.trace'));
  const TOTAL = traces.length;
  const THRESHOLD = Math.ceil(TOTAL * 0.6); // 60% pra considerar "preenchida"

  let revealed = 0;

  function updateState() {
    if (progresso) progresso.textContent = `${revealed}/${TOTAL}`;
    if (revealed === 0) {
      area.dataset.state = 'empty';
    } else if (revealed >= TOTAL) {
      area.dataset.state = 'complete';
    } else {
      area.dataset.state = 'filling';
    }
  }

  function pressionar(e) {
    if (e?.preventDefault) e.preventDefault();
    if (revealed >= TOTAL) return;

    // Revela 1 ou 2 linhas por toque pra ser mais responsivo
    const incremento = revealed < TOTAL - 1 ? (Math.random() < 0.4 ? 2 : 1) : 1;
    for (let i = 0; i < incremento && revealed < TOTAL; i++) {
      traces[revealed].classList.add('drawn');
      revealed++;
    }
    updateState();

    // Vibração tátil em mobile (se disponível)
    if (navigator.vibrate && revealed < TOTAL) {
      navigator.vibrate(15);
    } else if (navigator.vibrate && revealed === TOTAL) {
      navigator.vibrate([20, 30, 20]);
    }

    // Evento custom: digital completa
    if (revealed === TOTAL) {
      document.dispatchEvent(new CustomEvent('digital:complete'));
    }
  }

  function clear() {
    traces.forEach((p) => p.classList.remove('drawn'));
    revealed = 0;
    updateState();
  }

  // Pointer events cobrem mouse + touch + pen
  area.addEventListener('pointerdown', pressionar);
  area.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') pressionar(e);
  });

  limpar?.addEventListener('click', clear);

  updateState();

  return {
    isEmpty: () => revealed < THRESHOLD,
    getDataURL: () => null, // a digital fica visível no html2canvas direto
    isComplete: () => revealed >= TOTAL,
  };
}

// === Selfie (getUserMedia) ===
function setupSelfie() {
  const preview = document.getElementById('selfie-preview');
  const video = document.getElementById('selfie-video');
  const foto = document.getElementById('selfie-foto');
  const btnAbrir = document.getElementById('selfie-abrir');
  const btnTirar = document.getElementById('selfie-tirar');
  const btnRefazer = document.getElementById('selfie-refazer');
  const dica = document.getElementById('selfie-dica');

  if (!preview || !video) return { isEmpty: () => true, getDataURL: () => null };

  let stream = null;
  let dataURL = null;

  function setState(state) {
    preview.dataset.state = state;
    if (state === 'capturing') {
      btnAbrir.hidden = true;
      btnTirar.hidden = false;
      btnRefazer.hidden = true;
    } else if (state === 'captured') {
      btnAbrir.hidden = true;
      btnTirar.hidden = true;
      btnRefazer.hidden = false;
      preview.parentElement.classList.add('selfie--ok');
    } else {
      btnAbrir.hidden = false;
      btnTirar.hidden = true;
      btnRefazer.hidden = true;
      preview.parentElement.classList.remove('selfie--ok');
    }
  }

  async function abrirCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      dica.textContent = 'seu navegador não tem câmera disponível 😢';
      dica.style.color = '#8b1a1a';
      return;
    }

    dica.textContent = 'sorri, jogadora ✨';

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      video.srcObject = stream;
      await video.play().catch(() => {});
      setState('capturing');
    } catch (err) {
      console.error(err);
      dica.textContent = 'precisa permitir o acesso à câmera 🥺';
      dica.style.color = '#8b1a1a';
    }
  }

  function pararStream() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
  }

  function tirarFoto() {
    if (!stream) return;

    const c = document.createElement('canvas');
    const vw = video.videoWidth || 720;
    const vh = video.videoHeight || 720;
    const lado = Math.min(vw, vh);
    const sx = (vw - lado) / 2;
    const sy = (vh - lado) / 2;
    c.width = 720;
    c.height = 720;
    const ctx = c.getContext('2d');
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, lado, lado, 0, 0, c.width, c.height);

    dataURL = c.toDataURL('image/jpeg', 0.92);
    foto.src = dataURL;
    pararStream();
    setState('captured');
    dica.textContent = 'jogadora autenticada ⚽';
    dica.style.color = '#1a6e3a';
  }

  function refazer() {
    dataURL = null;
    foto.src = '';
    dica.style.color = '';
    dica.textContent = 'a câmera abre só quando você clica — sua foto fica no aparelho.';
    abrirCamera();
  }

  btnAbrir.addEventListener('click', abrirCamera);
  btnTirar.addEventListener('click', tirarFoto);
  btnRefazer.addEventListener('click', refazer);

  window.addEventListener('beforeunload', pararStream);

  setState('empty');

  return {
    isEmpty: () => !dataURL,
    getDataURL: () => dataURL,
  };
}

// === Init ===
export function initContrato({ onConfirm }) {
  const btn = document.getElementById('btn-renovar');
  if (!btn) return;

  const digital = setupDigital();
  const selfie = setupSelfie();

  function shake(el) {
    el?.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-8px)' },
        { transform: 'translateX(8px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 380, easing: 'ease-in-out' }
    );
  }

  btn.addEventListener('click', () => {
    if (digital.isEmpty()) {
      const area = document.getElementById('digital-area');
      shake(area);
      const label = document.querySelector('.digital .contrato__label');
      if (label) {
        label.style.color = '#8b1a1a';
        label.textContent = 'pressiona o polegar mais vezes, jogadora 👆';
      }
      area?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (selfie.isEmpty()) {
      const selfieEl = document.querySelector('.selfie');
      shake(selfieEl);
      const dica = document.getElementById('selfie-dica');
      if (dica) {
        dica.style.color = '#8b1a1a';
        dica.textContent = 'tira a foto da escalação primeiro 📷';
      }
      selfieEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Evento custom: contrato renovado (pra disparar bolas + troféus)
    document.dispatchEvent(new CustomEvent('contrato:renovado'));

    onConfirm?.({
      assinaturaURL: null,
      selfieURL: selfie.getDataURL(),
    });
  });
}
