// Encapsulamento de todo o código JS em um IIFE para evitar poluir o escopo global
(function() {
  // Banco de palavras e lógica do jogo movidos do HTML para cá
  const words = {
basic: [
  { hiragana: "ねこ", romanji: "neko", image: "imagens/neko.png" },        // gato
  { hiragana: "いぬ", romanji: "inu", image: "imagens/inu.png" },          // cachorro
  { hiragana: "くま", romanji: "kuma", image: "imagens/kuma.png" },        // urso
  { hiragana: "とり", romanji: "tori", image: "imagens/tori.png" },        // pássaro
  { hiragana: "うみ", romanji: "umi", image: "imagens/umi.png" },          // mar
  { hiragana: "やま", romanji: "yama", image: "imagens/yama.png" },        // montanha
  { hiragana: "そら", romanji: "sora", image: "imagens/sora.png" },        // céu
  { hiragana: "はな", romanji: "hana", image: "imagens/hana.png" },        // flor
  { hiragana: "つき", romanji: "tsuki", image: "imagens/tsuki.png" },      // lua
  { hiragana: "ひ", romanji: "hi", image: "imagens/hi.png" },              // sol / fogo
  { hiragana: "かさ", romanji: "kasa", image: "imagens/kasa.png" },        // guarda-chuva
  { hiragana: "かめ", romanji: "kame", image: "imagens/kame.png" },        // tartaruga
  { hiragana: "いす", romanji: "isu", image: "imagens/isu.png" }           // cadeira
],
 intermediate: [
  { hiragana: "さかな", romanji: "sakana", image: "imagens/sakana.png" },     // peixe
  { hiragana: "りんご", romanji: "ringo", image: "imagens/ringo.png" },       // maçã
  { hiragana: "みかん", romanji: "mikan", image: "imagens/mikan.png" },       // laranja
  { hiragana: "うさぎ", romanji: "usagi", image: "imagens/usagi.png" },       // coelho
  { hiragana: "でんしゃ", romanji: "densha", image: "imagens/densha.png" },   // trem
  { hiragana: "くるま", romanji: "kuruma", image: "imagens/kuruma.png" },     // carro
  { hiragana: "たまご", romanji: "tamago", image: "imagens/tamago.png" },     // ovo
  { hiragana: "みず", romanji: "mizu", image: "imagens/mizu.png" },        // água
  { hiragana: "おちゃ", romanji: "ocha", image: "imagens/ocha.png" },         // chá verde
  { hiragana: "ほん", romanji: "hon", image: "imagens/hon.png" },             // livro
  { hiragana: "つくえ", romanji: "tsukue", image: "imagens/tsukue.png" },     // mesa
  { hiragana: "でんわ", romanji: "denwa", image: "imagens/denwa.png" },       // telefone
  { hiragana: "かばん", romanji: "kaban", image: "imagens/kaban.png" }        // bolsa/mochila
],
    advanced: [
      { hiragana: "こんにちは", romanji: "konnichiwa", image: "imagens/konnichiwa.png" },
      { hiragana: "ありがとう", romanji: "arigatou", image: "imagens/arigatou.png" },
      { hiragana: "さようなら", romanji: "sayounara", image: "imagens/sayounara.png" },
      { hiragana: "おはよう", romanji: "ohayou", image: "imagens/ohayou.png" },
      { hiragana: "いってきます", romanji: "itterasshai", image: "imagens/itterasshai.png" },
      { hiragana: "おやすみ", romanji: "oyasumi", image: "imagens/oyasumi.png" },
      { hiragana: "すみません", romanji: "sumimasen", image: "imagens/sumimasen.png" },
      { hiragana: "おねがいします", romanji: "onegaishimasu", image: "imagens/onegaishimasu.png" },
      { hiragana: "はじめまして", romanji: "hajimemashite", image: "imagens/hajimemashite.png" },
      { hiragana: "いらっしゃい", romanji: "irasshai", image: "imagens/irasshai.png" }
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

  function preloadAllImages() {
    const loaded = new Set();
    Object.values(words).flat().forEach(word => {
      if (!loaded.has(word.image)) {
        const img = new Image();
        img.src = word.image;
        img.onerror = () => console.warn(`Imagem não encontrada: ${word.image}`);
        loaded.add(word.image);
      }
    });
  }

  // Inicializa o estado da página ao carregar
  function initializePage() {
    const winModal = document.getElementById("winModal");
    const modalOverlay = document.getElementById("modalOverlay");
    winModal.style.display = "none";
    modalOverlay.style.display = "none";
    winModal.setAttribute('aria-hidden', 'true');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.querySelector('.menu').style.display = 'block';
    document.querySelector('.game-controls').style.display = 'none';
    document.getElementById("gameContainer").style.display = 'none';

    // Inicializa os textos dos botões de música e tema
    initializeButtonLabels();
  }

  // Função para inicializar os textos dos botões com base no estado atual
  function initializeButtonLabels() {
    // Tema
    const isDarkMode = document.body.classList.contains('dark-mode');
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.textContent = isDarkMode ? "Modo Claro" : "Modo Escuro";
      console.log('Botão de tema encontrado:', btn.textContent); // Depuração
    });

    // Música
    document.querySelectorAll('.music-toggle-btn').forEach(btn => {
      btn.textContent = isMusicPlaying ? "Pausar Música" : "Retomar Música";
      console.log('Botão de música encontrado:', btn.textContent); // Depuração
    });
  }

  window.addEventListener('load', () => {
    initializePage();
    preloadAllImages();
    backgroundMusic.play().catch(() => {});
  });

  document.addEventListener('click', () => {
    backgroundMusic.play().catch(() => {});
  }, { once: true });

  let isMusicPlaying = true;
  function toggleMusic() {
    clickSound.play();
    if (isMusicPlaying) {
      backgroundMusic.pause();
      isMusicPlaying = false;
    } else {
      backgroundMusic.play().catch(() => {});
      isMusicPlaying = true;
    }
    initializeButtonLabels(); // Atualiza os textos dos botões
  }

  function toggleTheme() {
    clickSound.play();
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    initializeButtonLabels(); // Atualiza os textos dos botões
  }

  // Ajuste na inicialização do tema para refletir o estado salvo
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }

  // Variáveis de estado do jogo
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matchesFound = 0;
  let totalPairs = 0;
  let startTime = 0;
  let attempts = 0;
  let timerInterval = null;

  // Utilitário para embaralhar arrays
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Atualiza o tempo na tela (agora não faz nada durante o jogo)
  function updateTime() {
    // Não atualiza mais nada na tela durante o jogo
  }

  // Inicia o jogo
  window.startGame = function() {
    console.log("startGame chamado!");
    clickSound.play();
    // Esconde o título ao iniciar o jogo
    document.querySelector('h1').style.display = 'none';
    const difficulty = document.getElementById("difficulty").value;
    const pairCount = parseInt(document.getElementById("pairCount").value);
    const gameContainer = document.getElementById("gameContainer");
    const winModal = document.getElementById("winModal");
    const modalOverlay = document.getElementById("modalOverlay");

    winModal.style.display = "none";
    modalOverlay.style.display = "none";
    winModal.setAttribute('aria-hidden', 'true');
    modalOverlay.setAttribute('aria-hidden', 'true');
    gameContainer.style.display = "none";

    if (![10, 15, 20].includes(pairCount)) {
      console.error("Número de pares inválido:", pairCount);
      return;
    }

    let wordSet = words[difficulty];
    let selectedWords = [];
    if (wordSet.length < pairCount) {
      while (selectedWords.length < pairCount) {
        const randomWord = wordSet[Math.floor(Math.random() * wordSet.length)];
        selectedWords.push(randomWord);
      }
      selectedWords = shuffle(selectedWords);
    } else {
      selectedWords = shuffle(wordSet.slice(0, pairCount));
    }

    // Criação das cartas
    const cards = [];
    selectedWords.forEach(word => {
      cards.push({ type: "hiragana", value: word.hiragana, pairId: word.hiragana });
      cards.push({ type: "romanji", value: `<div class="image-container"><img src="${word.image}" alt="${word.romanji}"></div><span>${word.romanji}</span>`, pairId: word.hiragana });
    });

    const shuffledCards = shuffle(cards);
    const gameBoard = document.getElementById("gameBoard");
    const totalCards = pairCount * 2;
    const columns = Math.min(Math.ceil(Math.sqrt(totalCards)), 6);
    const rows = Math.ceil(totalCards / columns);
    gameBoard.style.gridTemplateColumns = `repeat(${columns}, minmax(60px, 1fr))`;
    gameBoard.style.gridTemplateRows = `repeat(${rows}, minmax(60px, 1fr))`;
    gameBoard.setAttribute('data-cards', totalCards);
    gameBoard.innerHTML = "";
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matchesFound = 0;
    attempts = 0;
    totalPairs = pairCount;
    startTime = Date.now();

    // Otimização: usar DocumentFragment para renderizar as cartas
    const fragment = document.createDocumentFragment();
    shuffledCards.forEach((card, index) => {
      const cardElement = document.createElement("div");
      cardElement.classList.add("card");
      cardElement.dataset.type = card.type;
      cardElement.dataset.pairId = card.pairId;
      cardElement.dataset.value = card.value;
      cardElement.innerHTML = "?";
      cardElement.addEventListener("click", () => flipCard(cardElement));
      fragment.appendChild(cardElement);
    });
    gameBoard.appendChild(fragment);

    document.querySelector('.menu').style.display = 'none';
    document.querySelector('.game-controls').style.display = 'flex';
    gameContainer.style.display = 'flex';
    initializeButtonLabels(); // Atualiza os textos dos botões nos controles do jogo
  };

  // Retorna ao menu
  window.returnToMenu = function() {
    console.log("returnToMenu chamado!");
    clickSound.play();
    // Exibe o título ao retornar ao menu
    document.querySelector('h1').style.display = 'block';
    document.querySelector('.menu').style.display = 'block';
    document.querySelector('.game-controls').style.display = 'none';
    document.getElementById("gameContainer").style.display = 'none';
    document.getElementById("winModal").style.display = 'none';
    document.getElementById("modalOverlay").style.display = 'none';
    document.getElementById("winModal").setAttribute('aria-hidden', 'true');
    document.getElementById("modalOverlay").setAttribute('aria-hidden', 'true');
    if (timerInterval) clearInterval(timerInterval);
    initializeButtonLabels(); // Atualiza os textos dos botões no menu
  };

  // Lógica de virar carta
  function flipCard(card) {
    if (lockBoard || card === firstCard || card.classList.contains("matched")) return;
    flipSound.play();
    card.classList.add("flipped");
    card.innerHTML = card.dataset.type === "hiragana" ? card.dataset.pairId : card.dataset.value;
    if (!firstCard) {
      firstCard = card;
      return;
    }
    secondCard = card;
    lockBoard = true;
    attempts++;
    checkMatch();
  }

  // Checa se houve match
  function checkMatch() {
    const isMatch = firstCard.dataset.pairId === secondCard.dataset.pairId &&
      ((firstCard.dataset.type === "hiragana" && secondCard.dataset.type === "romanji") ||
        (secondCard.dataset.type === "hiragana" && firstCard.dataset.type === "romanji"));
    if (isMatch) {
      matchSound.play();
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");
      matchesFound++;
      setTimeout(() => {
        resetTurn();
        if (matchesFound === totalPairs) {
          const endTime = Date.now();
          const timeTaken = (endTime - startTime) / 1000;
          const minutes = Math.floor(timeTaken / 60);
          const seconds = Math.round(timeTaken % 60);
          const winModal = document.getElementById("winModal");
          const modalOverlay = document.getElementById("modalOverlay");
          document.getElementById("winMessage").textContent = `Você completou o jogo!`;
          document.getElementById("finalStats").innerHTML =
            `<p><strong>Tempo:</strong> ${minutes} min ${seconds} seg</p>` +
            `<p><strong>Tentativas:</strong> ${attempts}</p>` +
            `<p><strong>Acertos:</strong> ${matchesFound}</p>`;
          winModal.style.display = "block";
          modalOverlay.style.display = "block";
          winModal.setAttribute('aria-hidden', 'false');
          modalOverlay.setAttribute('aria-hidden', 'false');
          // Foco automático no botão "Jogar Novamente"
          document.getElementById("playAgainBtn").focus();
          winSound.play();
          if (timerInterval) clearInterval(timerInterval);
        }
      }, 200);
    } else {
      errorSound.play();
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        firstCard.innerHTML = "?";
        secondCard.innerHTML = "?";
        resetTurn();
      }, 800);
    }
  }

  // Reseta o turno
  function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
  }

  // Expor funções globais necessárias
  window.toggleMusic = toggleMusic;
  window.toggleTheme = toggleTheme;
})();