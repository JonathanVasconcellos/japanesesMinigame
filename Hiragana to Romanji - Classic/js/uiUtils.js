// Utilitários de interface
(function() {
  window.toggleTheme = function() {
    if (window.getClickSound) window.getClickSound().play();
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => btn.textContent = isDarkMode ? "Modo Claro" : "Modo Escuro");
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  };

  // Carregar tema salvo
  document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
      document.querySelectorAll('.theme-toggle-btn').forEach(btn => btn.textContent = "Modo Claro");
    }

    // Delegação global para botões de música e tema
    document.body.addEventListener('click', function(e) {
      if (e.target.classList.contains('music-toggle-btn')) {
        if (window.toggleMusic) window.toggleMusic();
      } else if (e.target.classList.contains('theme-toggle-btn')) {
        if (window.toggleTheme) window.toggleTheme();
      }
    });
  });
})();
