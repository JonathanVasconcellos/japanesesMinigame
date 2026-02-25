// Conjuntos de caracteres Hiragana e Katakana com Romanji
document.addEventListener('DOMContentLoaded', function() {
  // Conjuntos de Hiragana
  window.hiraganaSets = {
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
    nFinal: [["ん", "n"]],
    gSeries: [["が", "ga"], ["ぎ", "gi"], ["ぐ", "gu"], ["げ", "ge"], ["ご", "go"]],
    zSeries: [["ざ", "za"], ["じ", "ji"], ["ず", "zu"], ["ぜ", "ze"], ["ぞ", "zo"]],
    dSeries: [["だ", "da"], ["ぢ", "ji"], ["づ", "zu"], ["で", "de"], ["ど", "do"]],
    bSeries: [["ば", "ba"], ["び", "bi"], ["ぶ", "bu"], ["べ", "be"], ["ぼ", "bo"]],
    pSeries: [["ぱ", "pa"], ["ぴ", "pi"], ["ぷ", "pu"], ["ぺ", "pe"], ["ぽ", "po"]]
  };

  // Conjuntos de Katakana
  window.katakanaSets = {
    vowels: [["ア", "a"], ["イ", "i"], ["ウ", "u"], ["エ", "e"], ["オ", "o"]],
    kSeries: [["カ", "ka"], ["キ", "ki"], ["ク", "ku"], ["ケ", "ke"], ["コ", "ko"]],
    sSeries: [["サ", "sa"], ["シ", "shi"], ["ス", "su"], ["セ", "se"], ["ソ", "so"]],
    tSeries: [["タ", "ta"], ["チ", "chi"], ["ツ", "tsu"], ["テ", "te"], ["ト", "to"]],
    nSeries: [["ナ", "na"], ["ニ", "ni"], ["ヌ", "nu"], ["ネ", "ne"], ["ノ", "no"]],
    hSeries: [["ハ", "ha"], ["ヒ", "hi"], ["フ", "fu"], ["ヘ", "he"], ["ホ", "ho"]],
    mSeries: [["マ", "ma"], ["ミ", "mi"], ["ム", "mu"], ["メ", "me"], ["モ", "mo"]],
    ySeries: [["ヤ", "ya"], ["ユ", "yu"], ["ヨ", "yo"]],
    rSeries: [["ラ", "ra"], ["リ", "ri"], ["ル", "ru"], ["レ", "re"], ["ロ", "ro"]],
    wSeries: [["ワ", "wa"], ["ヲ", "wo"]],
    nFinal: [["ン", "n"]],
    gSeries: [["ガ", "ga"], ["ギ", "gi"], ["グ", "gu"], ["ゲ", "ge"], ["ゴ", "go"]],
    zSeries: [["ザ", "za"], ["ジ", "ji"], ["ズ", "zu"], ["ゼ", "ze"], ["ゾ", "zo"]],
    dSeries: [["ダ", "da"], ["ヂ", "ji"], ["ヅ", "zu"], ["デ", "de"], ["ド", "do"]],
    bSeries: [["バ", "ba"], ["ビ", "bi"], ["ブ", "bu"], ["ベ", "be"], ["ボ", "bo"]],
    pSeries: [["パ", "pa"], ["ピ", "pi"], ["プ", "pu"], ["ペ", "pe"], ["ポ", "po"]]
  };

  window.setNames = {
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
    nFinal: "N Final",
    gSeries: "Série G",
    zSeries: "Série Z",
    dSeries: "Série D",
    bSeries: "Série B",
    pSeries: "Série P"
  };

  // Define o conjunto ativo inicial como Hiragana
  window.sets = window.hiraganaSets;
  window.currentAlphabet = 'hiragana';

  // Função para alternar entre Hiragana e Katakana
  window.switchAlphabet = function(alphabet) {
    window.currentAlphabet = alphabet;
    window.sets = alphabet === 'hiragana' ? window.hiraganaSets : window.katakanaSets;
    updateCheckboxLabels();
  };

  // Atualiza os labels dos checkboxes com os caracteres corretos
  function updateCheckboxLabels() {
    const checkboxes = document.querySelectorAll('.setCheck');
    checkboxes.forEach(cb => {
      const setKey = cb.value;
      const setData = window.sets[setKey];
      const setName = window.setNames[setKey];
      const label = cb.parentElement;
      
      if (setData && setName) {
        const chars = setData.map(pair => pair[0]).join(', ');
        label.childNodes[1].textContent = ` ${setName} (${chars})`;
      }
    });
  }

  // Inicializa os labels
  updateCheckboxLabels();

  const alphabetRadios = document.querySelectorAll('input[name="alphabet"]');
  alphabetRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      window.switchAlphabet(this.value);
    });
  });

  const exitToHomeBtn = document.getElementById('exitToHomeBtn');
  if (exitToHomeBtn) {
    exitToHomeBtn.addEventListener('click', () => {
      window.location.href = '../index.html';
    });
  }
});
