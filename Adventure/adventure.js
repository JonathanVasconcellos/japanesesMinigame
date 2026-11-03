(function() {
  const content = window.ADVENTURE_CONTENT;
  const stage = content.stages['first-coast-battle'];
  const hiraganaIsland = content.islands.find(island => island.id === stage.islandId);
  const starStorageKey = `kana-quest-progress-v${content.version}`;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const screens = {
    islands: document.getElementById('islandScreen'),
    stage: document.getElementById('stageScreen'),
    battle: document.getElementById('battleScreen')
  };

  const ui = {
    starCount: document.getElementById('starCount'),
    mapStarCount: document.getElementById('mapStarCount'),
    stageNodes: document.getElementById('stageNodes'),
    targetSequence: document.getElementById('targetSequence'),
    stepProgress: document.getElementById('stepProgress'),
    stepLabel: document.getElementById('stepLabel'),
    timerLabel: document.getElementById('timerLabel'),
    optionCards: document.getElementById('optionCards'),
    feedback: document.getElementById('battleFeedback'),
    enemyHealthBar: document.getElementById('enemyHealthBar'),
    enemyHealthLabel: document.getElementById('enemyHealthLabel'),
    arena: document.querySelector('.arena'),
    enemyActor: document.querySelector('.enemy-fighter'),
    playerActor: document.querySelector('.player-fighter'),
    lifeDisplay: document.getElementById('lifeDisplay'),
    roundLabel: document.getElementById('roundLabel'),
    enemyAction: document.getElementById('enemyAction'),
    modal: document.getElementById('battleModal'),
    resultIcon: document.getElementById('resultIcon'),
    resultEyebrow: document.getElementById('resultEyebrow'),
    resultTitle: document.getElementById('resultTitle'),
    resultMessage: document.getElementById('resultMessage'),
    earnedStar: document.getElementById('earnedStar')
  };

  let audioContext = null;
  let soundEnabled = true;
  let progress = loadProgress();
  let timerInterval = null;
  let pendingTransitionTimeout = null;
  let deadline = 0;
  let sequenceTimeLimit = 0;
  let inputAnimating = false;
  let lives = stage.initialLives;
  let displayedLives = stage.initialLives;
  let enemyHealth = stage.enemyHealth;
  let currentSequence = [];
  let stepIndex = 0;
  let attackCount = 1;
  let locked = false;
  let lastWrongAnswer = false;

  function loadProgress() {
    try {
      const value = JSON.parse(localStorage.getItem(starStorageKey) || '{}');
      return {
        stars: Number.isFinite(value.stars) ? Math.max(0, value.stars) : 0,
        completedStages: Array.isArray(value.completedStages) ? value.completedStages : [],
        perfectStages: Array.isArray(value.perfectStages) ? value.perfectStages : []
      };
    } catch (_) {
      return { stars: 0, completedStages: [], perfectStages: [] };
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(starStorageKey, JSON.stringify(progress));
    } catch (_) {
      // A fase continua jogável se o navegador bloquear armazenamento.
    }
  }

  function showScreen(name) {
    stopTimer();
    inputAnimating = false;
    if (pendingTransitionTimeout !== null) {
      window.clearTimeout(pendingTransitionTimeout);
      pendingTransitionTimeout = null;
    }
    Object.entries(screens).forEach(([key, screen]) => {
      screen.classList.toggle('hidden', key !== name);
    });
    ui.modal.classList.add('hidden');
  }

  function animateActor(actor, state) {
    actor.classList.remove('attack-windup', 'attack-lunge', 'recoil', 'damaged', 'counter-attack', 'blocking', 'cut');
    void actor.offsetWidth;
    actor.classList.add(state);
  }

  function showIslands() {
    updateProgressDisplay();
    showScreen('islands');
  }

  function showStageMap() {
    updateProgressDisplay();
    showScreen('stage');
  }

  function updateProgressDisplay() {
    ui.starCount.textContent = progress.stars;
    ui.mapStarCount.textContent = progress.stars;
    renderStageNodes();
  }

  function renderStageNodes() {
    ui.stageNodes.replaceChildren();
    hiraganaIsland.stages.forEach(mapStage => {
      const listItem = document.createElement('li');
      listItem.className = 'stage-node-wrap';
      listItem.style.setProperty('--node-x', mapStage.x);
      listItem.style.setProperty('--node-y', mapStage.y);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'stage-node';
      button.textContent = mapStage.number;
      const isPlayable = Boolean(mapStage.stageId && content.stages[mapStage.stageId]);
      const wasPerfect = Boolean(mapStage.stageId && progress.perfectStages.includes(mapStage.stageId));
      const wasCompleted = Boolean(mapStage.stageId && progress.completedStages.includes(mapStage.stageId));
      if (isPlayable) {
        button.classList.add(wasCompleted ? 'completed' : 'available');
        button.setAttribute('aria-label', `Fase ${mapStage.number}${wasCompleted ? ', concluída' : ', disponível'}`);
        button.addEventListener('click', beginStage);
      } else {
        button.disabled = true;
        button.setAttribute('aria-label', `Fase ${mapStage.number}, bloqueada`);
      }

      const star = document.createElement('span');
      star.className = `node-star${wasPerfect ? '' : ' unearned'}`;
      star.textContent = wasPerfect ? '★' : '☆';
      star.setAttribute('aria-label', wasPerfect ? 'Estrela perfeita conquistada' : 'Estrela ainda não conquistada');
      listItem.append(button, star);
      ui.stageNodes.appendChild(listItem);
    });
  }

  function ensureAudio() {
    if (!soundEnabled) return null;
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextType) return null;
    if (!audioContext) audioContext = new AudioContextType();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    return audioContext;
  }

  function playTone(frequency, duration = 0.12, waveform = 'sine', volume = 0.12, delay = 0) {
    const context = ensureAudio();
    if (!context) return;
    const startAt = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }

  function playDrumHit(accent = false) {
    const context = ensureAudio();
    if (!context) return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const drumGain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(135, now);
    oscillator.frequency.exponentialRampToValueAtTime(48, now + 0.16);
    drumGain.gain.setValueAtTime(0.0001, now);
    drumGain.gain.exponentialRampToValueAtTime(accent ? 0.42 : 0.23, now + 0.008);
    drumGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);
    oscillator.connect(drumGain);
    drumGain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.21);

    const noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.055), context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let index = 0; index < noiseData.length; index++) {
      noiseData[index] = (Math.random() * 2 - 1) * (1 - index / noiseData.length);
    }
    const noise = context.createBufferSource();
    const noiseGain = context.createGain();
    noise.buffer = noiseBuffer;
    noiseGain.gain.setValueAtTime(accent ? 0.12 : 0.06, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
    noise.connect(noiseGain);
    noiseGain.connect(context.destination);
    noise.start(now);
  }

  function playFinisherSound() {
    playDrumHit(true);
  }

  function playErrorSound() {
    playDrumHit(true);
    playTone(155, 0.3, 'sawtooth', 0.055, 0.04);
    playTone(103, 0.34, 'triangle', 0.09, 0.12);
  }

  function setSoundButton() {
    const button = document.getElementById('soundToggle');
    button.textContent = soundEnabled ? '♫' : '♪̸';
    button.setAttribute('aria-pressed', String(soundEnabled));
    button.setAttribute('aria-label', soundEnabled ? 'Desativar sons' : 'Ativar sons');
  }

  function beginStage() {
    ensureAudio();
    lives = stage.initialLives;
    displayedLives = stage.initialLives;
    enemyHealth = stage.enemyHealth;
    stepIndex = 0;
    currentSequence = [];
    attackCount = 1;
    locked = false;
    lastWrongAnswer = false;
    inputAnimating = false;
    showScreen('battle');
    document.getElementById('selectionPrompt').textContent = stage.cardMode === 'romaji'
      ? 'Qual é o romaji do kana destacado?'
      : 'Qual kana corresponde ao som anunciado?';
    ui.optionCards.setAttribute('aria-label', stage.cardMode === 'romaji'
      ? 'Opções de romaji'
      : 'Opções de kana');
    updateBattleHud();
    beginEnemyAttack();
  }

  function updateBattleHud() {
    const lifeWasLost = lives < displayedLives;
    ui.lifeDisplay.replaceChildren();
    Array.from({ length: stage.initialLives }, (_, index) => {
      const heart = document.createElement('span');
      heart.className = `life-heart${index < lives ? '' : ' empty'}${lifeWasLost && index === lives ? ' lost' : ''}`;
      heart.textContent = index < lives ? '♥' : '♡';
      ui.lifeDisplay.appendChild(heart);
    });
    displayedLives = lives;
    ui.lifeDisplay.setAttribute('aria-label', `${lives} de ${stage.initialLives} vidas`);
    ui.enemyHealthLabel.textContent = `${enemyHealth} / ${stage.enemyHealth}`;
    ui.enemyHealthBar.style.width = `${(enemyHealth / stage.enemyHealth) * 100}%`;
    ui.roundLabel.textContent = `ATAQUE ${attackCount}`;
    ui.stepLabel.textContent = `${stepIndex} / ${currentSequence.length}`;
    renderSequence();
    renderProgress();
  }

  function renderSequence() {
    const labels = currentSequence.map(kana => {
      const symbolData = stage.symbols.find(symbol => symbol.kana === kana);
      return stage.cardMode !== 'romaji' ? symbolData.romaji : kana;
    });
    const needsRebuild = ui.targetSequence.children.length !== labels.length
      || labels.some((label, index) => ui.targetSequence.children[index]?.dataset.label !== label);
    if (needsRebuild) {
      ui.targetSequence.replaceChildren();
      labels.forEach((label, index) => {
        const symbol = document.createElement('span');
        symbol.className = 'target-kana';
        symbol.dataset.label = label;
        symbol.setAttribute('aria-label', `${index + 1}: ${label}`);
        symbol.style.setProperty('--launch-delay', `${index * 90}ms`);
        const order = document.createElement('span');
        order.className = 'sequence-order';
        order.textContent = index + 1;
        const glyph = document.createElement('span');
        glyph.className = 'sequence-glyph';
        glyph.textContent = label;
        const upperHalf = document.createElement('span');
        upperHalf.className = 'seal-half seal-half-upper';
        upperHalf.textContent = label;
        upperHalf.setAttribute('aria-hidden', 'true');
        const lowerHalf = document.createElement('span');
        lowerHalf.className = 'seal-half seal-half-lower';
        lowerHalf.textContent = label;
        lowerHalf.setAttribute('aria-hidden', 'true');
        symbol.append(order, glyph, upperHalf, lowerHalf);
        ui.targetSequence.appendChild(symbol);
      });
    }
    Array.from(ui.targetSequence.children).forEach((symbol, index) => {
      symbol.classList.toggle('done', index < stepIndex);
      symbol.classList.toggle('current', index === stepIndex);
    });
  }

  function renderProgress() {
    ui.stepProgress.replaceChildren();
    currentSequence.forEach((_, index) => {
      const pip = document.createElement('span');
      pip.className = 'step-pip';
      if (index < stepIndex) pip.classList.add('done');
      else if (index === stepIndex) pip.classList.add('current');
      ui.stepProgress.appendChild(pip);
    });
  }

  function beginEnemyAttack() {
    stopTimer();
    inputAnimating = false;
    ui.arena.classList.remove('player-damage', 'enemy-impact');
    animateActor(ui.enemyActor, 'attack-windup');
    ui.playerActor.classList.remove('damaged', 'counter-attack', 'blocking', 'cut');
    stepIndex = 0;
    locked = false;
    const possibleLengths = stage.sequenceLengthOptions || [stage.symbols.length];
    const selectedLength = possibleLengths[Math.floor(Math.random() * possibleLengths.length)];
    currentSequence = Array.from({ length: selectedLength }, () => {
      return stage.symbols[Math.floor(Math.random() * stage.symbols.length)].kana;
    });
    const secondsPerSeal = Math.max(0.1, Number(stage.secondsPerSeal) || 1);
    sequenceTimeLimit = currentSequence.length * secondsPerSeal;
    ui.targetSequence.replaceChildren();
    ui.enemyAction.textContent = 'O inimigo prepara o ataque!';
    ui.feedback.textContent = stage.cardMode === 'romaji'
      ? 'Toque nos romaji que correspondem aos kana, na ordem.'
      : 'Memorize o ataque em romaji e toque nos kana correspondentes.';
    ui.feedback.className = 'battle-feedback';
    updateBattleHud();
    showOptions();
    ui.timerLabel.textContent = `${sequenceTimeLimit.toFixed(1)}s`;
    ui.timerLabel.style.setProperty('--time-progress', '100');
    pendingTransitionTimeout = window.setTimeout(() => {
      pendingTransitionTimeout = null;
      startTimer();
    }, reducedMotion ? 0 : 720);
  }

  function pickOptions() {
    const targetKana = currentSequence[stepIndex];
    const correct = stage.symbols.find(symbol => symbol.kana === targetKana);
    const distractors = stage.symbols.filter(symbol => symbol.kana !== targetKana);
    for (let index = distractors.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [distractors[index], distractors[randomIndex]] = [distractors[randomIndex], distractors[index]];
    }
    const options = [correct, ...distractors.slice(0, stage.correctChoiceCount - 1)];
    for (let index = options.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [options[index], options[randomIndex]] = [options[randomIndex], options[index]];
    }
    return options;
  }

  function showOptions() {
    ui.optionCards.replaceChildren();
    pickOptions().forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option-card';
      const label = getOptionLabel(option);
      const mainLabel = document.createElement('span');
      mainLabel.className = 'card-main';
      mainLabel.textContent = label;
      button.append(mainLabel);
      button.style.setProperty('--deal-delay', `${index * 75}ms`);
      button.setAttribute('aria-label', `${label}, opção de resposta`);
      button.addEventListener('click', () => handleChoice(option, button));
      ui.optionCards.appendChild(button);
    });
  }

  function getOptionLabel(option) {
    if (stage.cardMode === 'hiragana') return option.kana;
    if (stage.cardMode === 'katakana') return option.katakana;
    if (stage.cardMode === 'mixed') return Math.random() < 0.5 ? option.kana : option.katakana;
    return option.romaji;
  }

  function startTimer() {
    stopTimer();
    deadline = performance.now() + sequenceTimeLimit * 1000;
    ui.timerLabel.classList.remove('urgent');
    updateTimer();
    timerInterval = window.setInterval(updateTimer, 50);
  }

  function stopTimer() {
    if (timerInterval !== null) window.clearInterval(timerInterval);
    timerInterval = null;
  }

  function updateTimer() {
    if (timerInterval === null && deadline === 0) return;
    const remaining = Math.max(0, (deadline - performance.now()) / 1000);
    ui.timerLabel.textContent = `${remaining.toFixed(1)}s`;
    ui.timerLabel.style.setProperty('--time-progress', `${(remaining / sequenceTimeLimit) * 100}`);
    ui.timerLabel.classList.toggle('urgent', remaining <= 1.5);
    if (remaining <= 0 && !locked) resolveMistake('O tempo acabou! O inimigo acertou o ataque.');
  }

  function handleChoice(option, selectedCard) {
    if (locked || inputAnimating || timerInterval === null) return;
    if (performance.now() >= deadline) {
      resolveMistake('O tempo acabou! O inimigo acertou o ataque.');
      return;
    }
    ensureAudio();
    const expectedKana = currentSequence[stepIndex];
    const expected = stage.symbols.find(symbol => symbol.kana === expectedKana);
    if (option.kana !== expected.kana) {
      selectedCard.classList.add('missed');
      resolveMistake(`Era ${expected.romaji}. O inimigo acertou o ataque.`);
      return;
    }

    selectedCard.classList.add('played');
    const isFinalHit = stepIndex === currentSequence.length - 1;
    inputAnimating = true;
    ui.targetSequence.children[stepIndex]?.classList.add(isFinalHit ? 'finisher' : 'cut');
    animateActor(ui.playerActor, isFinalHit ? 'blocking' : 'cut');
    if (isFinalHit) playFinisherSound();
    else playDrumHit(stepIndex === 0);
    stepIndex++;
    updateBattleHud();
    if (stepIndex >= currentSequence.length) {
      stopTimer();
      resolveCompletedSequence();
      return;
    }
    ui.feedback.textContent = 'Boa! Próximo kana.';
    ui.feedback.className = 'battle-feedback good';
    pendingTransitionTimeout = window.setTimeout(() => {
      pendingTransitionTimeout = null;
      if (locked) return;
      inputAnimating = false;
      showOptions();
    }, 280);
  }

  function resolveMistake(message) {
    if (locked) return;
    stopTimer();
    if (pendingTransitionTimeout !== null) {
      window.clearTimeout(pendingTransitionTimeout);
      pendingTransitionTimeout = null;
    }
    locked = true;
    inputAnimating = true;
    lastWrongAnswer = true;
    lives = Math.max(0, lives - stage.damagePerMistake);
    playErrorSound();
    ui.enemyAction.textContent = 'Ataque recebido!';
    ui.feedback.textContent = message;
    ui.feedback.className = 'battle-feedback bad';
    ui.optionCards.querySelectorAll('button').forEach(button => { button.disabled = true; });
    animateActor(ui.enemyActor, 'attack-lunge');
    animateActor(ui.playerActor, 'damaged');
    ui.arena.classList.remove('player-damage');
    void ui.arena.offsetWidth;
    ui.arena.classList.add('player-damage');
    updateBattleHud();

    pendingTransitionTimeout = window.setTimeout(() => {
      pendingTransitionTimeout = null;
      if (lives <= 0) {
        finishStage(false);
      } else {
        attackCount++;
        beginEnemyAttack();
      }
    }, 850);
  }

  function resolveCompletedSequence() {
    locked = true;
    inputAnimating = false;
    enemyHealth = Math.max(0, enemyHealth - stage.damagePerCompletedSequence);
    ui.enemyAction.textContent = 'Selo rebatido!';
    ui.feedback.textContent = 'Última batida! O oni recebeu dano.';
    ui.feedback.className = 'battle-feedback good';
    animateActor(ui.enemyActor, 'recoil');
    ui.arena.classList.remove('enemy-impact');
    void ui.arena.offsetWidth;
    ui.arena.classList.add('enemy-impact');
    updateBattleHud();

    if (enemyHealth <= 0) {
      pendingTransitionTimeout = window.setTimeout(() => {
        pendingTransitionTimeout = null;
        finishStage(true);
      }, 750);
      return;
    }
    pendingTransitionTimeout = window.setTimeout(() => {
      pendingTransitionTimeout = null;
      attackCount++;
      beginEnemyAttack();
    }, 850);
  }

  function finishStage(victory) {
    stopTimer();
    locked = true;
    const perfectRun = victory && !lastWrongAnswer;
    const earnedStar = perfectRun && !progress.perfectStages.includes(stage.id);
    if (victory) {
      if (!progress.completedStages.includes(stage.id)) progress.completedStages.push(stage.id);
      if (perfectRun && !progress.perfectStages.includes(stage.id)) {
        progress.perfectStages.push(stage.id);
        progress.stars++;
      }
      saveProgress();
      ui.resultIcon.textContent = perfectRun ? '★' : '⚔';
      ui.resultIcon.classList.toggle('defeat', !perfectRun);
      ui.resultEyebrow.textContent = perfectRun ? 'VITÓRIA PERFEITA' : 'FASE CONCLUÍDA';
      ui.resultTitle.textContent = perfectRun ? 'Perfeito!' : 'Você venceu!';
      ui.resultMessage.textContent = !perfectRun
        ? 'O Oni foi derrotado. Tente novamente sem perder vida para conquistar a estrela.'
        : earnedStar
          ? 'Você aparou todos os ataques sem perder vida. A estrela é sua!'
          : 'Você repetiu a fase perfeitamente. A estrela desta fase já foi conquistada.';
      ui.earnedStar.classList.toggle('hidden', !perfectRun);
    } else {
      ui.resultIcon.textContent = '🛡️';
      ui.resultIcon.classList.add('defeat');
      ui.resultEyebrow.textContent = 'FIM DE COMBATE';
      ui.resultTitle.textContent = 'Seu grupo precisa descansar';
      ui.resultMessage.textContent = 'Pratique as vogais e tente novamente.';
      ui.earnedStar.classList.add('hidden');
    }
    ui.modal.classList.remove('hidden');
    document.getElementById('retryStage').focus();
  }

  function resetStageForRetry() {
    ui.modal.classList.add('hidden');
    beginStage();
  }

  document.getElementById('hiraganaIsland').addEventListener('click', showStageMap);
  document.getElementById('backToIslands').addEventListener('click', showIslands);
  document.getElementById('quitBattle').addEventListener('click', showStageMap);
  document.getElementById('retryStage').addEventListener('click', resetStageForRetry);
  document.getElementById('resultToMap').addEventListener('click', showStageMap);
  document.getElementById('soundToggle').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) ensureAudio();
    else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSoundButton();
  });

  setSoundButton();
  updateProgressDisplay();
})();
