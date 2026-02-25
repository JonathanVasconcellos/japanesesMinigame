// Script de Debug - Monitoramento de Tamanho dos Cards
// Cole este código no console do navegador para monitorar os cards em tempo real

(function() {
  console.clear();
  console.log('%c🔍 Monitor de Tamanho dos Cards ATIVADO', 'color: #ff5555; font-size: 16px; font-weight: bold;');
  console.log('%cClique nos cards para ver suas dimensões em tempo real', 'color: #4a9eff; font-size: 12px;');
  console.log('---');

  // Função para obter dimensões de um elemento
  function getDimensions(element) {
    const rect = element.getBoundingClientRect();
    const computed = window.getComputedStyle(element);
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      minWidth: computed.minWidth,
      maxWidth: computed.maxWidth,
      minHeight: computed.minHeight,
      maxHeight: computed.maxHeight,
      aspectRatio: computed.aspectRatio
    };
  }

  // Monitora todos os cards existentes
  function monitorCards() {
    const cards = document.querySelectorAll('.card');
    
    if (cards.length === 0) {
      console.log('%c⚠️ Nenhum card encontrado ainda. Inicie o jogo!', 'color: orange;');
      return;
    }

    console.log(`%c📊 Total de cards: ${cards.length}`, 'color: #4a9eff; font-weight: bold;');
    
    const dimensions = [];
    cards.forEach((card, index) => {
      const dim = getDimensions(card);
      dimensions.push(dim);
      
      const type = card.dataset.type || 'texto';
      const hasImage = card.querySelector('img') !== null;
      const hasHiragana = card.querySelector('.hiragana-card') !== null;
      
      console.log(
        `Card ${index + 1} [${type}] ${hasImage ? '🖼️' : hasHiragana ? '📝' : '❓'}: ` +
        `${dim.width}x${dim.height}px ` +
        `(min: ${dim.minWidth}×${dim.minHeight}, max: ${dim.maxWidth}×${dim.maxHeight})`
      );
    });

    // Verifica se todos têm o mesmo tamanho
    const allSameWidth = dimensions.every(d => d.width === dimensions[0].width);
    const allSameHeight = dimensions.every(d => d.height === dimensions[0].height);
    
    if (allSameWidth && allSameHeight) {
      console.log('%c✅ Todos os cards têm o MESMO TAMANHO!', 'color: #4a9a4a; font-weight: bold;');
    } else {
      console.log('%c⚠️ Cards com TAMANHOS DIFERENTES encontrados!', 'color: orange; font-weight: bold;');
      const widths = [...new Set(dimensions.map(d => d.width))];
      const heights = [...new Set(dimensions.map(d => d.height))];
      console.log(`  Larguras únicas: ${widths.join(', ')}px`);
      console.log(`  Alturas únicas: ${heights.join(', ')}px`);
    }
    
    console.log('---');
  }

  // Monitora mudanças no DOM
  const observer = new MutationObserver(() => {
    console.log('%c🔄 Mudança detectada no tabuleiro', 'color: #4a9eff;');
    setTimeout(monitorCards, 100);
  });

  // Observa o gameBoard quando ele existir
  function startObserving() {
    const gameBoard = document.getElementById('gameBoard');
    if (gameBoard) {
      observer.observe(gameBoard, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
      console.log('%c👀 Observando mudanças no tabuleiro...', 'color: #4a9eff;');
      monitorCards();
    } else {
      setTimeout(startObserving, 500);
    }
  }

  startObserving();

  // Adiciona listener de clique nos cards
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) {
      const dim = getDimensions(card);
      const index = Array.from(document.querySelectorAll('.card')).indexOf(card);
      console.log(
        `%c🎯 Card clicado #${index + 1}:`,
        'color: #ff5555; font-weight: bold;',
        `\n  Dimensões: ${dim.width}x${dim.height}px`,
        `\n  Min: ${dim.minWidth} × ${dim.minHeight}`,
        `\n  Max: ${dim.maxWidth} × ${dim.maxHeight}`,
        `\n  Aspect Ratio: ${dim.aspectRatio}`,
        `\n  Tipo: ${card.dataset.type || 'desconhecido'}`,
        `\n  Classes: ${card.className}`
      );
    }
  });

  // Comando manual para re-verificar
  window.checkCardSizes = monitorCards;
  console.log('%c💡 Dica: Digite checkCardSizes() no console para verificar novamente', 'color: #888; font-style: italic;');

})();
