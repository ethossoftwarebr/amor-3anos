// Música de fundo: Saturno - BIN, Mainstreet, Ajaxx
const VIDEO_ID = 'VF97zz_5oCc';

let player = null;
let playerReady = false;
let pendingPlay = false;
let apiLoaded = false;

function ensureYouTubeAPI() {
  if (apiLoaded) return;
  apiLoaded = true;

  // Registra o callback global (a API procura por esse nome)
  window.onYouTubeIframeAPIReady = createPlayer;

  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(script);
}

function createPlayer() {
  if (player) return;
  player = new YT.Player('yt-player', {
    videoId: VIDEO_ID,
    height: '1',
    width: '1',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
      iv_load_policy: 3,
    },
    events: {
      onReady: (e) => {
        playerReady = true;
        try { e.target.unMute?.(); } catch {}
        try { e.target.setVolume?.(75); } catch {}
        if (pendingPlay) {
          try { e.target.playVideo(); } catch {}
          pendingPlay = false;
        }
        showMiniplayer();
      },
      onStateChange: (e) => {
        const mp = document.getElementById('miniplayer');
        if (!mp) return;
        if (e.data === YT.PlayerState.PLAYING) {
          mp.classList.add('miniplayer--tocando');
          updateToggle('⏸');
        } else if (e.data === YT.PlayerState.PAUSED) {
          mp.classList.remove('miniplayer--tocando');
          updateToggle('▶');
        } else if (e.data === YT.PlayerState.ENDED) {
          // Loop
          try { e.target.playVideo(); } catch {}
        }
      },
      onError: (e) => {
        console.warn('YT player error', e);
      },
    },
  });
}

function showMiniplayer() {
  const mp = document.getElementById('miniplayer');
  if (mp) mp.hidden = false;
}

function updateToggle(symbol) {
  const t = document.getElementById('miniplayer-toggle');
  if (t) t.textContent = symbol;
}

export function startMusic() {
  ensureYouTubeAPI();
  if (playerReady && player) {
    try { player.playVideo(); } catch {}
  } else {
    pendingPlay = true;
  }
  // mostra o miniplayer logo (mesmo antes do ready), pra dar feedback
  setTimeout(showMiniplayer, 600);
}

export function setupMiniplayer() {
  const toggle = document.getElementById('miniplayer-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    if (!playerReady || !player) {
      startMusic();
      return;
    }
    const state = player.getPlayerState?.();
    if (state === 1) {
      try { player.pauseVideo(); } catch {}
    } else {
      try { player.playVideo(); } catch {}
    }
  });
}
