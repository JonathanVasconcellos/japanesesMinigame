// Mantém preferência e posição da música ao navegar entre páginas do jogo.
(function() {
  const storageKey = 'hiragana-game-music-state';
  const source = new URL('Hiragana to Romanji - Images/audios/background.mp3', document.currentScript.src).href;
  let savedState = { playing: true, currentTime: 0 };

  try {
    savedState = { ...savedState, ...JSON.parse(sessionStorage.getItem(storageKey) || '{}') };
  } catch (_) {
    // O jogo continua funcionando se o navegador bloquear o armazenamento da sessão.
  }

  const audio = new Audio(source);
  audio.loop = true;
  audio.volume = 0.5;
  window.globalAudio = audio;
  window.isMusicPlaying = savedState.playing !== false;

  function saveState() {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({
        playing: !audio.paused,
        currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : 0
      }));
    } catch (_) {
      // Armazenamento indisponível não deve interromper a música.
    }
  }

  function syncButtons() {
    const label = audio.paused ? 'Retomar Música' : 'Pausar Música';
    document.querySelectorAll('.music-toggle-btn').forEach(button => {
      button.textContent = label;
    });
  }

  function startMusic() {
    if (window.isMusicPlaying && audio.paused) {
      audio.play().then(syncButtons).catch(syncButtons);
    }
  }

  audio.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(savedState.currentTime) && savedState.currentTime > 0 && audio.duration) {
      audio.currentTime = savedState.currentTime % audio.duration;
    }
    startMusic();
  }, { once: true });

  window.toggleMusic = function() {
    if (audio.paused) {
      window.isMusicPlaying = true;
      audio.play().then(syncButtons).catch(syncButtons);
    } else {
      window.isMusicPlaying = false;
      audio.pause();
      syncButtons();
    }
    saveState();
  };

  document.addEventListener('click', event => {
    if (event.target.closest('.music-toggle-btn')) {
      window.toggleMusic();
    }
  });
  document.addEventListener('pointerdown', startMusic, { once: true });
  window.addEventListener('pagehide', saveState);
  audio.addEventListener('timeupdate', saveState);
  document.addEventListener('DOMContentLoaded', syncButtons);
  audio.load();
})();
