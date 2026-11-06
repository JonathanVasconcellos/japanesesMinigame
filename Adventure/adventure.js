(function() {
  const content = window.ADVENTURE_CONTENT;
  let stage = content.stages['first-coast-battle'];
  let currentEnemy = null;
  const hiraganaIsland = content.islands.find(island => island.id === stage.islandId);
  const regularStageIds = content.regularStageIds;
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
    stageNote: document.getElementById('stageNote'),
    targetSequence: document.getElementById('targetSequence'),
    timerLabel: document.getElementById('timerLabel'),
    comboLabel: document.getElementById('comboLabel'),
    optionCards: document.getElementById('optionCards'),
    feedback: document.getElementById('battleFeedback'),
    enemyHealthBar: document.getElementById('enemyHealthBar'),
    enemyHealthLabel: document.getElementById('enemyHealthLabel'),
    enemyNameLabel: document.getElementById('enemyNameLabel'),
    arena: document.querySelector('.arena'),
    enemyActor: document.querySelector('.enemy-fighter'),
    enemySprite: document.getElementById('enemySprite'),
    playerActor: document.querySelector('.player-fighter'),
    playerSprite: document.getElementById('playerSprite'),
    lifeDisplay: document.getElementById('lifeDisplay'),
    roundLabel: document.getElementById('roundLabel'),
    enemyAction: document.getElementById('enemyAction'),
    modal: document.getElementById('battleModal'),
    resultIcon: document.getElementById('resultIcon'),
    resultEyebrow: document.getElementById('resultEyebrow'),
    resultTitle: document.getElementById('resultTitle'),
    resultMessage: document.getElementById('resultMessage'),
    resultAttacks: document.getElementById('resultAttacks'),
    resultDuration: document.getElementById('resultDuration'),
    resultRecord: document.getElementById('resultRecord'),
    nextStageButton: document.getElementById('nextStage'),
    earnedStar: document.getElementById('earnedStar'),
    soundManager: document.getElementById('soundManagerBackdrop'),
    openSoundManager: document.getElementById('openSoundManager'),
    closeSoundManager: document.getElementById('closeSoundManager'),
    soundChannels: {
      music: { input: document.getElementById('soundMusicVolume'), output: document.getElementById('soundMusicVolumeValue') },
      effects: { input: document.getElementById('soundEffectsVolume'), output: document.getElementById('soundEffectsVolumeValue') },
      interface: { input: document.getElementById('soundInterfaceVolume'), output: document.getElementById('soundInterfaceVolumeValue') }
    }
  };

  // Keep the result dialog outside the battle app, whose mobile layout clips overflow.
  document.body.appendChild(ui.modal);

  let audioContext = null;
  let musicGain = null;
  let effectsGain = null;
  let interfaceGain = null;
  const musicBuffers = { menu: null, battle: null };
  const musicBufferLoading = { menu: false, battle: false };
  const musicBufferFailed = { menu: false, battle: false };
  let musicSource = null;
  let activeMusicKey = null;
  let pausedTimerRemaining = null;
  let pausedTransitionRemaining = null;
  let pendingTransitionCallback = null;
  let pendingTransitionDeadline = 0;
  let stageStartedAt = 0;
  let stagePausedTimeMs = 0;
  let soundManagerOpenedAt = 0;
  let previousSettingsFocus = null;
  let soundManagerInertScreen = null;
  let soundManagerOpen = false;
  const soundSettingsStorageKey = 'kana-quest-sound-settings-v2';
  const savedSoundSettings = loadSoundSettings();
  const musicAssetPromises = {
    menu: fetch('assets/menu-music.mp3')
      .then(response => { if (!response.ok) throw new Error('Falha ao carregar música do menu.'); return response.arrayBuffer(); })
      .catch(() => null),
    battle: fetch('assets/MUSICA.mp3')
      .then(response => { if (!response.ok) throw new Error('Falha ao carregar música de combate.'); return response.arrayBuffer(); })
      .catch(() => null)
  };
  const soundController = {
    enabled: savedSoundSettings.enabled,
    volumes: savedSoundSettings.volumes,
    musicFallbacks: {
      menu: new Audio('assets/menu-music.mp3'),
      battle: new Audio('assets/MUSICA.mp3')
    },
    samples: {
      seal: new Audio('assets/Acerto.mp3'),
      finisher: new Audio('assets/Final.mp3')
    },
    interfaceSample: new Audio('assets/interface-click.mp3'),
    apply() {
      const levels = {
        music: this.enabled ? this.volumes.music : 0,
        effects: this.enabled ? this.volumes.effects : 0,
        interface: this.enabled ? this.volumes.interface : 0
      };
      if (audioContext) {
        if (musicGain) musicGain.gain.setTargetAtTime(levels.music, audioContext.currentTime, 0.025);
        if (effectsGain) effectsGain.gain.setTargetAtTime(levels.effects, audioContext.currentTime, 0.025);
        if (interfaceGain) interfaceGain.gain.setTargetAtTime(levels.interface, audioContext.currentTime, 0.025);
      }
      Object.entries(this.samples).forEach(([name, sample]) => {
        sample.volume = Math.min(1, levels.effects * (name === 'finisher' ? 1.4 : 1));
      });
      this.interfaceSample.volume = levels.interface;
      Object.values(this.musicFallbacks).forEach(sample => { sample.volume = levels.music; });
    },
    save() {
      try {
        localStorage.setItem(soundSettingsStorageKey, JSON.stringify({ enabled: this.enabled, volumes: this.volumes }));
      } catch (_) {
        // Audio preferences remain usable if storage is unavailable.
      }
    },
    setEnabled(enabled) {
      this.enabled = Boolean(enabled);
      this.apply();
      this.save();
      if (!this.enabled) this.stopSamples();
      this.syncMusic();
    },
    setVolume(channel, volume) {
      this.volumes[channel] = Math.max(0, Math.min(1, Number(volume) || 0));
      this.apply();
      this.save();
      this.syncMusic();
    },
    play(name) {
      if (!this.enabled || this.volumes.effects <= 0) return;
      const sample = this.samples[name];
      if (!sample) return;
      sample.volume = Math.min(1, this.volumes.effects * (name === 'finisher' ? 1.4 : 1));
      sample.pause();
      try { sample.currentTime = 0; } catch (_) {}
      const playback = sample.play();
      if (playback && typeof playback.catch === 'function') playback.catch(() => {});
    },
    stopSamples() {
      Object.values(this.samples).forEach(sample => {
        sample.pause();
        try { sample.currentTime = 0; } catch (_) {}
      });
      this.interfaceSample.pause();
      try { this.interfaceSample.currentTime = 0; } catch (_) {}
    },
    playInterface() {
      if (!this.enabled || this.volumes.interface <= 0) return;
      this.interfaceSample.pause();
      try { this.interfaceSample.currentTime = 0; } catch (_) {}
      const playback = this.interfaceSample.play();
      if (playback && typeof playback.catch === 'function') playback.catch(() => {});
    },
    syncMusic() {
      const track = !screens.battle.classList.contains('hidden')
        ? 'battle'
        : (!screens.stage.classList.contains('hidden') || !screens.islands.classList.contains('hidden') ? 'menu' : null);
      const shouldPlay = this.enabled && this.volumes.music > 0 && track !== null;
      if (!shouldPlay) {
        if (musicSource) {
          try { musicSource.stop(); } catch (_) {}
          musicSource.disconnect();
          musicSource = null;
        }
        Object.values(this.musicFallbacks).forEach(sample => sample.pause());
        activeMusicKey = null;
        return;
      }
      if (activeMusicKey !== track) {
        if (musicSource) {
          try { musicSource.stop(); } catch (_) {}
          musicSource.disconnect();
          musicSource = null;
        }
        Object.entries(this.musicFallbacks).forEach(([key, sample]) => {
          sample.pause();
          if (key !== track) { try { sample.currentTime = 0; } catch (_) {} }
        });
        activeMusicKey = track;
      }
      if (audioContext && audioContext.state === 'suspended') audioContext.resume().catch(() => {});
      if (musicBuffers[track] && audioContext && !musicSource) {
        const source = audioContext.createBufferSource();
        musicSource = source;
        source.buffer = musicBuffers[track];
        source.loop = true;
        source.connect(musicGain || audioContext.destination);
        source.onended = () => { if (musicSource === source) musicSource = null; };
        source.start();
        this.musicFallbacks[track].pause();
        return;
      }
      if (musicBufferFailed[track]) {
        const playback = this.musicFallbacks[track].play();
        if (playback && typeof playback.catch === 'function') playback.catch(() => {});
      } else if (!musicBuffers[track] && !musicBufferLoading[track] && audioContext) {
        musicBufferLoading[track] = true;
        musicAssetPromises[track]
          .then(data => { if (!data) throw new Error('A faixa não pôde ser carregada.'); return audioContext.decodeAudioData(data.slice(0)); })
          .then(buffer => { musicBuffers[track] = buffer; this.syncMusic(); })
          .catch(() => {
            musicBufferFailed[track] = true;
            this.syncMusic();
          })
          .finally(() => { musicBufferLoading[track] = false; });
      }
    }
  };
  Object.values(soundController.musicFallbacks).forEach(sample => {
    sample.loop = true;
    sample.preload = 'auto';
    sample.load();
  });
  Object.values(soundController.samples).forEach(sample => {
    sample.preload = 'auto';
    sample.volume = soundController.enabled
      ? Math.min(1, soundController.volumes.effects * (sample === soundController.samples.finisher ? 1.4 : 1))
      : 0;
    sample.load();
  });
  soundController.interfaceSample.preload = 'auto';
  soundController.interfaceSample.volume = soundController.enabled ? soundController.volumes.interface : 0;
  soundController.interfaceSample.load();
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
  let completedSequenceStreak = 0;
  let spriteAssetsReady = false;
  const failedSpriteAssets = new Set();
  const preloadedSprites = new Map();

  const playerPoses = {
    idle: 'assets/party-pose-1.webp',
    hit1: 'assets/party-pose-2.webp',
    hit2: 'assets/party-pose-3.webp',
    hit3: 'assets/party-pose-4.webp',
    damaged: 'assets/party-pose-5.webp',
    finisher: 'assets/party-pose-6.webp',
    defeated: 'assets/party-pose-7.webp'
  };

  function preloadSprite(source) {
    const image = new Image();
    image.decoding = 'async';
    preloadedSprites.set(source, image);
    return new Promise(resolve => {
      let settled = false;
      const finish = loaded => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        if (!loaded) failedSpriteAssets.add(source);
        resolve(loaded);
      };
      const timeout = window.setTimeout(() => finish(false), 12000);
      image.onload = () => {
        if (typeof image.decode === 'function') {
          image.decode().then(() => finish(true), () => finish(image.naturalWidth > 0));
        } else {
          finish(true);
        }
      };
      image.onerror = () => finish(false);
      image.src = source;
      if (image.complete) finish(image.naturalWidth > 0);
    });
  }

  function preloadAdventureSprites() {
    const sources = new Set([...Object.values(playerPoses), 'assets/party-sprite.webp', 'assets/oni-sprite.webp']);
    Object.values(content.stages).forEach(configuredStage => {
      Object.values(configuredStage.enemies).forEach(enemy => {
        sources.add(enemy.sprite);
        Object.values(enemy.poses).forEach(source => sources.add(source));
      });
    });
    return Promise.all([...sources].map(preloadSprite)).then(() => {
      spriteAssetsReady = true;
      if (failedSpriteAssets.has(playerPoses.idle)) ui.playerSprite.src = 'assets/party-sprite.webp';
      ui.stageNote.textContent = failedSpriteAssets.size
        ? 'Alguns sprites não carregaram e usarão uma imagem alternativa. Conclua sem perder vida para ganhar a estrela; as 12 estrelas liberam o desafio secreto.'
        : 'Conclua sem perder vida para ganhar a estrela. As 12 estrelas liberam o desafio secreto.';
      ui.stageNote.classList.toggle('warning', failedSpriteAssets.size > 0);
      updateProgressDisplay();
    });
  }

  function setPlayerPose(pose) {
    let source = playerPoses[pose];
    if (failedSpriteAssets.has(source)) source = 'assets/party-sprite.webp';
    if (source && !ui.playerSprite.getAttribute('src').endsWith(source)) {
      ui.playerSprite.src = source;
    }
  }

  function setEnemyPose(pose) {
    let source = currentEnemy?.poses?.[pose] || currentEnemy?.sprite;
    if (failedSpriteAssets.has(source)) source = currentEnemy?.sprite;
    if (failedSpriteAssets.has(source)) source = 'assets/oni-sprite.webp';
    ui.enemyActor.classList.toggle('boss-stunned', Boolean(stage.isBoss && pose === 'defeated'));
    if (source && !ui.enemySprite.getAttribute('src').endsWith(source)) {
      ui.enemySprite.src = source;
    }
  }

  function loadProgress() {
    try {
      const value = JSON.parse(localStorage.getItem(starStorageKey) || '{}');
      const savedProgress = {
        stars: 0,
        completedStages: Array.isArray(value.completedStages) ? [...new Set(value.completedStages)] : [],
        perfectStages: Array.isArray(value.perfectStages) ? [...new Set(value.perfectStages)] : [],
        records: {}
      };
      savedProgress.perfectStages = savedProgress.perfectStages.filter(id => content.stages[id]);
      savedProgress.completedStages = savedProgress.completedStages.filter(id => content.stages[id]);
      Object.entries(value.records && typeof value.records === 'object' ? value.records : {}).forEach(([id, record]) => {
        if (!content.stages[id] || !record || typeof record !== 'object') return;
        const attacks = Number(record.attacks);
        const durationMs = Number(record.durationMs);
        if (Number.isInteger(attacks) && attacks > 0 && Number.isFinite(durationMs) && durationMs >= 0) {
          savedProgress.records[id] = { attacks, durationMs };
        }
      });
      savedProgress.stars = savedProgress.perfectStages.length;
      return savedProgress;
    } catch (_) {
      return { stars: 0, completedStages: [], perfectStages: [], records: {} };
    }
  }

  function saveProgress() {
    try {
      progress.stars = progress.perfectStages.length;
      localStorage.setItem(starStorageKey, JSON.stringify(progress));
    } catch (_) {
      // A fase continua jogável se o navegador bloquear armazenamento.
    }
  }

  function loadSoundSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem(soundSettingsStorageKey)
        || localStorage.getItem('kana-quest-sound-settings-v1') || '{}');
      const legacyVolume = Number(settings.volume);
      const defaults = { music: 0.7, effects: 0.7, interface: 0.35 };
      const stored = settings.volumes || {};
      const volumes = Object.fromEntries(Object.entries(defaults).map(([channel, fallback]) => {
        const value = Number(stored[channel] ?? (channel !== 'interface' && Number.isFinite(legacyVolume) ? legacyVolume : fallback));
        return [channel, Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback];
      }));
      return {
        enabled: settings.enabled !== false,
        volumes
      };
    } catch (_) {
      return { enabled: true, volumes: { music: 0.7, effects: 0.7, interface: 0.35 } };
    }
  }

  function showScreen(name) {
    if (soundManagerOpen) closeSoundManager();
    stopTimer();
    inputAnimating = false;
    const app = document.querySelector('.adventure-app');
    app.classList.toggle('showing-stage-map', name === 'stage');
    app.classList.toggle('showing-battle', name === 'battle');
    if (pendingTransitionTimeout !== null) {
      window.clearTimeout(pendingTransitionTimeout);
      pendingTransitionTimeout = null;
    }
    pendingTransitionCallback = null;
    pendingTransitionDeadline = 0;
    Object.entries(screens).forEach(([key, screen]) => {
      screen.classList.toggle('hidden', key !== name);
    });
    soundController.syncMusic();
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
    const allRegularStagesPerfect = regularStageIds.every(id => progress.perfectStages.includes(id));
    hiraganaIsland.stages.forEach((mapStage, index) => {
      const listItem = document.createElement('li');
      listItem.className = 'stage-node-wrap';
      listItem.style.setProperty('--node-x', mapStage.x);
      listItem.style.setProperty('--node-y', mapStage.y);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'stage-node';
      const stageLabel = document.createElement('span');
      stageLabel.className = 'stage-node-label';
      stageLabel.textContent = mapStage.number;
      button.appendChild(stageLabel);
      const isPlayable = Boolean(mapStage.stageId && content.stages[mapStage.stageId]);
      const wasPerfect = Boolean(mapStage.stageId && progress.perfectStages.includes(mapStage.stageId));
      const wasCompleted = Boolean(mapStage.stageId && progress.completedStages.includes(mapStage.stageId));
      const isSecret = mapStage.type === 'secret';
      const unlocked = isSecret
        ? allRegularStagesPerfect
        : index === 0 || wasCompleted || progress.completedStages.includes(hiraganaIsland.stages[index - 1]?.stageId);
      button.classList.toggle('boss', mapStage.type === 'boss');
      button.classList.toggle('secret', isSecret);
      button.classList.toggle('unlocked', isSecret && allRegularStagesPerfect);
      const statusIcon = document.createElement('span');
      statusIcon.className = 'stage-status-icon';
      statusIcon.setAttribute('aria-hidden', 'true');
      button.appendChild(statusIcon);
      if (isPlayable && unlocked && spriteAssetsReady) {
        button.classList.add(wasCompleted ? 'completed' : 'available');
        statusIcon.textContent = wasCompleted ? '✓' : '▶';
        button.setAttribute('aria-label', isSecret
          ? 'Desafio secreto, disponível'
          : `Fase ${mapStage.number}${mapStage.type === 'boss' ? ', chefe' : ''}, ${wasCompleted ? 'concluída' : 'disponível'}`);
        button.addEventListener('click', () => beginStage(mapStage.stageId));
      } else if (isPlayable && unlocked) {
        button.disabled = true;
        button.classList.add('loading');
        statusIcon.textContent = '…';
        button.setAttribute('aria-label', isSecret ? 'Carregando sprites do desafio secreto' : `Carregando sprites da fase ${mapStage.number}`);
      } else {
        button.disabled = true;
        statusIcon.textContent = '🔒';
        if (isSecret) listItem.classList.add('secret-locked');
        button.setAttribute('aria-label', isSecret
          ? 'Desafio secreto bloqueado: conquiste as 12 estrelas da ilha'
          : `Fase ${mapStage.number}${mapStage.type === 'boss' ? ', chefe' : ''}, bloqueada. Conclua a fase ${mapStage.number - 1} para liberar.`);
      }

      const star = document.createElement('span');
      star.className = `node-star${wasPerfect ? '' : ' unearned'}`;
      star.textContent = wasPerfect ? '★' : '☆';
      star.setAttribute('aria-hidden', 'true');
      button.appendChild(star);
      if (button.hasAttribute('aria-label')) {
        const starDescription = wasPerfect ? 'estrela perfeita conquistada' : 'estrela ainda não conquistada';
        button.setAttribute('aria-label', `${button.getAttribute('aria-label')}, ${starDescription}`);
      }
      listItem.appendChild(button);
      ui.stageNodes.appendChild(listItem);
    });
  }

  function ensureAudio() {
    if (!soundController.enabled) return null;
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextType) return null;
    if (!audioContext) {
      audioContext = new AudioContextType();
      musicGain = audioContext.createGain();
      effectsGain = audioContext.createGain();
      interfaceGain = audioContext.createGain();
      musicGain.connect(audioContext.destination);
      effectsGain.connect(audioContext.destination);
      interfaceGain.connect(audioContext.destination);
      soundController.apply();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        soundController.syncMusic();
      }).catch(() => {});
    }
    soundController.syncMusic();
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
    gain.connect(effectsGain || context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }

  function playSynthDrumHit(accent = false) {
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
    drumGain.connect(effectsGain || context.destination);
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
    noiseGain.connect(effectsGain || context.destination);
    noise.start(now);
  }

  function playSealSound() {
    soundController.play('seal');
  }

  function playFinisherSound() {
    soundController.play('finisher');
  }

  function playErrorSound() {
    playSynthDrumHit(true);
    playTone(155, 0.3, 'sawtooth', 0.055, 0.04);
    playTone(103, 0.34, 'triangle', 0.09, 0.12);
  }

  function setSoundButton() {
    document.querySelectorAll('#soundToggle, #soundToggleModal, #soundToggleMenu').forEach(button => {
      button.textContent = soundController.enabled ? '♫' : '♪̸';
      button.setAttribute('aria-pressed', String(soundController.enabled));
      button.setAttribute('aria-label', soundController.enabled ? 'Silenciar todos os sons' : 'Ativar todos os sons');
    });
    Object.entries(ui.soundChannels).forEach(([channel, controls]) => {
      const volume = soundController.volumes[channel];
      controls.input.value = volume;
      controls.output.value = `${Math.round(volume * 100)}%`;
      controls.input.setAttribute('aria-valuetext', `${Math.round(volume * 100)} por cento`);
    });
  }

  function schedulePendingTransition(callback, delay) {
    if (pendingTransitionTimeout !== null) window.clearTimeout(pendingTransitionTimeout);
    pendingTransitionCallback = callback;
    pendingTransitionDeadline = performance.now() + delay;
    if (soundManagerOpen) {
      pausedTransitionRemaining = delay;
      pendingTransitionTimeout = null;
      return;
    }
    pendingTransitionTimeout = window.setTimeout(() => {
      const transition = pendingTransitionCallback;
      pendingTransitionTimeout = null;
      pendingTransitionCallback = null;
      pendingTransitionDeadline = 0;
      if (!soundManagerOpen) transition?.();
      else {
        pendingTransitionCallback = transition;
        pausedTransitionRemaining = 0;
      }
    }, delay);
  }

  function openSoundManager() {
    if (soundManagerOpen) return;
    soundManagerOpen = true;
    previousSettingsFocus = document.activeElement;
    if (!screens.battle.classList.contains('hidden')) soundManagerOpenedAt = performance.now();
    document.querySelector('.adventure-app').classList.add('sound-manager-open');
    soundManagerInertScreen = Object.values(screens).find(screen => !screen.classList.contains('hidden')) || null;
    if (soundManagerInertScreen) soundManagerInertScreen.inert = true;
    ui.soundManager.classList.remove('hidden');

    if (timerInterval !== null) {
      pausedTimerRemaining = Math.max(0, deadline - performance.now());
      stopTimer();
    }
    if (pendingTransitionTimeout !== null) {
      pausedTransitionRemaining = Math.max(0, pendingTransitionDeadline - performance.now());
      window.clearTimeout(pendingTransitionTimeout);
      pendingTransitionTimeout = null;
    }
    ui.closeSoundManager.focus();
  }

  function closeSoundManager() {
    if (!soundManagerOpen) return;
    soundManagerOpen = false;
    if (soundManagerOpenedAt > 0) {
      stagePausedTimeMs += performance.now() - soundManagerOpenedAt;
      soundManagerOpenedAt = 0;
    }
    ui.soundManager.classList.add('hidden');
    document.querySelector('.adventure-app').classList.remove('sound-manager-open');
    if (soundManagerInertScreen) soundManagerInertScreen.inert = false;
    soundManagerInertScreen = null;

    if (pausedTimerRemaining !== null) {
      const remaining = pausedTimerRemaining;
      pausedTimerRemaining = null;
      if (remaining <= 0 && !locked) resolveMistake('O tempo acabou! O inimigo acertou o ataque.');
      else if (!locked) {
        deadline = performance.now() + remaining;
        updateTimer();
        if (!locked) timerInterval = window.setInterval(updateTimer, 100);
      }
    }
    if (pendingTransitionCallback) {
      const callback = pendingTransitionCallback;
      const delay = pausedTransitionRemaining ?? Math.max(0, pendingTransitionDeadline - performance.now());
      pausedTransitionRemaining = null;
      schedulePendingTransition(callback, delay);
    }
    if (previousSettingsFocus instanceof HTMLElement && previousSettingsFocus.isConnected) previousSettingsFocus.focus();
    previousSettingsFocus = null;
  }

  function playInterfaceSound() {
    soundController.playInterface();
  }

  function beginStage(stageId = stage.id) {
    stage = content.stages[stageId];
    if (!stage) return;
    const selectedEnemy = stage.enemyTypes[Math.floor(Math.random() * stage.enemyTypes.length)];
    currentEnemy = stage.enemies[selectedEnemy];
    stageStartedAt = performance.now();
    stagePausedTimeMs = 0;
    ensureAudio();
    lives = stage.initialLives;
    displayedLives = stage.initialLives;
    enemyHealth = stage.enemyHealth;
    stepIndex = 0;
    currentSequence = [];
    attackCount = 1;
    completedSequenceStreak = 0;
    locked = false;
    lastWrongAnswer = false;
    inputAnimating = false;
    showScreen('battle');
    ui.arena.classList.toggle('boss-fight', stage.isBoss);
    ui.enemySprite.src = currentEnemy.sprite;
    ui.enemySprite.alt = currentEnemy.name;
    ui.enemyActor.setAttribute('aria-label', currentEnemy.name);
    ui.enemyNameLabel.textContent = currentEnemy.name;
    ui.enemyActor.classList.toggle('boss', stage.isBoss);
    setEnemyPose('normal');
    document.getElementById('roundLabel').textContent = stage.isSecret ? 'DESAFIO SECRETO' : `FASE ${stage.number}`;
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
    ui.comboLabel.textContent = `×${completedSequenceStreak}`;
    ui.comboLabel.setAttribute('aria-label', `Combo ${completedSequenceStreak}`);
    renderSequence();
  }

  function renderSequence() {
    const labels = currentSequence.map(kana => {
      const symbolData = stage.symbols.find(symbol => symbol.kana === kana);
      return stage.cardMode !== 'romaji' ? symbolData.romaji : kana;
    });
    layoutTargetSequence(labels.length);
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

  function layoutTargetSequence(sequenceLength) {
    if (window.innerWidth < 900 || sequenceLength <= 0) {
      ui.targetSequence.style.removeProperty('--seal-size');
      ui.targetSequence.style.removeProperty('--seal-font-size');
      ui.targetSequence.style.removeProperty('gap');
      ui.targetSequence.style.removeProperty('width');
      return;
    }
    const arenaWidth = ui.arena.clientWidth;
    if (!arenaWidth) return;
    const gap = Math.min(7, Math.max(2, arenaWidth * 0.0045));
    const maxWidth = arenaWidth * 0.39;
    // Base every sequence on the seven-seal case so short sequences never grow.
    const sealSize = Math.max(44, Math.min(arenaWidth * 0.09, (maxWidth - gap * 6) / 7));
    ui.targetSequence.style.setProperty('--seal-size', `${sealSize}px`);
    ui.targetSequence.style.setProperty('--seal-font-size', `${sealSize * 0.55}px`);
    ui.targetSequence.style.gap = `${gap}px`;
    ui.targetSequence.style.width = `${sealSize * sequenceLength + gap * (sequenceLength - 1)}px`;
  }

  function beginEnemyAttack() {
    stopTimer();
    inputAnimating = false;
    ui.arena.classList.remove('player-damage', 'enemy-impact');
    animateActor(ui.enemyActor, 'attack-windup');
    setEnemyPose('normal');
    ui.playerActor.classList.remove('damaged', 'counter-attack', 'blocking', 'cut');
    setPlayerPose('idle');
    stepIndex = 0;
    locked = false;
    const possibleLengths = stage.sequenceLengthOptions || [stage.symbols.length];
    const selectedLength = possibleLengths[Math.floor(Math.random() * possibleLengths.length)];
    currentSequence = Array.from({ length: selectedLength }, () => {
      return stage.symbols[Math.floor(Math.random() * stage.symbols.length)].kana;
    });
    const secondsPerSeal = Math.max(0.1, Number(stage.secondsPerSeal) || 1);
    // Nos chefes, combos mais altos apertam o prazo; o limite impede que vire impossível.
    const comboTimeFactor = stage.isBoss
      ? Math.max(0.6, 1 / (1 + completedSequenceStreak * 0.08))
      : 1;
    sequenceTimeLimit = currentSequence.length * secondsPerSeal * comboTimeFactor;
    ui.targetSequence.replaceChildren();
    ui.enemyAction.textContent = completedSequenceStreak >= 4
      ? `Combo x${completedSequenceStreak}! Próxima sequência causa 2 de dano.`
      : `${currentEnemy.name} prepara o ataque!`;
    ui.feedback.textContent = stage.cardMode === 'romaji'
      ? 'Toque nos romaji que correspondem aos kana, na ordem.'
      : 'Memorize o ataque em romaji e toque nos kana correspondentes.';
    ui.feedback.className = 'battle-feedback';
    updateBattleHud();
    showOptions();
    ui.timerLabel.textContent = `${sequenceTimeLimit.toFixed(1)}s`;
    ui.timerLabel.style.setProperty('--time-progress', '100');
    schedulePendingTransition(startTimer, reducedMotion ? 0 : 720);
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
    timerInterval = window.setInterval(updateTimer, 100);
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
    if (locked || inputAnimating || soundManagerOpen || timerInterval === null) return;
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
    if (!isFinalHit) {
      setPlayerPose(`hit${(stepIndex % 3) + 1}`);
    }
    if (isFinalHit) playFinisherSound();
    else playSealSound();
    stepIndex++;
    updateBattleHud();
    if (stepIndex >= currentSequence.length) {
      stopTimer();
      resolveCompletedSequence();
      return;
    }
    ui.feedback.textContent = 'Boa! Próximo kana.';
    ui.feedback.className = 'battle-feedback good';
    schedulePendingTransition(() => {
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
    pendingTransitionCallback = null;
    pendingTransitionDeadline = 0;
    pausedTransitionRemaining = null;
    locked = true;
    inputAnimating = true;
    lastWrongAnswer = true;
    completedSequenceStreak = 0;
    lives = Math.max(0, lives - stage.damagePerMistake);
    playErrorSound();
    ui.enemyAction.textContent = 'Ataque recebido!';
    ui.feedback.textContent = message;
    ui.feedback.className = 'battle-feedback bad';
    ui.optionCards.querySelectorAll('button').forEach(button => { button.disabled = true; });
    animateActor(ui.enemyActor, 'attack-lunge');
    setEnemyPose('attack');
    animateActor(ui.playerActor, 'damaged');
    setPlayerPose('damaged');
    ui.arena.classList.remove('player-damage');
    void ui.arena.offsetWidth;
    ui.arena.classList.add('player-damage');
    updateBattleHud();

    if (lives <= 0) {
      finishStage(false);
      return;
    }

    schedulePendingTransition(() => {
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
    completedSequenceStreak++;
    const damage = completedSequenceStreak >= 5 ? 2 : stage.damagePerCompletedSequence;
    enemyHealth = Math.max(0, enemyHealth - damage);
    setEnemyPose(enemyHealth <= 0 ? 'defeated' : 'damage');
    ui.enemyAction.textContent = damage === 2 ? 'Combo! Dano dobrado!' : 'Selo rebatido!';
    ui.feedback.textContent = `Última batida! ${currentEnemy.name} recebeu ${damage} de dano.`;
    ui.feedback.className = 'battle-feedback good';
    animateActor(ui.enemyActor, 'recoil');
    setPlayerPose('finisher');
    animateActor(ui.playerActor, 'counter-attack');
    ui.arena.classList.remove('enemy-impact');
    void ui.arena.offsetWidth;
    ui.arena.classList.add('enemy-impact');
    updateBattleHud();

    if (enemyHealth <= 0) {
      finishStage(true);
      return;
    }
    schedulePendingTransition(() => {
      attackCount++;
      beginEnemyAttack();
    }, 850);
  }

  function finishStage(victory) {
    stopTimer();
    locked = true;
    if (!victory) setPlayerPose('defeated');
    const perfectRun = victory && !lastWrongAnswer;
    const earnedStar = perfectRun && !progress.perfectStages.includes(stage.id);
    const elapsedMs = Math.max(0, performance.now() - stageStartedAt - stagePausedTimeMs);
    let nextStage = null;
    const records = progress.records || (progress.records = {});
    const previousRecord = records[stage.id] || null;
    let newAttackRecord = false;
    let newTimeRecord = false;
    if (victory) {
      if (!progress.completedStages.includes(stage.id)) progress.completedStages.push(stage.id);
      if (perfectRun && !progress.perfectStages.includes(stage.id)) {
        progress.perfectStages.push(stage.id);
        progress.stars++;
      }
      newAttackRecord = !previousRecord || attackCount < previousRecord.attacks;
      newTimeRecord = !previousRecord || elapsedMs < previousRecord.durationMs;
      records[stage.id] = {
        attacks: newAttackRecord ? attackCount : previousRecord.attacks,
        durationMs: newTimeRecord ? elapsedMs : previousRecord.durationMs
      };
      saveProgress();
      nextStage = getNextStage();
      ui.resultIcon.textContent = perfectRun ? '★' : '⚔';
      ui.resultIcon.classList.remove('defeat');
      ui.resultEyebrow.textContent = perfectRun ? 'VITÓRIA PERFEITA' : 'FASE CONCLUÍDA';
      ui.resultTitle.textContent = perfectRun ? 'Perfeito!' : 'Você venceu!';
      ui.resultMessage.textContent = !perfectRun
        ? `${currentEnemy.name} foi derrotado.`
        : earnedStar
          ? 'Você venceu sem perder vida. A estrela é sua!'
          : 'Você venceu sem perder vida. A estrela desta fase já foi conquistada.';
      ui.earnedStar.classList.toggle('hidden', !perfectRun);
    } else {
      ui.resultIcon.textContent = '🛡️';
      ui.resultIcon.classList.add('defeat');
      ui.resultEyebrow.textContent = 'FIM DE COMBATE';
      ui.resultTitle.textContent = 'Seu grupo precisa descansar';
      ui.resultMessage.textContent = 'Tente novamente para concluir a fase.';
      ui.earnedStar.classList.add('hidden');
    }
    ui.resultAttacks.textContent = String(attackCount);
    ui.resultDuration.textContent = formatPhaseTime(elapsedMs);
    ui.resultRecord.textContent = victory && (newAttackRecord || newTimeRecord)
      ? `Novo recorde${newAttackRecord && newTimeRecord ? ' de ataques e tempo' : newAttackRecord ? ' de ataques' : ' de tempo'}!`
      : previousRecord
        ? `Recorde: ${previousRecord.attacks} ataques · ${formatPhaseTime(previousRecord.durationMs)}`
        : 'Seu recorde será registrado ao vencer a fase.';
    ui.nextStageButton.dataset.stageId = nextStage?.stageId || '';
    ui.nextStageButton.classList.toggle('hidden', !nextStage);
    ui.nextStageButton.classList.toggle('primary-button', Boolean(nextStage));
    ui.retryStage.classList.toggle('primary-button', !nextStage);
    ui.retryStage.classList.toggle('secondary-button', Boolean(nextStage));
    ui.modal.classList.remove('hidden');
    (nextStage ? ui.nextStageButton : ui.retryStage).focus();
  }

  function getNextStage() {
    const stageIndex = hiraganaIsland.stages.findIndex(mapStage => mapStage.stageId === stage.id);
    const nextStage = hiraganaIsland.stages[stageIndex + 1];
    if (!nextStage) return null;
    if (nextStage.type === 'secret' && progress.stars < regularStageIds.length) return null;
    return nextStage;
  }

  function formatPhaseTime(durationMs) {
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function resetStageForRetry() {
    ui.modal.classList.add('hidden');
    beginStage();
  }

  document.getElementById('hiraganaIsland').addEventListener('click', showStageMap);
  document.getElementById('backToIslands').addEventListener('click', showIslands);
  document.getElementById('quitBattle').addEventListener('click', showStageMap);
  document.getElementById('retryStage').addEventListener('click', resetStageForRetry);
  ui.nextStageButton.addEventListener('click', () => {
    const nextStageId = ui.nextStageButton.dataset.stageId;
    if (!nextStageId) return;
    beginStage(nextStageId);
  });
  document.getElementById('resultToMap').addEventListener('click', showStageMap);
  function toggleAllSound() {
    const enabled = !soundController.enabled;
    soundController.setEnabled(enabled);
    if (enabled) ensureAudio();
    setSoundButton();
  }
  document.querySelectorAll('#soundToggle, #soundToggleModal, #soundToggleMenu').forEach(button => {
    button.addEventListener('click', toggleAllSound);
  });
  document.querySelectorAll('#openSoundManager, #openSoundManagerMenu').forEach(button => {
    button.addEventListener('click', () => {
      playInterfaceSound();
      openSoundManager();
    });
  });
  ui.closeSoundManager.addEventListener('click', () => {
    playInterfaceSound();
    closeSoundManager();
  });
  ui.soundManager.addEventListener('pointerdown', event => {
    if (event.target === ui.soundManager) closeSoundManager();
  });
  ui.soundManager.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSoundManager();
      return;
    }
    if (event.key !== 'Tab') return;
    const controls = Array.from(ui.soundManager.querySelectorAll('button, input')).filter(element => !element.disabled);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  Object.entries(ui.soundChannels).forEach(([channel, controls]) => {
    controls.input.addEventListener('input', () => {
      soundController.setVolume(channel, controls.input.value);
      setSoundButton();
    });
  });
  document.addEventListener('click', event => {
    if (!soundController.enabled) return;
    const control = event.target.closest('button, a[href], [role="button"]');
    if (!control || control.matches('.option-card, .sound-manager button, #openSoundManager, #openSoundManagerMenu')) return;
    playInterfaceSound();
  });

  window.addEventListener('resize', () => {
    if (!screens.battle.classList.contains('hidden')) layoutTargetSequence(currentSequence.length);
  });

  const unlockMenuAudio = () => { if (soundController.enabled) ensureAudio(); };
  document.addEventListener('pointerdown', unlockMenuAudio, { once: true, capture: true });
  document.addEventListener('keydown', unlockMenuAudio, { once: true, capture: true });

  setSoundButton();
  updateProgressDisplay();
  preloadAdventureSprites().catch(() => {
    spriteAssetsReady = true;
    failedSpriteAssets.add('assets/party-pose-1.webp');
    ui.playerSprite.src = 'assets/party-sprite.webp';
    ui.stageNote.textContent = 'Alguns sprites não carregaram; imagens alternativas serão usadas. Conclua sem perder vida para ganhar a estrela. As 12 estrelas liberam o desafio secreto.';
    ui.stageNote.classList.add('warning');
    updateProgressDisplay();
  });
})();
