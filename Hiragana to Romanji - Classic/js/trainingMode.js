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
  let currentSetMap = new Map();

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
    const inputRomanji = document.getElementById("inputRomanji");
    inputRomanji.disabled = false;
    inputRomanji.value = "";
    inputRomanji.focus();
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
    trainingPool = shuffle(selectedChars.slice());
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
    document.querySelector(".restart-training-btn").classList.add('hidden');
    document.getElementById("feedback").textContent = "";
    document.getElementById("errorList").classList.add('hidden');
    trainingPool = shuffle(selectedChars.slice());
    nextTrainingChar();
  }

  function nextTrainingChar() {
    if (trainingTotal >= trainingLimit) {
      document.getElementById("feedback").textContent = "Treino concluído!";
      document.getElementById("inputRomanji").disabled = true;
      document.querySelector(".confirm-training-btn").disabled = true;
      document.querySelector(".restart-training-btn").classList.remove('hidden');
      const errorList = document.getElementById("errorList");
      errorList.style.display = "";
      errorList.innerHTML = "";
      const errorKeys = Object.keys(errorStats);
      if (errorKeys.length > 0) {
        errorList.classList.remove('hidden');
        errorList.innerHTML = "<h4>Caracteres Errados</h4>";
        errorKeys.forEach(char => {
          const correctRomanji = currentSetMap.get(char);
          if (!correctRomanji) {
            console.error(`Caractere não encontrado ao listar erros: ${char}`);
            return;
          }

          errorStats[char].forEach(error => {
            const errorItem = document.createElement("p");
            errorItem.textContent = `${error.turn} - ${char} → ${error.input} (correto é ${correctRomanji})`;
            errorList.appendChild(errorItem);
          });
        });
      } else {
        errorList.classList.add('hidden');
      }
      return;
    }

    const currentCharElement = document.getElementById("trainingChar");
    if (!currentCharElement) {
      console.error("Elemento trainingChar não encontrado no DOM.");
      return;
    }

    if (!trainingPool || trainingPool.length === 0) {
      trainingPool = shuffle(selectedChars.slice());
    }
    let nextChar;
    do {
      nextChar = trainingPool.pop();
    } while (nextChar === lastTrainingChar && trainingPool.length > 0);

    lastTrainingChar = nextChar;
    currentTrainingChar = nextChar;
    currentCharElement.textContent = currentTrainingChar;
  }

  function checkAnswer() {
    clickSound.play();
    const inputElement = document.getElementById("inputRomanji");
    const input = inputElement.value.trim().toLowerCase();

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
    inputElement.value = "";
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
    lastTrainingChar = null;
    currentSetMap = new Map();
  }

  // Delegação de eventos para botões do treino
  document.body.addEventListener('click', function(e) {
    if (e.target.classList.contains('start-training-btn')) {
      startTraining();
    } else if (e.target.classList.contains('return-menu-btn')) {
      returnToMenu();
    } else if (e.target.classList.contains('restart-training-btn')) {
      restartTraining();
    } else if (e.target.classList.contains('confirm-training-btn')) {
      checkAnswer();
    }
  });

  document.getElementById("inputRomanji")?.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      checkAnswer();
    }
  });

})();
