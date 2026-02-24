// Utilitários de interface
(function() {
  // Delegação global para botões de música
  document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(e) {
      if (e.target.classList.contains('music-toggle-btn')) {
        if (window.toggleMusic) window.toggleMusic();
      }
    });
  });
})();
