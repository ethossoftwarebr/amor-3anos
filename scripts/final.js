const WHATSAPP_NUMERO = '5562994826949'; // +55 (62) 99482-6949 — João Pedro
const MENSAGEM = `Oi, meu amor 💌

Aceito renovar mais 1 ano com você.

Contrato em anexo, assinado e autenticado.
Eternamente sua,
Fernanda Vittoria 💍❤️`;

async function gerarContratoPNG(contrato) {
  if (!window.html2canvas) throw new Error('html2canvas indisponível');

  contrato.classList.add('contrato--capturando');
  await new Promise((r) => setTimeout(r, 80));

  try {
    const canvas = await window.html2canvas(contrato, {
      backgroundColor: '#f4e4c1',
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: contrato.scrollWidth,
      windowHeight: contrato.scrollHeight,
      ignoreElements: (el) => {
        if (el.tagName === 'VIDEO') return true;
        if (el.tagName === 'BUTTON') return true;
        if (el.id === 'contrato-botoes') return true;
        if (el.classList?.contains?.('contrato__pergunta')) return true;
        if (el.classList?.contains?.('selfie__botoes')) return true;
        if (el.classList?.contains?.('selfie__dica')) return true;
        if (el.classList?.contains?.('selfie__placeholder')) return true;
        if (el.classList?.contains?.('assinatura__limpar')) return true;
        return false;
      },
    });

    return canvas;
  } finally {
    contrato.classList.remove('contrato--capturando');
  }
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
}

function downloadCanvas(canvas, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function abrirWhatsAppText() {
  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(MENSAGEM)}`;
  window.open(url, '_blank', 'noopener');
}

export function initFinal() {
  const btnEnviar = document.getElementById('final-enviar');
  const btnBaixar = document.getElementById('final-baixar');
  const nota = document.getElementById('final-nota');

  // === Enviar pro WhatsApp do João ===
  btnEnviar?.addEventListener('click', async () => {
    btnEnviar.disabled = true;
    const textoOriginal = btnEnviar.innerHTML;
    btnEnviar.textContent = '✨ preparando o contrato...';

    try {
      const contrato = document.querySelector('.contrato');
      if (!contrato) throw new Error('Contrato não encontrado');

      const canvas = await gerarContratoPNG(contrato);
      const blob = await canvasToBlob(canvas);
      const filename = 'contrato-3-anos-fer-jp.png';
      const file = new File([blob], filename, { type: 'image/png' });

      // Caminho ideal: Web Share API com arquivo
      // (funciona no Chrome Android, Safari iOS 15+, Edge)
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Contrato de Renovação · 3 anos',
            text: MENSAGEM,
          });
          btnEnviar.textContent = '✅ enviado pro João ❤️';
          if (nota) nota.textContent = 'agora ele vai abrir o WhatsApp e ler 💌';
          setTimeout(() => {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = textoOriginal;
          }, 3000);
          return;
        } catch (err) {
          // usuário cancelou o share — não trata como erro
          if (err?.name === 'AbortError') {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = textoOriginal;
            return;
          }
          // share falhou por outro motivo: cai no fallback
          console.warn('share falhou, indo pro fallback', err);
        }
      }

      // Fallback: baixa o PNG e abre wa.me com a mensagem (ela anexa manualmente)
      downloadCanvas(canvas, filename);
      btnEnviar.textContent = '📥 baixei pra você. abrindo WhatsApp...';
      if (nota) {
        nota.innerHTML =
          'a foto do contrato foi salva no seu aparelho. <strong>anexa ela na conversa</strong> que abriu — e manda 💌';
      }
      setTimeout(() => {
        abrirWhatsAppText();
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = textoOriginal;
      }, 1200);
    } catch (err) {
      console.error(err);
      document.querySelector('.contrato')?.classList.remove('contrato--capturando');
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = textoOriginal;
      if (nota) {
        nota.style.color = '#ff4d6d';
        nota.textContent = 'deu ruim 😢 tenta de novo daqui a 2 segundos.';
      }
    }
  });

  // === Só baixar pra ela ===
  btnBaixar?.addEventListener('click', async () => {
    btnBaixar.disabled = true;
    const original = btnBaixar.textContent;
    btnBaixar.textContent = '📜 gerando...';

    try {
      const contrato = document.querySelector('.contrato');
      if (!contrato) throw new Error('Contrato não encontrado');

      const canvas = await gerarContratoPNG(contrato);
      downloadCanvas(canvas, 'contrato-3-anos-fer-jp.png');

      btnBaixar.textContent = '✅ baixado!';
      setTimeout(() => {
        btnBaixar.disabled = false;
        btnBaixar.textContent = original;
      }, 2000);
    } catch (err) {
      console.error(err);
      document.querySelector('.contrato')?.classList.remove('contrato--capturando');
      btnBaixar.disabled = false;
      btnBaixar.textContent = '😢 tente de novo';
    }
  });
}
