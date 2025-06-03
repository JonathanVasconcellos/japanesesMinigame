// Encapsulamento de todo o código JS em um IIFE para evitar poluir o escopo global
(function() {
  // Conjuntos de caracteres Hiragana e Romanji
  const sets = {
    vowels: [["あ", "a"], ["い", "i"], ["う", "u"], ["え", "e"], ["お", "o"]],
    kSeries: [["か", "ka"], ["き", "ki"], ["く", "ku"], ["け", "ke"], ["こ", "ko"]],
    sSeries: [["さ", "sa"], ["し", "shi"], ["す", "su"], ["せ", "se"], ["そ", "so"]],
    tSeries: [["た", "ta"], ["ち", "chi"], ["つ", "tsu"], ["て", "te"], ["と", "to"]],
    nSeries: [["な", "na"], ["に", "ni"], ["ぬ", "nu"], ["ね", "ne"], ["の", "no"]],
    hSeries: [["は", "ha"], ["ひ", "hi"], ["ふ", "fu"], ["へ", "he"], ["ほ", "ho"]],
    mSeries: [["ま", "ma"], ["み", "mi"], ["む", "mu"], ["め", "me"], ["も", "mo"]],
    ySeries: [["や", "ya"], ["ゆ", "yu"], ["よ", "yo"]],
    rSeries: [["ら", "ra"], ["り", "ri"], ["る", "ru"], ["れ", "re"], ["ろ", "ro"]],
    wSeries: [["わ", "wa"], ["を", "wo"]],
    nFinal: [["ん", "n"]]
  };
  const setNames = {
    vowels: "Vogais",
    kSeries: "Série K",
    sSeries: "Série S",
    tSeries: "Série T",
    nSeries: "Série N",
    hSeries: "Série H",
    mSeries: "Série M",
    ySeries: "Série Y",
    rSeries: "Série R",
    wSeries: "Série W",
    nFinal: "N Final"
  };
  // Sons
  const flipSound = new Audio("Sound/flip.mp3");
  const matchSound = new Audio("Sound/match.mp3");
  const errorSound = new Audio("Sound/error.mp3");
  const winSound = new Audio("Sound/win.mp3");
  const clickSound = new Audio("Sound/click.mp3");
  const backgroundMusic = new Audio("Sound/background.mp3");
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.3;
  // Música automática
  window.addEventListener('load', () => {
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
      document.querySelectorAll('.music-toggle-btn').forEach(btn => btn.textContent = "Retomar Música");
      isMusicPlaying = false;
    } else {
      backgroundMusic.play().catch(() => {});
      document.querySelectorAll('.music-toggle-btn').forEach(btn => btn.textContent = "Pausar Música");
      isMusicPlaying = true;
    }
  }
  function toggleTheme() {
    clickSound.play();
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => btn.textContent = isDarkMode ? "Modo Claro" : "Modo Escuro");
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }
  // Carregar tema salvo
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => btn.textContent = "Modo Claro");
  }
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matchesFound = 0;
  let totalPairs = 0;
  let startTime = 0;
  let attempts = 0;
  let timerInterval = null;
  // Estado do treino
  let trainingHits = 0;
  let trainingErrors = 0;
  let trainingTotal = 0;
  let currentTrainingChar = null;
  let lastTrainingChar = null;
  let errorStats = {};
  const trainingLimit = 30;
  let selectedChars = [];
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  function updateTime() {
    const elapsed = (Date.now() - startTime) / 1000;
    const minutes = Math.floor(elapsed / 60);
    const seconds = Math.round(elapsed % 60);
    document.getElementById("timeElapsed").textContent = `${minutes} min ${seconds} seg`;
  }
  function startGame() {
    clickSound.play();
    document.querySelector('h1').style.display = 'none';
    const checkboxes = document.querySelectorAll(".setCheck:checked");
    const cardCount = parseInt(document.getElementById("cardCount").value);
    const errorMessage = document.getElementById("errorMessage");
    const gameBoard = document.getElementById("gameBoard");
    const gameContainer = document.getElementById("gameContainer");
    const winModal = document.getElementById("winModal");
    const modalOverlay = document.getElementById("modalOverlay");
    const trainingContainer = document.getElementById("trainingContainer");
    winModal.style.display = "none";
    modalOverlay.style.display = "none";
    trainingContainer.style.display = "none";
    gameContainer.style.display = "none";
    if (checkboxes.length === 0) {
      errorMessage.textContent = "Selecione pelo menos um conjunto!";
      return;
    }
    if (cardCount % 2 !== 0 || ![8, 16, 20, 30].includes(cardCount)) {
      errorMessage.textContent = "O número de cartas deve ser 8, 16, 20 ou 30!";
      return;
    }
    let availablePairs = [];
    const selectedSets = [];
    checkboxes.forEach(checkbox => {
      const set = sets[checkbox.value];
      availablePairs = availablePairs.concat(set);
      selectedSets.push(setNames[checkbox.value]);
    });
    document.getElementById("modeInfo").textContent = selectedSets.length > 0 ? selectedSets.join(", ") : "Nenhum";
    const neededPairs = cardCount / 2;
    let selectedPairs = [];
    const shuffledAvailable = shuffle(availablePairs.slice());
    for (let i = 0; i < neededPairs; i++) {
      if (shuffledAvailable.length === 0) {
        shuffledAvailable.push(...shuffle(availablePairs.slice()));
      }
      selectedPairs.push(shuffledAvailable.shift());
    }
    errorMessage.textContent = "";
    const characters = selectedPairs.flat();
    const shuffled = shuffle(characters);
    let columns, rows;
    if (cardCount === 8) {
      columns = 2;
      rows = 4;
    } else if (cardCount === 16) {
      columns = 4;
      rows = 4;
    } else if (cardCount === 20) {
      columns = 4;
      rows = 5;
    } else if (cardCount === 30) {
      columns = 5;
      rows = 6;
    }
    gameBoard.style.gridTemplateColumns = `repeat(${columns}, 80px)`;
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 80px)`;
    gameBoard.innerHTML = "";
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matchesFound = 0;
    attempts = 0;
    totalPairs = neededPairs;
    startTime = Date.now();
    document.getElementById("timeElapsed").textContent = "0 min 0 seg";
    document.getElementById("attempts").textContent = "0";
    document.getElementById("matches").textContent = "0";
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTime, 1000);
    shuffled.forEach(char => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.char = char;
      card.innerText = "?";
      card.addEventListener("click", () => flipCard(card));
      gameBoard.appendChild(card);
    });
    const totalCells = columns * rows;
    while (gameBoard.children.length < totalCells) {
      const emptyCard = document.createElement("div");
      emptyCard.classList.add("card");
      emptyCard.style.background = "transparent";
      emptyCard.style.border = "none";
      emptyCard.style.cursor = "default";
      gameBoard.appendChild(emptyCard);
    }
    document.querySelector('.menu').style.display = 'none';
    document.querySelector('.game-controls').style.display = 'flex';
    gameContainer.style.display = 'flex';
  }
  function startTraining() {
    clickSound.play();
    const checkboxes = document.querySelectorAll(".setCheck:checked");
    const errorMessage = document.getElementById("errorMessage");
    const gameContainer = document.getElementById("gameContainer");
    const trainingContainer = document.getElementById("trainingContainer");
    const winModal = document.getElementById("winModal");
    const modalOverlay = document.getElementById("modalOverlay");
    winModal.style.display = "none";
    modalOverlay.style.display = "none";
    gameContainer.style.display = "none";
    trainingContainer.style.display = "none";
    if (checkboxes.length === 0) {
      errorMessage.textContent = "Selecione pelo menos um conjunto!";
      return;
    }
    trainingHits = 0;
    trainingErrors = 0;
    trainingTotal = 0;
    errorStats = {};
    lastTrainingChar = null;
    document.getElementById("trainingHits").textContent = "0";
    document.getElementById("trainingErrors").textContent = "0";
    document.getElementById("trainingTotal").textContent = "0";
    document.getElementById("trainingRemaining").textContent = trainingLimit;
    document.getElementById("inputRomanji").disabled = false;
    document.querySelector(".confirm-training-btn").disabled = false;
    document.querySelector(".restart-training-btn").style.display = "none";
    document.getElementById("errorList").style.display = "none";
    selectedChars = [];
    checkboxes.forEach(checkbox => {
      const set = sets[checkbox.value];
      selectedChars = selectedChars.concat(set.map(([hiragana]) => hiragana));
    });
    errorMessage.textContent = "";
    nextTrainingChar();
    document.querySelector('.menu').style.display = 'none';
    document.querySelector('.training-controls').style.display = 'flex';
    trainingContainer.style.display = 'flex';
  }
  function restartTraining() {
    clickSound.play();
    trainingHits = 0;
    trainingErrors = 0;
    trainingTotal = 0;
    errorStats = {};
    lastTrainingChar = null;
    document.getElementById("trainingHits").textContent = "0";
    document.getElementById("trainingErrors").textContent = "0";
    document.getElementById("trainingTotal").textContent = "0";
    document.getElementById("trainingRemaining").textContent = trainingLimit;
    document.getElementById("inputRomanji").disabled = false;
    document.querySelector(".confirm-training-btn").disabled = false;
    document.querySelector(".restart-training-btn").style.display = "none";
    document.getElementById("feedback").textContent = "";
    document.getElementById("errorList").style.display = "none";
    nextTrainingChar();
  }
  function nextTrainingChar() {
    if (trainingTotal >= trainingLimit) {
      document.getElementById("feedback").textContent = "Treino concluído!";
      document.getElementById("inputRomanji").disabled = true;
      document.querySelector(".confirm-training-btn").disabled = true;
      document.querySelector(".restart-training-btn").style.display = "inline-block";
      const errorList = document.getElementById("errorList");
      errorList.innerHTML = "";
      const errorKeys = Object.keys(errorStats);
      if (errorKeys.length > 0) {
        errorList.style.display = "block";
        errorList.innerHTML = "<h4>Caracteres Errados</h4>";
        errorKeys.forEach(char => {
          const correctRomanji = sets[Object.keys(sets).find(set => 
            sets[set].some(([hiragana]) => hiragana === char)
          )].find(([hiragana]) => hiragana === char)[1];
          errorStats[char].forEach(error => {
            const errorItem = document.createElement("p");
            errorItem.textContent = `${error.turn} - ${char} → ${error.input} (correto é ${correctRomanji})`;
            errorList.appendChild(errorItem);
          });
        });
      } else {
        errorList.style.display = "none";
      }
      return;
    }
    let weightedChars = [];
    selectedChars.forEach(char => {
      if (char !== lastTrainingChar) {
        const errorCount = errorStats[char] ? errorStats[char].length : 0;
        const weight = Math.max(1, errorCount + 1);
        for (let i = 0; i < weight; i++) {
          weightedChars.push(char);
        }
      }
    });
    if (weightedChars.length === 0) {
      selectedChars.forEach(char => {
        const errorCount = errorStats[char] ? errorStats[char].length : 0;
        const weight = Math.max(1, errorCount + 1);
        for (let i = 0; i < weight; i++) {
          weightedChars.push(char);
        }
      });
    }
    currentTrainingChar = shuffle(weightedChars)[0];
    lastTrainingChar = currentTrainingChar;
    document.getElementById("trainingChar").textContent = currentTrainingChar;
    document.getElementById("inputRomanji").value = "";
    document.getElementById("inputRomanji").focus();
    document.getElementById("feedback").textContent = "";
  }
  function checkAnswer() {
    clickSound.play();
    const input = document.getElementById("inputRomanji").value.trim().toLowerCase();
    const correctAnswer = sets[Object.keys(sets).find(set => 
      sets[set].some(([hiragana, romanji]) => hiragana === currentTrainingChar)
    )].find(([hiragana]) => hiragana === currentTrainingChar)[1].toLowerCase();
    if (input === correctAnswer) {
      matchSound.play();
      document.getElementById("feedback").textContent = "Correto!";
      trainingHits++;
      document.getElementById("trainingHits").textContent = trainingHits;
    } else {
      errorSound.play();
      document.getElementById("feedback").textContent = `Errado! O correto é ${correctAnswer}.`;
      trainingErrors++;
      document.getElementById("trainingErrors").textContent = trainingErrors;
      if (!errorStats[currentTrainingChar]) {
        errorStats[currentTrainingChar] = [];
      }
      errorStats[currentTrainingChar].push({ turn: trainingTotal + 1, input: input });
    }
    trainingTotal++;
    document.getElementById("trainingTotal").textContent = trainingTotal;
    document.getElementById("trainingRemaining").textContent = trainingLimit - trainingTotal;
    nextTrainingChar();
  }
  function returnToMenu() {
    clickSound.play();
    document.querySelector('h1').style.display = 'block';
    document.querySelector('.menu').style.display = 'block';
    document.querySelector('.game-controls').style.display = 'none';
    document.getElementById("gameContainer").style.display = 'none';
    document.getElementById("trainingContainer").style.display = 'none';
    document.getElementById("winModal").style.display = 'none';
    document.getElementById("modalOverlay").style.display = 'none';
    if (timerInterval) clearInterval(timerInterval);
    trainingHits = 0;
    trainingErrors = 0;
    trainingTotal = 0;
    errorStats = {};
    lastTrainingChar = null;
    document.getElementById("restartTraining").style.display = "none";
    document.getElementById("errorList").style.display = "none";
  }
  function flipCard(card) {
    if (lockBoard || card === firstCard || card.classList.contains("matched") || card.style.background === "transparent") return;
    flipSound.play();
    card.classList.add("flipped");
    card.innerText = card.dataset.char;
    if (!firstCard) {
      firstCard = card;
      return;
    }
    secondCard = card;
    lockBoard = true;
    checkMatch();
  }
  function checkMatch() {
    const firstChar = firstCard.dataset.char;
    const secondChar = secondCard.dataset.char;
    attempts += 1;
    document.getElementById("attempts").textContent = attempts;
    const pairs = Object.values(sets).flat();
    const isMatch = pairs.some(([hiragana, romanji]) => 
      (firstChar === hiragana && secondChar === romanji) || 
      (firstChar === romanji && secondChar === hiragana)
    );
    if (isMatch) {
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");
      matchSound.play();
      matchesFound += 1;
      document.getElementById("matches").textContent = matchesFound;
      resetTurn();
      if (matchesFound === totalPairs) {
        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000;
        const minutes = Math.floor(timeTaken / 60);
        const seconds = Math.round(timeTaken % 60);
        const cardCount = totalPairs * 2;
        const winModal = document.getElementById("winModal");
        const modalOverlay = document.getElementById("modalOverlay");
        document.getElementById("winMessage").textContent = 
          `Você completou o jogo com ${cardCount} cartas em ${minutes} min e ${seconds} seg!`;
        winModal.style.display = "block";
        modalOverlay.style.display = "block";
        winSound.play();
        if (timerInterval) clearInterval(timerInterval);
      }
    } else {
      errorSound.play();
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        firstCard.innerText = "?";
        secondCard.innerText = "?";
        resetTurn();
      }, 1000);
    }
  }
  function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
  }
  // Delegação de eventos para botões
  document.body.addEventListener('click', function(e) {
    if (e.target.classList.contains('start-game-btn')) {
      startGame();
    } else if (e.target.classList.contains('start-training-btn')) {
      startTraining();
    } else if (e.target.classList.contains('music-toggle-btn')) {
      toggleMusic();
    } else if (e.target.classList.contains('theme-toggle-btn')) {
      toggleTheme();
    } else if (e.target.classList.contains('return-menu-btn')) {
      returnToMenu();
    } else if (e.target.classList.contains('restart-training-btn')) {
      restartTraining();
    } else if (e.target.classList.contains('confirm-training-btn')) {
      checkAnswer();
    }
  });
  // Enter para confirmar resposta
  document.getElementById("inputRomanji")?.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      checkAnswer();
    }
  });
})();
