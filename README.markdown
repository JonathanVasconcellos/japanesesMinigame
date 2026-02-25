# Hiragana Learning Games

Projeto web com dois minigames para treinar hiragana, com foco em uso mobile:

- **Modo Clássico**: memória (hiragana ↔ romaji) + modo treino.
- **Modo com Imagens**: memória (hiragana ↔ imagem).

Ambos compartilham o mesmo visual, música/efeitos e layout responsivo.

## Acesso

1. Abra `index.html` na raiz do projeto.
2. Escolha um modo:
   - **Modo Clássico**
   - **Modo com Imagens**

## Estrutura real do projeto

```text
japanesesMinigame/
├── index.html
├── music.js
├── shared-game.css
├── README.markdown
├── Hiragana to Romanji - Classic/
│   ├── jogo_memoria_hiragana_completo.html
│   ├── style.css
│   ├── script.js
│   ├── music-fade.js
│   ├── js/
│   │   ├── audioUtils.js
│   │   ├── gameClassic.js
│   │   ├── main.js
│   │   ├── sets.js
│   │   ├── trainingMode.js
│   │   └── uiUtils.js
│   └── Sound/
└── Hiragana to Romanji - Images/
    ├── jogo_memoria_hiragana_imagem.html
    ├── style.css
    ├── script_hiragana_imagem.js
    ├── music-fade.js
    ├── audios/
    └── imagens/
```

## Arquitetura de estilo

- O visual base está em `shared-game.css` (usado pelos dois jogos).
- Cada `style.css` local apenas importa o CSS compartilhado.
- Objetivo: manter os modos visualmente consistentes e facilitar manutenção.

## Funcionalidades

### Modo Clássico

- Seleção de conjuntos de hiragana.
- Quantidade de cartas: `8`, `16`, `20`, `30`.
- Estatísticas de partida: tempo, tentativas, acertos.
- Modo treino com até 30 rodadas.
- Exibição de erros no treino ao final (caractere, resposta digitada e resposta correta).

### Modo com Imagens

- Dificuldades: **Básico**, **Intermediário**, **Avançado**.
- Quantidade de cartas: `8`, `16`, `20`, `30`.
- Estatísticas de partida: modo, tempo, tentativas, acertos.
- Pré-aquecimento de imagens por dificuldade/alfabeto para reduzir atraso no primeiro início.

## Melhorias recentes

- **Áudio global unificado** entre telas (menu e modos), com botão de música sincronizado.
- **Botão de música mais discreto** e ainda reconhecível.
- **Início mais rápido de partida**:
    - Modo Clássico: transição imediata de UI e montagem no frame seguinte.
    - Modo Imagens: preload não bloqueante + aquecimento por seleção.
- **Resumo de modo no Clássico** mais compacto:
    - mostra `Todas as séries` quando todas estão marcadas;
    - remove repetição do prefixo `Série` na listagem.
- **Correção do treino (Clássico)** para garantir exibição da lista de erros ao concluir.

## Mobile-first

- Interface otimizada para smartphone.
- Elementos principais (menu, controles, estatísticas e tabuleiro) dimensionados para caber no viewport.
- Ajustes de fonte, grid e espaçamento para telas menores.

## Áudio

- Música de fundo e efeitos sonoros nos dois modos.

## Tecnologias

- HTML5
- CSS3
- JavaScript (vanilla)

## Execução local

Pode abrir `index.html` diretamente, mas para maior compatibilidade de assets é recomendado servidor local (ex.: Live Server no VS Code).

## Contribuição

1. Faça um fork
2. Crie uma branch (`git checkout -b minha-feature`)
3. Commit (`git commit -m "Minha alteração"`)
4. Push (`git push origin minha-feature`)
5. Abra um Pull Request
