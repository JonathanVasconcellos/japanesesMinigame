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
    document.querySelector(".restart-training-btn").style.display = "none";
    document.getElementById("errorList").style.display = "none";
    selectedChars = [];
    const selectedSets = validateSelectedSets(checkboxes);
    selectedSets.forEach(set => {
      selectedChars = selectedChars.concat(set.map(([hiragana]) => hiragana));
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
    document.querySelector(".restart-training-btn").style.display = "none";
    document.getElementById("feedback").textContent = "";
    document.getElementById("errorList").style.display = "none";
    trainingPool = shuffle(selectedChars.slice());
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
          const correctRomanji = window.sets[Object.keys(window.sets).find(set => 
            window.sets[set].some(([hiragana]) => hiragana === char)
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
    const correctAnswer = window.sets[Object.keys(window.sets).find(set => 
      window.sets[set].some(([hiragana, romanji]) => hiragana === currentTrainingChar)
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
    const restartTrainingElement = document.getElementById("restartTraining");
    if (restartTrainingElement) {
      restartTrainingElement.style.display = "none";
    }
    const errorListElement = document.getElementById("errorList");
    if (errorListElement) {
      errorListElement.style.display = "none";
    }
    trainingHits = 0;
    trainingErrors = 0;
    trainingTotal = 0;
    errorStats = {};
    lastTrainingChar = null;
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
