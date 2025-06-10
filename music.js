// Script para música de fundo global
// Usa window.globalAudio para manter a música entre páginas
if (!window.globalAudio) {
  const audio = new Audio('Hiragana to Romanji - Images/audios/background.mp3');
  audio.loop = true;
  audio.volume = 0.5; // Volume padrão direto, sem fade-in
  window.globalAudio = audio;
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      audio.play();
    }, 600);
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
