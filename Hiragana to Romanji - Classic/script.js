// Encapsulamento de todo o código JS em um IIFE para evitar poluir o escopo global
(function() {
  // Conjuntos de caracteres Hiragana e Romanji
  const sets = {
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
  const setNames = {
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
  // ...utilitários agora em audioUtils.js e uiUtils.js...
  // ...estado do treino e utilitários...
  // Estado do treino
  // ...apenas utilitários e estado global...
  // Para ciclo completo de treino
// ...existing code...
})()
