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
  const enemyPoses = enemy => Object.fromEntries(
    ['idle', 'attack', 'hit', 'stunned'].map(pose => [pose, `assets/${enemy}-${pose}.webp`])
  );
  const stageDefinitions = [
    { id: 'first-coast-battle', number: 1, name: 'Família das vogais', families: ['vowels'], health: 5, enemy: 'frog' },
    { id: 'hiragana-k', number: 2, name: 'Família K', families: ['k'], enemy: 'frog' },
    { id: 'hiragana-s', number: 3, name: 'Família S', families: ['s'], enemy: 'frog' },
    { id: 'hiragana-boss-1', number: 4, name: 'Guardião do primeiro bloco', families: ['vowels', 'k', 's'], boss: true },
    { id: 'hiragana-t', number: 5, name: 'Família T', families: ['t'], enemy: 'fox' },
    { id: 'hiragana-h', number: 6, name: 'Família H', families: ['h'], enemy: 'fox' },
    { id: 'hiragana-n', number: 7, name: 'Família N', families: ['n'], enemy: 'fox' },
    { id: 'hiragana-boss-2', number: 8, name: 'Guardião do segundo bloco', families: ['t', 'h', 'n'], boss: true },
    { id: 'hiragana-m', number: 9, name: 'Família M', families: ['m'], enemy: 'monkey' },
    { id: 'hiragana-ywn', number: 10, name: 'Família Y, W e ん', families: ['ywn'], enemy: 'monkey' },
    { id: 'hiragana-r', number: 11, name: 'Família R', families: ['r'], enemy: 'monkey' },
    { id: 'hiragana-boss-3', number: 12, name: 'Guardião final do Hiragana', families: ['m', 'ywn', 'r'], boss: true },
    { id: 'hiragana-secret', number: 13, name: 'Desafio secreto: todos os kana', families: Object.keys(families), enemy: 'monkey', secret: true }
  ];

  const enemyNames = { frog: 'Sapo da Floresta', fox: 'Raposa da Trilha', monkey: 'Macaco da Montanha' };

  const stages = Object.fromEntries(stageDefinitions.map(definition => {
    const isBoss = Boolean(definition.boss);
    const poses = enemyPoses(isBoss ? 'dragon' : definition.enemy);
    const selectedFamilies = definition.families.map(key => families[key]);
    return [definition.id, {
      id: definition.id,
      islandId: 'hiragana',
      number: definition.number,
      name: definition.name,
      enemyName: isBoss ? 'Dragão Guardião' : enemyNames[definition.enemy],
      enemyEmoji: isBoss ? '🐉' : definition.enemy === 'frog' ? '🐸' : definition.enemy === 'fox' ? '🦊' : '🐒',
      enemySprite: poses.idle,
      enemyPoses: poses,
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

  // A ordem do caminho acompanha os pontos do SVG do mapa.
  const mapPoints = [
    ['50%', '92%'], ['50%', '85%'], ['36%', '78%'], ['62%', '71%'],
    ['65%', '64%'], ['42%', '57%'], ['25%', '50%'], ['58%', '43%'],
    ['73%', '36%'], ['44%', '29%'], ['29%', '22%'], ['60%', '15%'], ['66%', '7%']
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
