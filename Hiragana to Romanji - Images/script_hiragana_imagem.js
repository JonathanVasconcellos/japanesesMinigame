// Jogo da Memória: Hiragana e Imagem
(function() {
  // Banco de palavras por dificuldade
  const words = {
    Basico: [
      { hiragana: "ねこ", image: "imagens/neko.png" },
      { hiragana: "いぬ", image: "imagens/inu.png" },
      { hiragana: "くま", image: "imagens/kuma.png" },
      { hiragana: "とり", image: "imagens/tori.png" },
      { hiragana: "うみ", image: "imagens/umi.png" },
      { hiragana: "やま", image: "imagens/yama.png" },
      { hiragana: "そら", image: "imagens/sora.png" },
      { hiragana: "はな", image: "imagens/hana.png" },
      { hiragana: "つき", image: "imagens/tsuki.png" },
      { hiragana: "ひ", image: "imagens/hi.png" }
    ],
    Intermediario: [
      { hiragana: "さかな", image: "imagens/sakana.png" },
      { hiragana: "りんご", image: "imagens/ringo.png" },
      { hiragana: "みかん", image: "imagens/mikan.png" },
      { hiragana: "うさぎ", image: "imagens/usagi.png" },
      { hiragana: "でんしゃ", image: "imagens/densha.png" },
      { hiragana: "くるま", image: "imagens/kuruma.png" },
      { hiragana: "たまご", image: "imagens/tamago.png" },
      { hiragana: "みず", image: "imagens/mizu.png" },
      { hiragana: "おちゃ", image: "imagens/ocha.png" },
      { hiragana: "ほん", image: "imagens/hon.png" }
    ],
    advanced: [
      { hiragana: "こんにちは", image: "imagens/konnichiwa.png" },
      { hiragana: "ありがとう", image: "imagens/arigatou.png" },
      { hiragana: "さようなら", image: "imagens/sayounara.png" },
      { hiragana: "おはよう", image: "imagens/ohayou.png" },
      { hiragana: "いってきます", image: "imagens/itterasshai.png" },
      { hiragana: "おやすみ", image: "imagens/oyasumi.png" },
      { hiragana: "すみません", image: "imagens/sumimasen.png" },
      { hiragana: "おねがいします", image: "imagens/onegaishimasu.png" },
      { hiragana: "はじめまして", image: "imagens/hajimemashite.png" },
      { hiragana: "いらっしゃい", image: "imagens/irasshai.png" }
    ]
  };

  // Sons
  const flipSound = new Audio("audios/flip.mp3");
  const matchSound = new Audio("audios/match.mp3");
  const errorSound = new Audio("audios/error.mp3");
  const winSound = new Audio("audios/win.mp3");
  const clickSound = new Audio("audios/click.mp3");
  const backgroundMusic = new Audio("audios/background.mp3");
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.3;

  // Função para embaralhar array
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Timer
  let timerInterval = null, startTime = 0;

  // Função para pré-carregar todas as imagens (agora síncrono com Promise)
  function preloadImages() {
    const loaded = new Set();
    const images = Object.values(words).flat().map(word => word.image);
    const uniqueImages = [...new Set(images)];
    return Promise.all(uniqueImages.map(src => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // ignora erro, não trava
        img.src = src;
      });
    }));
  }

  // Função para iniciar o jogo
  window.startGame = function() {
    // Obter dificuldade e quantidade de pares
    const checked = document.querySelector('.setCheck:checked');
    let difficulty = checked ? checked.value : 'basic';
    const pairCount = parseInt(document.getElementById('pairCount').value, 10);
    // Corrige bug: garantir que o número de pares seja metade do número de cartas
    let maxPairs = pairCount / 2;
    const selectedWords = shuffle([...words[difficulty]]).slice(0, maxPairs);

    // Criar cartas: cada par = 1 carta hiragana + 1 carta imagem
    let cards = [];
    selectedWords.forEach(word => {
      // Define tamanho da fonte conforme número de caracteres
      let fontSize = '1.3em';
      if (word.hiragana.length === 1) fontSize = '2.0em';
      else if (word.hiragana.length === 2) fontSize = '1.8em';
      // Adiciona carta hiragana com estilo inline
      cards.push({ type: 'hiragana', value: word.hiragana, pairId: word.hiragana, fontSize });
      cards.push({ type: 'imagem', value: `<img src='${word.image}' alt='${word.hiragana}' class='img-card'>`, pairId: word.hiragana });
    });
    // Garante que o número de cartas seja igual ao selecionado
    cards = shuffle(cards).slice(0, pairCount);

    // Renderizar tabuleiro
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';

    // Definir grid do tabuleiro
    let columns = Math.ceil(Math.sqrt(cards.length));
    let rows = Math.ceil(cards.length / columns);
    if (cards.length === 8) { columns = 4; rows = 2; }
    else if (cards.length === 16) { columns = 4; rows = 4; }
    else if (cards.length === 20) { columns = 5; rows = 4; }
    else if (cards.length === 30) { columns = 6; rows = 5; }
    gameBoard.style.display = 'grid';
    gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    cards.forEach((card, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.dataset.pairId = card.pairId;
      cardEl.dataset.type = card.type;
      // Salva o conteúdo real da carta para uso posterior
      if (card.type === 'hiragana') {
        cardEl.dataset.realContent = `<span class='hiragana-card' style='font-size:${card.fontSize};'>${card.value}</span>`;
      } else {
        cardEl.dataset.realContent = `<div class='img-card-wrap'>${card.value}</div>`;
      }
      // Estado inicial: carta virada para baixo
      cardEl.innerHTML = '<span>?</span>';
      cardEl.onclick = () => flipCard(cardEl);
      gameBoard.appendChild(cardEl);
    });

    // Resetar estatísticas
    document.getElementById('attempts').textContent = '0';
    document.getElementById('matches').textContent = '0';
    document.getElementById('timeElapsed').textContent = '0 min 0 seg';
    document.getElementById('modeInfo').textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    // Timer
    if (timerInterval) clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const min = Math.floor(elapsed / 60);
      const sec = elapsed % 60;
      document.getElementById('timeElapsed').textContent = `${min} min ${sec} seg`;
    }, 1000);

    firstCard = null;
    secondCard = null;
    lockBoard = false;
    attempts = 0;
    matches = 0;
  };

  // Desativa o modo avançado
  const advancedCheckbox = document.querySelector('.setCheck[value="advanced"]');
  if (advancedCheckbox) {
    advancedCheckbox.disabled = true;
    advancedCheckbox.parentElement.style.opacity = '0.5';
    advancedCheckbox.parentElement.title = 'Modo avançado desativado temporariamente';
  }

  // Seleção única de dificuldade
  const checkboxes = document.querySelectorAll('.setCheck');
  checkboxes.forEach(cb => {
    cb.onclick = function(e) {
      // Se já está marcado, impede desmarcar
      if (cb.checked === false) {
        e.preventDefault();
        return false;
      }
      // Marca apenas este e desmarca os outros
      checkboxes.forEach(other => { if (other !== cb) other.checked = false; });
    };
  });

  // Seleciona o modo básico por padrão ao abrir o menu
  const basicoCheckbox = document.querySelector('.setCheck[value="Basico"]');
  if (basicoCheckbox) basicoCheckbox.checked = true;

  // Torna obrigatório selecionar uma dificuldade antes de iniciar o jogo
  document.querySelector('.start-game-btn').onclick = function() {
    const checked = document.querySelector('.setCheck:checked');
    if (!checked) {
      alert('Selecione um modo de dificuldade antes de iniciar o jogo!');
      return;
    }
    // Pré-carrega imagens e só inicia o jogo após todas carregarem
    preloadImages().then(() => {
      document.querySelector('.menu').style.display = 'none';
      document.getElementById('gameContainer').style.display = 'flex';
      document.querySelector('.game-controls').style.display = 'flex';
      window.startGame();
    });
  };

  // Função para virar carta
  let firstCard = null, secondCard = null, lockBoard = false, attempts = 0, matches = 0;
  function flipCard(card) {
    if (lockBoard || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    flipSound.play();
    // Revela conteúdo salvo no elemento
    card.innerHTML = card.dataset.realContent;
    if (!firstCard) {
      firstCard = card;
      return;
    }
    secondCard = card;
    attempts++;
    document.getElementById('attempts').textContent = attempts;
    checkMatch();
  }

  // Checar se as cartas formam par
  function checkMatch() {
    if (!firstCard || !secondCard) return;
    lockBoard = true;
    if (firstCard.dataset.pairId === secondCard.dataset.pairId && firstCard.dataset.type !== secondCard.dataset.type) {
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');
      matches++;
      document.getElementById('matches').textContent = matches;
      matchSound.play();
      if (matches === document.getElementById('gameBoard').children.length / 2) {
        winSound.play();
        showWinModal();
        if (timerInterval) clearInterval(timerInterval);
      }
    } else {
      errorSound.play();
      setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        firstCard.innerHTML = '<span>?</span>';
        secondCard.innerHTML = '<span>?</span>';
        firstCard = null;
        secondCard = null;
        lockBoard = false;
      }, 1000);
      return;
    }
    firstCard = null;
    secondCard = null;
    lockBoard = false;
  }

  // Modal de vitória
  function showWinModal() {
    document.getElementById('winMessage').textContent = 'Você completou o jogo!';
    document.getElementById('finalStats').innerHTML = `<p>Tentativas: ${attempts}</p><p>Acertos: ${matches}</p>`;
    document.getElementById('winModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
  }

  window.returnToMenu = function() {
    document.getElementById('gameContainer').style.display = 'none';
    document.querySelector('.menu').style.display = 'block';
    document.querySelector('.game-controls').style.display = 'none';
    document.getElementById('winModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    // ...resetar estado...
  };

  // Corrige o botão voltar ao menu
  const returnMenuBtns = document.querySelectorAll('.return-menu-btn');
  returnMenuBtns.forEach(btn => {
    btn.onclick = function() {
      window.returnToMenu();
    };
  });

  document.querySelector('.start-game-btn').onclick = function() {
    preloadImages();
    document.querySelector('.menu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
    document.querySelector('.game-controls').style.display = 'flex';
    window.startGame();
  };

  document.getElementById('playAgainBtn').onclick = function() {
    document.getElementById('winModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    window.startGame();
  };

  // Modo escuro
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.onclick = function() {
      document.body.classList.toggle('dark-mode');
      btn.textContent = document.body.classList.contains('dark-mode') ? 'Modo Claro' : 'Modo Escuro';
      localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    };
    // Estado inicial do texto
    btn.textContent = document.body.classList.contains('dark-mode') ? 'Modo Claro' : 'Modo Escuro';
  });

  // Carregar tema salvo
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => btn.textContent = 'Modo Claro');
  }
})();
