// Utilitários de áudio e sons
(function() {
  window.flipSound = new Audio("Sound/flip.mp3");
  window.matchSound = new Audio("Sound/match.mp3");
  window.errorSound = new Audio("Sound/error.mp3");
  window.winSound = new Audio("Sound/win.mp3");
  window.clickSound = new Audio("Sound/click.mp3");
  window.backgroundMusic = new Audio("Sound/background.mp3");

  window.getClickSound = function() { return window.clickSound; };
  window.getBackgroundMusic = function() { return window.backgroundMusic; };
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.3;
  [flipSound, matchSound, errorSound, winSound, clickSound, backgroundMusic].forEach(audio => audio.load());

  window.isMusicPlaying = true;
  window.toggleMusic = function() {
    clickSound.play();
    if (isMusicPlaying) {
      backgroundMusic.pause();
      document.querySelectorAll('.music-toggle-btn').forEach(btn => btn.textContent = "Retomar Música");
      isMusicPlaying = false;
    } else {
      backgroundMusic.play().catch(() => {});
      document.querySelectorAll('.music-toggle-btn').forEach(btn => btn.textContent = "Pausar Música");
      isMusicPlaying = true;
    }
  };

  window.addEventListener('load', () => {
    backgroundMusic.play().catch(() => {});
  });
  document.addEventListener('click', () => {
    backgroundMusic.play().catch(() => {});
  }, { once: true });
})();
