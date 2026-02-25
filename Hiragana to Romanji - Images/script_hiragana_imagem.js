// Jogo da Memória: Hiragana/Katakana e Imagem
(function() {
  // Banco de palavras em Hiragana
  const wordsHiragana = {
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
    Avancado: [
      { hiragana: "あかちゃん", romanji: "akachan", image: "imagens/akachan.png" },
      { hiragana: "いけばな", romanji: "ikebana", image: "imagens/ikebana.png" },
      { hiragana: "うみべ", romanji: "umibe", image: "imagens/umibe.png" },
      { hiragana: "えんとつ", romanji: "entotsu", image: "imagens/entotsu.png" },
      { hiragana: "おにぎり", romanji: "onigiri", image: "imagens/onigiri.png" },
      { hiragana: "かぼちゃ", romanji: "kabocha", image: "imagens/kabocha.png" },
      { hiragana: "きもの", romanji: "kimono", image: "imagens/kimono.png" },
      { hiragana: "くつした", romanji: "kutsushita", image: "imagens/kutsushita.png" },
      { hiragana: "けいと", romanji: "keito", image: "imagens/keito.png" },
      { hiragana: "こうえん", romanji: "kouen", image: "imagens/kouen.png" },
      { hiragana: "さくら", romanji: "sakura", image: "imagens/sakura.png" },
      { hiragana: "しんごう", romanji: "shingou", image: "imagens/shingou.png" },
      { hiragana: "すいか", romanji: "suika", image: "imagens/suika.png" },
      { hiragana: "せんぷうき", romanji: "senpuuki", image: "imagens/senpuuki.png" },
      { hiragana: "そで", romanji: "sode", image: "imagens/sode.png" },
      { hiragana: "たいや", romanji: "taiya", image: "imagens/taiya.png" },
      { hiragana: "つきよ", romanji: "tsukiyo", image: "imagens/tsukiyo.png" },
      { hiragana: "てぶくろ", romanji: "tebukuro", image: "imagens/tebukuro.png" },
      { hiragana: "とんぼ", romanji: "tonbo", image: "imagens/tonbo.png" },
      { hiragana: "なわとび", romanji: "nawatobi", image: "imagens/nawatobi.png" },
      { hiragana: "にわとり", romanji: "niwatori", image: "imagens/niwatori.png" },
      { hiragana: "ねっと", romanji: "netto", image: "imagens/netto.png" },
      { hiragana: "はしご", romanji: "hashigo", image: "imagens/hashigo.png" },
      { hiragana: "ひまわり", romanji: "himawari", image: "imagens/himawari.png" },
      { hiragana: "ふうせん", romanji: "fuusen", image: "imagens/fuusen.png" },
      { hiragana: "へや", romanji: "heya", image: "imagens/heya.png" },
      { hiragana: "ほたる", romanji: "hotaru", image: "imagens/hotaru.png" },
      { hiragana: "まくら", romanji: "makura", image: "imagens/makura.png" },
      { hiragana: "みずうみ", romanji: "mizuumi", image: "imagens/mizuumi.png" },
      { hiragana: "むすび", romanji: "musubi", image: "imagens/musubi.png" },
      { hiragana: "やかん", romanji: "yakan", image: "imagens/yakan.png" },
      { hiragana: "ゆうびん", romanji: "yuubin", image: "imagens/yuubin.png" },
      { hiragana: "よっと", romanji: "yotto", image: "imagens/yotto.png" }
    ]
  };

  // Banco de palavras em Katakana
  const wordsKatakana = {
    Basico: [
      { hiragana: "ネコ", image: "imagens/neko.png" },
      { hiragana: "イヌ", image: "imagens/inu.png" },
      { hiragana: "クマ", image: "imagens/kuma.png" },
      { hiragana: "トリ", image: "imagens/tori.png" },
      { hiragana: "ウミ", image: "imagens/umi.png" },
      { hiragana: "ヤマ", image: "imagens/yama.png" },
      { hiragana: "ソラ", image: "imagens/sora.png" },
      { hiragana: "ハナ", image: "imagens/hana.png" },
      { hiragana: "ツキ", image: "imagens/tsuki.png" },
      { hiragana: "ヒ", image: "imagens/hi.png" }
    ],
    Intermediario: [
      { hiragana: "サカナ", image: "imagens/sakana.png" },
      { hiragana: "リンゴ", image: "imagens/ringo.png" },
      { hiragana: "ミカン", image: "imagens/mikan.png" },
      { hiragana: "ウサギ", image: "imagens/usagi.png" },
      { hiragana: "デンシャ", image: "imagens/densha.png" },
      { hiragana: "クルマ", image: "imagens/kuruma.png" },
      { hiragana: "タマゴ", image: "imagens/tamago.png" },
      { hiragana: "ミズ", image: "imagens/mizu.png" },
      { hiragana: "オチャ", image: "imagens/ocha.png" },
      { hiragana: "ホン", image: "imagens/hon.png" }
    ],
    Avancado: [
      { hiragana: "アカチャン", romanji: "akachan", image: "imagens/akachan.png" },
      { hiragana: "イケバナ", romanji: "ikebana", image: "imagens/ikebana.png" },
      { hiragana: "ウミベ", romanji: "umibe", image: "imagens/umibe.png" },
      { hiragana: "エントツ", romanji: "entotsu", image: "imagens/entotsu.png" },
      { hiragana: "オニギリ", romanji: "onigiri", image: "imagens/onigiri.png" },
      { hiragana: "カボチャ", romanji: "kabocha", image: "imagens/kabocha.png" },
      { hiragana: "キモノ", romanji: "kimono", image: "imagens/kimono.png" },
      { hiragana: "クツシタ", romanji: "kutsushita", image: "imagens/kutsushita.png" },
      { hiragana: "ケイト", romanji: "keito", image: "imagens/keito.png" },
      { hiragana: "コウエン", romanji: "kouen", image: "imagens/kouen.png" },
      { hiragana: "サクラ", romanji: "sakura", image: "imagens/sakura.png" },
      { hiragana: "シンゴウ", romanji: "shingou", image: "imagens/shingou.png" },
      { hiragana: "スイカ", romanji: "suika", image: "imagens/suika.png" },
      { hiragana: "センプウキ", romanji: "senpuuki", image: "imagens/senpuuki.png" },
      { hiragana: "ソデ", romanji: "sode", image: "imagens/sode.png" },
      { hiragana: "タイヤ", romanji: "taiya", image: "imagens/taiya.png" },
      { hiragana: "ツキヨ", romanji: "tsukiyo", image: "imagens/tsukiyo.png" },
      { hiragana: "テブクロ", romanji: "tebukuro", image: "imagens/tebukuro.png" },
      { hiragana: "トンボ", romanji: "tonbo", image: "imagens/tonbo.png" },
      { hiragana: "ナワトビ", romanji: "nawatobi", image: "imagens/nawatobi.png" },
      { hiragana: "ニワトリ", romanji: "niwatori", image: "imagens/niwatori.png" },
      { hiragana: "ネット", romanji: "netto", image: "imagens/netto.png" },
      { hiragana: "ハシゴ", romanji: "hashigo", image: "imagens/hashigo.png" },
      { hiragana: "ヒマワリ", romanji: "himawari", image: "imagens/himawari.png" },
      { hiragana: "フウセン", romanji: "fuusen", image: "imagens/fuusen.png" },
      { hiragana: "ヘヤ", romanji: "heya", image: "imagens/heya.png" },
      { hiragana: "ホタル", romanji: "hotaru", image: "imagens/hotaru.png" },
      { hiragana: "マクラ", romanji: "makura", image: "imagens/makura.png" },
      { hiragana: "ミズウミ", romanji: "mizuumi", image: "imagens/mizuumi.png" },
      { hiragana: "ムスビ", romanji: "musubi", image: "imagens/musubi.png" },
      { hiragana: "ヤカン", romanji: "yakan", image: "imagens/yakan.png" },
      { hiragana: "ユウビン", romanji: "yuubin", image: "imagens/yuubin.png" },
      { hiragana: "ヨット", romanji: "yotto", image: "imagens/yotto.png" }
    ]
  };

  // Variável para armazenar o alfabeto atual
  let currentAlphabet = 'hiragana';
  let words = wordsHiragana;

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
    // Obter alfabeto selecionado
    const alphabetRadio = document.querySelector('input[name="alphabet"]:checked');
    currentAlphabet = alphabetRadio ? alphabetRadio.value : 'hiragana';
    
    // Definir conjunto de palavras conforme o alfabeto
    let availableWords = [];
    
    if (currentAlphabet === 'expert') {
      // Modo Expert: mistura TODAS as palavras de ambos os alfabetos
      const allHiragana = [...wordsHiragana.Basico, ...wordsHiragana.Intermediario, ...wordsHiragana.Avancado];
      const allKatakana = [...wordsKatakana.Basico, ...wordsKatakana.Intermediario, ...wordsKatakana.Avancado];
      availableWords = [...allHiragana, ...allKatakana];
    } else {
      // Modo Hiragana ou Katakana: usa a dificuldade selecionada
      const checked = document.querySelector('.setCheck:checked');
      let difficulty = checked ? checked.value : 'Basico';
      words = currentAlphabet === 'hiragana' ? wordsHiragana : wordsKatakana;
      availableWords = [...words[difficulty]];
    }
    
    const pairCount = parseInt(document.getElementById('pairCount').value, 10);
    let maxPairs = pairCount / 2;
    let selectedWords = [];
    
    // Se precisar de mais pares do que há disponível, repetir de forma aleatória
    if (maxPairs <= availableWords.length) {
      selectedWords = shuffle(availableWords).slice(0, maxPairs);
    } else {
      // Usar todas as palavras disponíveis primeiro
      selectedWords = [...availableWords];
      const remaining = maxPairs - availableWords.length;
      
      // Completar com repetições aleatórias
      for (let i = 0; i < remaining; i++) {
        const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        selectedWords.push(randomWord);
      }
      
      // Embaralhar para distribuir as repetições
      selectedWords = shuffle(selectedWords);
    }
    
    // Limpar mensagem de erro anterior
    document.getElementById('errorMessage').textContent = '';

    // Criar cartas: cada par = 1 carta hiragana + 1 carta imagem
    let cards = [];
    selectedWords.forEach(word => {
      // Define tamanho da fonte conforme número de caracteres (ajustado para cards 52x52)
      let fontSize = '0.9em';
      if (word.hiragana.length === 1) fontSize = '1.3em';
      else if (word.hiragana.length === 2) fontSize = '1.0em';
      else if (word.hiragana.length === 3) fontSize = '0.8em';
      else if (word.hiragana.length === 4) fontSize = '0.65em';
      else if (word.hiragana.length >= 5) fontSize = '0.5em';
      // Adiciona carta hiragana com estilo inline
      cards.push({ type: 'hiragana', value: word.hiragana, pairId: word.hiragana, fontSize });
      cards.push({ type: 'imagem', value: `<img src='${word.image}' alt='${word.hiragana}' class='img-card'>`, pairId: word.hiragana });
    });
    // Embaralha as cartas (não precisa de slice pois selectedWords já tem exatamente maxPairs palavras)
    cards = shuffle(cards);

    // Renderizar tabuleiro
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';

    // Definir grid do tabuleiro de forma mais simétrica e responsiva
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
    
    // Exibir modo conforme o alfabeto
    let modeDisplay = '';
    if (currentAlphabet === 'expert') {
      modeDisplay = 'Expert (Misturado 🔥)';
    } else {
      const modeLabels = {
        Basico: 'Básico',
        Intermediario: 'Intermediário',
        Avancado: 'Avançado'
      };
      const alphabetLabel = currentAlphabet === 'hiragana' ? 'Hiragana' : 'Katakana';
      const checked = document.querySelector('.setCheck:checked');
      const difficulty = checked ? checked.value : 'Basico';
      modeDisplay = `${alphabetLabel} - ${modeLabels[difficulty] || 'Básico'}`;
    }
    document.getElementById('modeInfo').textContent = modeDisplay;

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
    window.totalPairs = maxPairs; // Armazena total de pares esperado
  };



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

  // Listener para alternar alfabeto e desabilitar dificuldade no modo Expert
  const alphabetRadios = document.querySelectorAll('input[name="alphabet"]');
  alphabetRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      const isExpertMode = this.value === 'expert';
      checkboxes.forEach(cb => {
        cb.disabled = isExpertMode;
        cb.parentElement.style.opacity = isExpertMode ? '0.5' : '1';
        cb.parentElement.style.cursor = isExpertMode ? 'not-allowed' : 'pointer';
      });
    });
  });

  // Seleciona o modo básico por padrão ao abrir o menu
  const basicoCheckbox = document.querySelector('.setCheck[value="Basico"]');
  if (basicoCheckbox) basicoCheckbox.checked = true;

  // Torna obrigatório selecionar uma dificuldade antes de iniciar o jogo (exceto no modo Expert)
  document.querySelector('.start-game-btn').onclick = function() {
    const alphabetRadio = document.querySelector('input[name="alphabet"]:checked');
    const isExpertMode = alphabetRadio && alphabetRadio.value === 'expert';
    
    // No modo Expert, não precisa de dificuldade selecionada
    if (!isExpertMode) {
      const checked = document.querySelector('.setCheck:checked');
      if (!checked) {
        alert('Selecione um modo de dificuldade antes de iniciar o jogo!');
        return;
      }
    }
    
    // Pré-carrega imagens e só inicia o jogo após todas carregarem
    preloadImages().then(() => {
      document.querySelector('h1').style.display = 'none';
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
      if (matches === window.totalPairs) {
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
    document.querySelector('h1').style.display = 'block';
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

  document.getElementById('playAgainBtn').onclick = function() {
    document.getElementById('winModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    window.startGame();
  };

  const menuPrincipalBtn = document.getElementById('menuPrincipalBtn');
  if (menuPrincipalBtn) {
    menuPrincipalBtn.onclick = function() {
      window.returnToMenu();
    };
  }

})();
