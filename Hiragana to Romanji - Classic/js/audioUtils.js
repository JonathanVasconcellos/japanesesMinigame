// Utilitários de áudio e sons
(function() {
  const flipSound = new Audio("Sound/flip.mp3");
  const matchSound = new Audio("Sound/match.mp3");
  const errorSound = new Audio("Sound/error.mp3");
  const winSound = new Audio("Sound/win.mp3");
  const clickSound = new Audio("Sound/click.mp3");

  function getMusicPlayer() {
    if (!window.globalAudio) {
      const audio = new Audio("Sound/background.mp3");
      audio.loop = true;
      audio.volume = 0.3;
      window.globalAudio = audio;
    }
    return window.globalAudio;
  }

  const backgroundMusic = getMusicPlayer();

  window.flipSound = flipSound;
  window.matchSound = matchSound;
  window.errorSound = errorSound;
  window.winSound = winSound;
  window.clickSound = clickSound;
  window.backgroundMusic = backgroundMusic;

  window.getClickSound = function() { return clickSound; };
  window.getBackgroundMusic = function() { return getMusicPlayer(); };
  backgroundMusic.loop = true;
  if (backgroundMusic.volume === 1) {
    backgroundMusic.volume = 0.3;
  }
  [flipSound, matchSound, errorSound, winSound, clickSound, backgroundMusic].forEach(audio => audio.load());

  let isMusicPlaying = true;
  window.isMusicPlaying = isMusicPlaying;

  function syncMusicButtons() {
    const label = isMusicPlaying ? "Pausar Música" : "Retomar Música";
    document.querySelectorAll('.music-toggle-btn').forEach(btn => {
      btn.textContent = label;
    });
  }

  function tryStartMusic() {
    if (!isMusicPlaying) return;
    getMusicPlayer().play().catch(() => {});
  }

  window.toggleMusic = function() {
    const music = getMusicPlayer();
    clickSound.play().catch(() => {});
    if (isMusicPlaying) {
      music.pause();
      isMusicPlaying = false;
    } else {
      music.play().catch(() => {});
      isMusicPlaying = true;
    }
    window.isMusicPlaying = isMusicPlaying;
    syncMusicButtons();
  };

  window.addEventListener('load', tryStartMusic, { once: true });
  document.addEventListener('pointerdown', tryStartMusic, { once: true });
  syncMusicButtons();
})();
