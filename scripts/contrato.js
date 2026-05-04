// === Canvas de assinatura ===
function setupSignaturePad(canvas) {
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let lastX = 0;
  let lastY = 0;
  let hasContent = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    tmp.getContext('2d').drawImage(canvas, 0, 0);

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = '#1a1a1a';

    if (hasContent) {
      ctx.drawImage(tmp, 0, 0, rect.width, rect.height);
    }
  }

  resize();
  window.addEventListener('resize', resize);

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return {
      x: point.clientX - rect.left,
      y: point.clientY - rect.top,
    };
  }

  function start(e) {
    e.preventDefault();
    drawing = true;
    const p = pos(e);
    lastX = p.x;
    lastY = p.y;
  }

  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x;
    lastY = p.y;
    hasContent = true;
  }

  function end(e) {
    e?.preventDefault?.();
    drawing = false;
  }

  canvas.addEventListener('pointerdown', start);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', end);

  return {
    clear() {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      hasContent = false;
    },
    isEmpty() {
      return !hasContent;
    },
    getDataURL() {
      return canvas.toDataURL('image/png');
    },
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
      dica.textContent = 'seu navegador não tem câmera disponível 😢 — assina e segue.';
      dica.style.color = '#8b1a1a';
      return;
    }

    dica.textContent = 'sorri, princesa ✨';

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
    dica.textContent = 'autenticada com sucesso ❤️';
    dica.style.color = '#1a6e1a';
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
  const canvas = document.getElementById('assinatura-canvas');
  const limpar = document.getElementById('assinatura-limpar');
  const btn = document.getElementById('btn-renovar');

  if (!canvas || !btn) return;

  const pad = setupSignaturePad(canvas);
  const selfie = setupSelfie();

  limpar?.addEventListener('click', () => pad.clear());

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
    if (pad.isEmpty()) {
      shake(canvas.closest('.assinatura__canvas-wrap'));
      const linha = canvas.parentElement?.parentElement?.querySelector('.assinatura__label');
      if (linha) {
        linha.style.color = '#8b1a1a';
        linha.textContent = 'assina aqui antes, amor 💍';
      }
      canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (selfie.isEmpty()) {
      const selfieEl = document.querySelector('.selfie');
      shake(selfieEl);
      const dica = document.getElementById('selfie-dica');
      if (dica) {
        dica.style.color = '#8b1a1a';
        dica.textContent = 'tira a selfie de autenticação primeiro 📷';
      }
      selfieEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onConfirm?.({
      assinaturaURL: pad.getDataURL(),
      selfieURL: selfie.getDataURL(),
    });
  });
}
