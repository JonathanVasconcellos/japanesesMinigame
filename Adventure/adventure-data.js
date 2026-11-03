// Dados de ilha e fase separados do motor de combate para facilitar expansões.
window.ADVENTURE_CONTENT = {
  version: 1,
  islands: [
    {
      id: 'hiragana', name: 'Ilha Hiragana', alphabet: 'hiragana', unlocked: true,
      stages: [
        { number: 1, stageId: 'first-coast-battle', x: '52%', y: '88%' },
        { number: 2, stageId: null, x: '52%', y: '76%' },
        { number: 3, stageId: null, x: '66%', y: '64%' },
        { number: 4, stageId: null, x: '40%', y: '53%' },
        { number: 5, stageId: null, x: '29%', y: '41%' },
        { number: 6, stageId: null, x: '56%', y: '29%' },
        { number: 7, stageId: null, x: '52%', y: '17%' },
        { number: 8, stageId: null, x: '28%', y: '7%' }
      ]
    },
    { id: 'katakana', name: 'Ilha Katakana', alphabet: 'katakana', unlocked: false, stageIds: [] },
    { id: 'mixed', name: 'Ilha Misturada', alphabet: 'mixed', unlocked: false, stageIds: [] }
  ],
  stages: {
    'first-coast-battle': {
      id: 'first-coast-battle',
      islandId: 'hiragana',
      name: 'O primeiro confronto',
      enemyName: 'Oni da Costa',
      enemyEmoji: '👹',
      symbols: [
        { kana: 'あ', katakana: 'ア', romaji: 'A' },
        { kana: 'い', katakana: 'イ', romaji: 'I' },
        { kana: 'う', katakana: 'ウ', romaji: 'U' },
        { kana: 'え', katakana: 'エ', romaji: 'E' },
        { kana: 'お', katakana: 'オ', romaji: 'O' }
      ],
      sequenceLengthOptions: [3, 4, 5],
      cardMode: 'romaji',
      initialLives: 3,
      enemyHealth: 5,
      secondsPerSeal: 2,
      correctChoiceCount: 3,
      damagePerMistake: 1,
      damagePerCompletedSequence: 1
    }
  }
};
