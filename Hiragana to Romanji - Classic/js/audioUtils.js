// Utilitários de áudio e sons
(function() {
  const flipSound = new Audio("Sound/flip.mp3");
  const matchSound = new Audio("Sound/match.mp3");
  const errorSound = new Audio("Sound/error.mp3");
  const winSound = new Audio("Sound/win.mp3");
  const clickSound = new Audio("Sound/click.mp3");

  window.flipSound = flipSound;
  window.matchSound = matchSound;
  window.errorSound = errorSound;
  window.winSound = winSound;
  window.clickSound = clickSound;
  window.getClickSound = function() { return clickSound; };
  [flipSound, matchSound, errorSound, winSound, clickSound].forEach(audio => audio.load());
})();
