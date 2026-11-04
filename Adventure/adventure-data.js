// Conteúdo separado do motor para facilitar a expansão das ilhas e fases.
(() => {
  const families = {
    vowels: [
      ['あ', 'ア', 'A'], ['い', 'イ', 'I'], ['う', 'ウ', 'U'], ['え', 'エ', 'E'], ['お', 'オ', 'O']
    ],
    k: [['か', 'カ', 'KA'], ['き', 'キ', 'KI'], ['く', 'ク', 'KU'], ['け', 'ケ', 'KE'], ['こ', 'コ', 'KO']],
    s: [['さ', 'サ', 'SA'], ['し', 'シ', 'SHI'], ['す', 'ス', 'SU'], ['せ', 'セ', 'SE'], ['そ', 'ソ', 'SO']],
    t: [['た', 'タ', 'TA'], ['ち', 'チ', 'CHI'], ['つ', 'ツ', 'TSU'], ['て', 'テ', 'TE'], ['と', 'ト', 'TO']],
    h: [['は', 'ハ', 'HA'], ['ひ', 'ヒ', 'HI'], ['ふ', 'フ', 'FU'], ['へ', 'ヘ', 'HE'], ['ほ', 'ホ', 'HO']],
    n: [['な', 'ナ', 'NA'], ['に', 'ニ', 'NI'], ['ぬ', 'ヌ', 'NU'], ['ね', 'ネ', 'NE'], ['の', 'ノ', 'NO']],
    m: [['ま', 'マ', 'MA'], ['み', 'ミ', 'MI'], ['む', 'ム', 'MU'], ['め', 'メ', 'ME'], ['も', 'モ', 'MO']],
    ywn: [['や', 'ヤ', 'YA'], ['ゆ', 'ユ', 'YU'], ['よ', 'ヨ', 'YO'], ['わ', 'ワ', 'WA'], ['を', 'ヲ', 'WO'], ['ん', 'ン', 'N']],
    r: [['ら', 'ラ', 'RA'], ['り', 'リ', 'RI'], ['る', 'ル', 'RU'], ['れ', 'レ', 'RE'], ['ろ', 'ロ', 'RO']]
  };

  const toSymbols = entries => entries.map(([kana, katakana, romaji]) => ({ kana, katakana, romaji }));
  const flatten = (...groups) => groups.flatMap(group => group);
  const enemyProfile = (id, name, emoji) => ({
    id,
    name,
    emoji,
    sprite: `assets/${id}-idle.webp`,
    poses: {
      normal: `assets/${id}-idle.webp`,
      attack: `assets/${id}-attack.webp`,
      damage: `assets/${id}-hit.webp`,
      defeated: `assets/${id}-stunned.webp`
    }
  });
  const commonEnemies = {
    frog: enemyProfile('frog', 'Sapo da Floresta', '🐸'),
    fox: enemyProfile('fox', 'Raposa da Trilha', '🦊'),
    monkey: enemyProfile('monkey', 'Macaco da Montanha', '🐒')
  };
  const bossEnemy = enemyProfile('dragon', 'Dragão Guardião', '🐉');
  const stageDefinitions = [
    { id: 'first-coast-battle', number: 1, name: 'Família das vogais', families: ['vowels'], health: 5 },
    { id: 'hiragana-k', number: 2, name: 'Família K', families: ['k'] },
    { id: 'hiragana-s', number: 3, name: 'Família S', families: ['s'] },
    { id: 'hiragana-boss-1', number: 4, name: 'Guardião do primeiro bloco', families: ['vowels', 'k', 's'], boss: true },
    { id: 'hiragana-t', number: 5, name: 'Família T', families: ['t'] },
    { id: 'hiragana-h', number: 6, name: 'Família H', families: ['h'] },
    { id: 'hiragana-n', number: 7, name: 'Família N', families: ['n'] },
    { id: 'hiragana-boss-2', number: 8, name: 'Guardião do segundo bloco', families: ['t', 'h', 'n'], boss: true },
    { id: 'hiragana-m', number: 9, name: 'Família M', families: ['m'] },
    { id: 'hiragana-ywn', number: 10, name: 'Família Y, W e ん', families: ['ywn'] },
    { id: 'hiragana-r', number: 11, name: 'Família R', families: ['r'] },
    { id: 'hiragana-boss-3', number: 12, name: 'Guardião final do Hiragana', families: ['m', 'ywn', 'r'], boss: true },
    { id: 'hiragana-secret', number: 13, name: 'Desafio secreto: todos os kana', families: Object.keys(families), secret: true }
  ];

  const stages = Object.fromEntries(stageDefinitions.map(definition => {
    const isBoss = Boolean(definition.boss);
    const selectedFamilies = definition.families.map(key => families[key]);
    const enemies = isBoss ? { dragon: bossEnemy } : commonEnemies;
    return [definition.id, {
      id: definition.id,
      islandId: 'hiragana',
      number: definition.number,
      name: definition.name,
      enemyTypes: Object.keys(enemies),
      enemies,
      isBoss,
      isSecret: Boolean(definition.secret),
      symbols: toSymbols(flatten(...selectedFamilies)),
      sequenceLengthOptions: isBoss ? [5, 6, 7] : [3, 4, 5],
      cardMode: 'romaji',
      initialLives: 3,
      enemyHealth: definition.health || (isBoss ? 20 : 10),
      secondsPerSeal: 1.5,
      correctChoiceCount: 3,
      damagePerMistake: 1,
      damagePerCompletedSequence: 1
    }];
  }));

  // A ordem do caminho acompanha as curvas da arte de fundo do mapa.
  const mapPoints = [
    ['77.2%', '80.5%'], ['57.1%', '78%'], ['35.1%', '77.2%'], ['15.9%', '65.5%'],
    ['42.7%', '59.1%'], ['66.8%', '58.6%'], ['77.6%', '45.1%'], ['54.4%', '43.4%'],
    ['18.8%', '39.7%'], ['41.5%', '30%'], ['65.8%', '29.9%'], ['81.4%', '19.2%'], ['90.9%', '35.9%']
  ];
  const mapOrder = stageDefinitions.map(({ id, number, boss, secret }, index) => ({
    number: secret ? '✦' : number,
    stageId: id,
    type: secret ? 'secret' : boss ? 'boss' : 'regular',
    x: mapPoints[index][0],
    y: mapPoints[index][1]
  }));

  window.ADVENTURE_CONTENT = {
    version: 1,
    regularStageIds: stageDefinitions.filter(definition => !definition.secret).map(definition => definition.id),
    islands: [
      {
        id: 'hiragana', name: 'Ilha Hiragana', alphabet: 'hiragana', unlocked: true,
        stages: mapOrder
      },
      { id: 'katakana', name: 'Ilha Katakana', alphabet: 'katakana', unlocked: false, stageIds: [] },
      { id: 'mixed', name: 'Ilha Misturada', alphabet: 'mixed', unlocked: false, stageIds: [] }
    ],
    stages
  };
})();
