// Música de fundo com fade-in para páginas de jogo
// Usa window.globalAudio para manter a música do index
if (window.globalAudio) {
  // Se já existe, só faz fade-in se estiver pausada
  if (window.globalAudio.paused) {
    let fadeInterval;
    function fadeInAudio(targetVolume = 0.5, duration = 2000) {
      clearInterval(fadeInterval);
      window.globalAudio.volume = 0;
      window.globalAudio.play();
      const step = targetVolume / (duration / 50);
      fadeInterval = setInterval(() => {
        if (window.globalAudio.volume < targetVolume) {
          window.globalAudio.volume = Math.min(window.globalAudio.volume + step, targetVolume);
        } else {
          clearInterval(fadeInterval);
        }
      }, 50);
    }
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        fadeInAudio();
      }, 600);
    });
  }
} 
// Remove criação de novo áudio! Não cria outro player se já existe.
// Ao carregar a música do jogo, tenta parar a música do index (caso esteja tocando em outro contexto)
try {
  if (window.opener && window.opener.audio) {
    window.opener.audio.pause();
    window.opener.audio.currentTime = 0;
  }
} catch (e) {}

// Controle de play/pause já existe nos botões do jogo, então não sobrescreve aqui.
