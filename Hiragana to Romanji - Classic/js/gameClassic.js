// Modo Clássico - Jogo da Memória Hiragana
(function() {
  // Variáveis globais do modo clássico
  let firstCard, secondCard, lockBoard, matchesFound, attempts, totalPairs, startTime, timerInterval;

  // Função de embaralhamento
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

  function validateSelectedSets(checkboxes) {
    const validSets = [];
    checkboxes.forEach(checkbox => {
      const set = window.sets[checkbox.value];
      if (set) {
        validSets.push(set);
      } else {
        console.error(`Set not found: ${checkbox.value}`);
      }
    });
    return validSets;
  }

  // Botões Selecionar todos / Limpar seleção
  document.addEventListener('DOMContentLoaded', function() {
    const selectAllBtn = document.getElementById('selectAllSetsBtn');
    const clearAllBtn = document.getElementById('clearAllSetsBtn');
    const setCheckboxes = () => document.querySelectorAll('.setCheck');

    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', function() {
        clickSound.play();
        const cbs = setCheckboxes();
        for (let i = 0; i < cbs.length; i++) {
          cbs[i].checked = true;
        }
      });
    }
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', function() {
        clickSound.play();
        const cbs = setCheckboxes();
        for (let i = 0; i < cbs.length; i++) {
          cbs[i].checked = false;
        }
      });
    }
  });

  function startGame() {
    window.clickSound.play();
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
    const selectedSets = validateSelectedSets(checkboxes);
    selectedSets.forEach(set => {
      availablePairs = availablePairs.concat(set);
    });
    if (availablePairs.length === 0) {
      errorMessage.textContent = "Nenhum conjunto válido selecionado!";
      return;
    }
    const neededPairs = cardCount / 2;
    let selectedPairs = [];
    while (selectedPairs.length < neededPairs) {
      const shuffledAvailable = shuffle(availablePairs.slice());
      selectedPairs = selectedPairs.concat(shuffledAvailable.slice(0, neededPairs - selectedPairs.length));
    }
    // Embaralhamento aprimorado para evitar padrões previsíveis
    selectedPairs = shuffle(selectedPairs);
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
    // Otimização: criar todas as cartas em um fragmento e inserir de uma vez
    const fragment = document.createDocumentFragment();
    shuffled.forEach(char => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.char = char;
      card.innerText = "?";
      card.addEventListener("click", () => flipCard(card));
      fragment.appendChild(card);
    });
    gameBoard.appendChild(fragment);
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
    const pairs = Object.values(window.sets).flat();
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
    }
  });

})();
