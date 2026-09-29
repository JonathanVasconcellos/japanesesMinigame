// Modo Treino - Jogo da Memória Hiragana
(function() {
  // Estado do treino
  let trainingHits = 0;
  let trainingErrors = 0;
  let trainingTotal = 0;
  let currentTrainingChar = null;
  let lastTrainingChar = null;
  let errorStats = {};
  const trainingLimit = 30;
  let selectedChars = [];
  let trainingPool = [];
  let reviewQueue = [];
  let failedThisTraining = new Set();
  let currentSetMap = new Map();
  let currentTrainingCharIsReview = false;
  let pendingAdvanceTimeout = null;
  let trainingFinished = false;
  let statsReturnFocus = null;
  const sessionStatsKey = 'hiragana-classic-training-stats-v1';
  const pendingReviewKey = 'hiragana-classic-training-review-v1';

  function loadPendingReviewChars() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(pendingReviewKey) || '[]');
      return Array.isArray(saved) ? [...new Set(saved.filter(char => typeof char === 'string'))] : [];
    } catch (_) {
      return [];
    }
  }

  let pendingReviewChars = loadPendingReviewChars();

  function savePendingReviewChars() {
    try {
      sessionStorage.setItem(pendingReviewKey, JSON.stringify(pendingReviewChars));
    } catch (_) {
      // A revisão continua disponível em memória enquanto esta página permanecer aberta.
    }
  }

  function emptySessionStats() {
    return { answers: 0, hits: 0, errors: 0, completedTrainings: 0, characters: {} };
  }

  function loadSessionStats() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(sessionStatsKey) || 'null');
      if (saved && typeof saved === 'object') {
        return {
          answers: Number(saved.answers) || 0,
          hits: Number(saved.hits) || 0,
          errors: Number(saved.errors) || 0,
          completedTrainings: Number(saved.completedTrainings) || 0,
          characters: saved.characters && typeof saved.characters === 'object' ? saved.characters : {}
        };
      }
    } catch (_) {
      // O treino continua disponível quando o armazenamento da sessão não estiver acessível.
    }
    return emptySessionStats();
  }

  let sessionStats = loadSessionStats();

  function saveSessionStats() {
    try {
      sessionStorage.setItem(sessionStatsKey, JSON.stringify(sessionStats));
    } catch (_) {
      // Mantém as estatísticas em memória até a página ser fechada.
    }
  }

  function recordSessionAnswer(char, isCorrect) {
    sessionStats.answers++;
    sessionStats[isCorrect ? 'hits' : 'errors']++;
    const stats = sessionStats.characters[char] || { answers: 0, hits: 0, errors: 0 };
    stats.answers++;
    stats[isCorrect ? 'hits' : 'errors']++;
    sessionStats.characters[char] = stats;
    saveSessionStats();
  }

  function showSessionStats() {
    statsReturnFocus = document.activeElement;
    const content = document.getElementById('sessionStatsContent');
    content.replaceChildren();
    const rate = sessionStats.answers
      ? Math.round((sessionStats.hits / sessionStats.answers) * 100)
      : 0;
    const summary = document.createElement('p');
    summary.textContent = `Treinos concluídos: ${sessionStats.completedTrainings} · Respostas: ${sessionStats.answers} · Acertos: ${sessionStats.hits} · Erros: ${sessionStats.errors} · Aproveitamento: ${rate}%`;
    content.appendChild(summary);

    const characters = Object.entries(sessionStats.characters)
      .sort((left, right) => right[1].errors - left[1].errors || right[1].answers - left[1].answers);
    if (characters.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.textContent = 'Ainda não há respostas nesta sessão.';
      content.appendChild(emptyMessage);
    } else {
      const heading = document.createElement('h3');
      heading.textContent = 'Por caractere';
      content.appendChild(heading);
      characters.forEach(([char, stats]) => {
        const row = document.createElement('div');
        row.className = 'session-stats-row';
        const characterLabel = document.createElement('span');
        characterLabel.textContent = char;
        const resultLabel = document.createElement('span');
        resultLabel.textContent = `${stats.hits} acertos · ${stats.errors} erros`;
        row.append(characterLabel, resultLabel);
        content.appendChild(row);
      });
    }

    document.getElementById('sessionStatsModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('closeSessionStatsBtn').focus();
  }

  function closeSessionStats() {
    document.getElementById('sessionStatsModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    if (statsReturnFocus?.isConnected && !statsReturnFocus.disabled) {
      statsReturnFocus.focus();
    }
    statsReturnFocus = null;
  }

  function cancelPendingAdvance() {
    if (pendingAdvanceTimeout !== null) {
      clearTimeout(pendingAdvanceTimeout);
      pendingAdvanceTimeout = null;
    }
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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

  function startTraining() {
    window.clickSound.play();
    cancelPendingAdvance();
    window.stopClassicTimer?.();
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
    reviewQueue = [];
    failedThisTraining = new Set();
    lastTrainingChar = null;
    currentTrainingCharIsReview = false;
    trainingFinished = false;
    document.getElementById("trainingHits").textContent = "0";
    document.getElementById("trainingErrors").textContent = "0";
    document.getElementById("trainingTotal").textContent = "0";
    document.getElementById("trainingRemaining").textContent = trainingLimit;
    const inputRomanji = document.getElementById("inputRomanji");
    inputRomanji.disabled = false;
    inputRomanji.value = "";
    document.getElementById("feedback").textContent = "";
    document.querySelector(".confirm-training-btn").disabled = false;
    document.querySelector(".restart-training-btn").classList.add('hidden');
    document.getElementById("errorList").classList.add('hidden');
    selectedChars = [];
    currentSetMap = new Map();
    const selectedSets = validateSelectedSets(checkboxes);
    selectedSets.forEach(set => {
      set.forEach(([hiragana, romanji]) => {
        selectedChars.push(hiragana);
        currentSetMap.set(hiragana, romanji);
      });
    });
    if (selectedChars.length === 0) {
      errorMessage.textContent = "Nenhum conjunto válido selecionado!";
      return;
    }
    errorMessage.textContent = "";
    reviewQueue = pendingReviewChars.filter(char => selectedChars.includes(char));
    trainingPool = shuffle(selectedChars.slice());
    nextTrainingChar();
    document.querySelector('h1').style.display = 'none';
    document.querySelector('.menu').style.display = 'none';
    document.querySelector('.training-controls').style.display = 'flex';
    trainingContainer.style.display = 'flex';
    inputRomanji.focus();
  }

  function restartTraining() {
    clickSound.play();
    cancelPendingAdvance();
    const inputElement = document.getElementById("inputRomanji");
    trainingHits = 0;
    trainingErrors = 0;
    trainingTotal = 0;
    errorStats = {};
    reviewQueue = pendingReviewChars.filter(char => selectedChars.includes(char));
    failedThisTraining = new Set();
    lastTrainingChar = null;
    currentTrainingCharIsReview = false;
    trainingFinished = false;
    document.getElementById("trainingHits").textContent = "0";
    document.getElementById("trainingErrors").textContent = "0";
    document.getElementById("trainingTotal").textContent = "0";
    document.getElementById("trainingRemaining").textContent = trainingLimit;
    inputElement.disabled = false;
    inputElement.value = "";
    document.querySelector(".confirm-training-btn").disabled = false;
    document.querySelector(".restart-training-btn").classList.add('hidden');
    document.getElementById("feedback").textContent = "";
    document.getElementById("errorList").classList.add('hidden');
    trainingPool = shuffle(selectedChars.slice());
    nextTrainingChar();
    inputElement.focus();
  }

  function nextTrainingChar() {
    if (trainingTotal >= trainingLimit) {
      completeTraining();
      return;
    }

    const currentCharElement = document.getElementById("trainingChar");
    if (!currentCharElement) {
      console.error("Elemento trainingChar não encontrado no DOM.");
      return;
    }

    const reviewIndex = reviewQueue.findIndex(char => char !== lastTrainingChar);
    let nextChar;
    if (reviewIndex >= 0) {
      nextChar = reviewQueue.splice(reviewIndex, 1)[0];
      currentTrainingCharIsReview = true;
    } else {
      currentTrainingCharIsReview = false;
      trainingPool = trainingPool.filter(char => !failedThisTraining.has(char));
      if (!trainingPool || trainingPool.length === 0) {
        const availableChars = selectedChars.filter(char => !failedThisTraining.has(char));
        trainingPool = shuffle((availableChars.length ? availableChars : selectedChars).slice());
      }
      do {
        nextChar = trainingPool.pop();
      } while (nextChar === lastTrainingChar && trainingPool.length > 0);
    }

    if (!nextChar && trainingPool.length === 0) {
      trainingPool = shuffle(selectedChars.slice());
      nextChar = trainingPool.pop();
      currentTrainingCharIsReview = false;
    }

    lastTrainingChar = nextChar;
    currentTrainingChar = nextChar;
    currentCharElement.textContent = currentTrainingChar;
  }

  function completeTraining() {
    if (trainingFinished) return;
    trainingFinished = true;
    sessionStats.completedTrainings++;
    saveSessionStats();
    document.getElementById("feedback").textContent = "Treino concluído!";
    document.getElementById("inputRomanji").disabled = true;
    document.querySelector(".confirm-training-btn").disabled = true;
    document.querySelector(".restart-training-btn").classList.remove('hidden');
    const errorList = document.getElementById("errorList");
    errorList.style.display = "";
    errorList.replaceChildren();
    const errorKeys = Object.keys(errorStats);
    if (errorKeys.length > 0) {
      errorList.classList.remove('hidden');
      const heading = document.createElement('h4');
      heading.textContent = 'Caracteres Errados';
      errorList.appendChild(heading);
      errorKeys.forEach(char => {
        const correctRomanji = currentSetMap.get(char);
        if (!correctRomanji) return;
        errorStats[char].forEach(error => {
          const errorItem = document.createElement("p");
          errorItem.textContent = `${error.turn} - ${char} → ${error.input} (correto é ${correctRomanji})`;
          errorList.appendChild(errorItem);
        });
      });
    } else {
      errorList.classList.add('hidden');
    }
  }

  function checkAnswer() {
    clickSound.play();
    const inputElement = document.getElementById("inputRomanji");
    const input = inputElement.value.trim().toLowerCase();

    if (!input) {
      document.getElementById("feedback").textContent = "Digite o romaji antes de confirmar.";
      inputElement.focus();
      return;
    }

    const correctRomanjiRaw = currentSetMap.get(currentTrainingChar);
    if (!correctRomanjiRaw) {
      console.error(`Caractere não encontrado nos conjuntos: ${currentTrainingChar}`);
      errorSound.play();
      document.getElementById("feedback").textContent = "Erro: caractere inválido!";
      return;
    }

    const correctAnswer = correctRomanjiRaw.toLowerCase();
    if (input === correctAnswer) {
      matchSound.play();
      document.getElementById("feedback").textContent = "";
      trainingHits++;
      document.getElementById("trainingHits").textContent = trainingHits;
      reviewQueue = reviewQueue.filter(char => char !== currentTrainingChar);
      if (currentTrainingCharIsReview && pendingReviewChars.includes(currentTrainingChar)) {
        pendingReviewChars = pendingReviewChars.filter(char => char !== currentTrainingChar);
        savePendingReviewChars();
      }
    } else {
      errorSound.play();
      document.getElementById("feedback").textContent = `Errado! O correto é ${correctAnswer}. Salvo para o próximo treino.`;
      trainingErrors++;
      document.getElementById("trainingErrors").textContent = trainingErrors;
      if (!errorStats[currentTrainingChar]) {
        errorStats[currentTrainingChar] = [];
      }
      errorStats[currentTrainingChar].push({ turn: trainingTotal + 1, input: input });
      if (!pendingReviewChars.includes(currentTrainingChar)) {
        pendingReviewChars.push(currentTrainingChar);
        savePendingReviewChars();
      }
      failedThisTraining.add(currentTrainingChar);
      trainingPool = trainingPool.filter(char => char !== currentTrainingChar);
    }
    inputElement.value = "";
    trainingTotal++;
    document.getElementById("trainingTotal").textContent = trainingTotal;
    document.getElementById("trainingRemaining").textContent = trainingLimit - trainingTotal;
    recordSessionAnswer(currentTrainingChar, input === correctAnswer);
    if (input === correctAnswer) {
      nextTrainingChar();
      return;
    }

    inputElement.disabled = true;
    document.querySelector(".confirm-training-btn").disabled = true;
    pendingAdvanceTimeout = setTimeout(() => {
      pendingAdvanceTimeout = null;
      if (trainingTotal >= trainingLimit) {
        nextTrainingChar();
        return;
      }
      document.getElementById("feedback").textContent = "";
      inputElement.disabled = false;
      document.querySelector(".confirm-training-btn").disabled = false;
      nextTrainingChar();
      inputElement.focus();
    }, 1200);
  }

  function returnToMenu() {
    clickSound.play();
    cancelPendingAdvance();
    closeSessionStats();
    window.stopClassicTimer?.();
    document.querySelector('h1').style.display = 'block';
    document.querySelector('.menu').style.display = 'block';
    document.querySelector('.game-controls').style.display = 'none';
    document.getElementById("gameContainer").style.display = 'none';
    document.getElementById("trainingContainer").style.display = 'none';
    document.getElementById("winModal").style.display = 'none';
    document.getElementById("modalOverlay").style.display = 'none';
    const restartTrainingElement = document.querySelector('.restart-training-btn');
    if (restartTrainingElement) {
      restartTrainingElement.classList.add('hidden');
    }
    const errorListElement = document.getElementById("errorList");
    if (errorListElement) {
      errorListElement.classList.add('hidden');
    }
    trainingHits = 0;
    trainingErrors = 0;
    trainingTotal = 0;
    errorStats = {};
    reviewQueue = [];
    lastTrainingChar = null;
    currentSetMap = new Map();
  }

  // Delegação de eventos para botões do treino
  document.body.addEventListener('click', function(e) {
    if (e.target.classList.contains('session-stats-btn')) {
      showSessionStats();
    } else if (e.target.id === 'closeSessionStatsBtn' ||
      (e.target.id === 'modalOverlay' && document.getElementById('sessionStatsModal').style.display === 'block')) {
      closeSessionStats();
    } else if (e.target.classList.contains('start-training-btn')) {
      startTraining();
    } else if (e.target.classList.contains('return-menu-btn')) {
      returnToMenu();
    } else if (e.target.classList.contains('restart-training-btn')) {
      restartTraining();
    } else if (e.target.classList.contains('confirm-training-btn')) {
      checkAnswer();
    }
  });

  document.getElementById("inputRomanji")?.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      checkAnswer();
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && document.getElementById('sessionStatsModal').style.display === 'block') {
      closeSessionStats();
    }
  });

})();
