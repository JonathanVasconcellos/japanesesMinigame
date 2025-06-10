// Script para música de fundo global
// Usa window.globalAudio para manter a música entre páginas
if (!window.globalAudio) {
  const audio = new Audio('Hiragana to Romanji - Images/audios/background.mp3');
  audio.loop = true;
  audio.volume = 0.5;
  window.globalAudio = audio;
  // Tenta tocar imediatamente (para navegadores que permitem)
  audio.play().catch(() => {
    // Se o navegador bloquear, tenta tocar no primeiro clique do usuário
    const tryPlay = () => {
      audio.play();
      document.removeEventListener('pointerdown', tryPlay);
      document.removeEventListener('keydown', tryPlay);
    };
    document.addEventListener('pointerdown', tryPlay);
    document.addEventListener('keydown', tryPlay);
  });
} else {
  // Se já existe, apenas garante que está tocando
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (window.globalAudio.paused) {
        window.globalAudio.play();
      }
    }, 600);
  });
}
