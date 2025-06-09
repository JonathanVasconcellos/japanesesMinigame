# Hiragana Learning Games

Um projeto que combina **dois jogos interativos** para aprender hiragana de forma divertida e eficaz. Acesse os jogos através de uma página inicial que permite escolher entre o **Modo Clássico** (jogo de memória com caracteres hiragana e romaji, mais modo treino) e o **Modo Com Imagens** (jogo de memória com palavras em hiragana, romaji e imagens). Ideal para estudantes de japonês que desejam praticar leitura, memorização e reconhecimento de hiragana.

## Sobre o Projeto

Este repositório contém dois jogos web para aprendizado de hiragana, acessados via `index.html` na raiz. Ambos são responsivos, suportam modo escuro, incluem efeitos sonoros e música de fundo, e oferecem uma experiência de aprendizado envolvente.

### Página Inicial
- O arquivo `index.html` serve como ponto de entrada, com botões para:
  - **Modo Clássico**: Jogo de memória e treino com caracteres hiragana e romaji.
  - **Modo Com Imagens**: Jogo de memória com palavras e imagens ilustrativas.

### Jogo 1: Modo Clássico
O **Modo Clássico** inclui um jogo de memória onde o jogador combina pares de cartas (hiragana com romaji, sem imagens) e um modo treino para praticar a transcrição de romaji.

#### Funcionalidades
- **Jogo de Memória**:
  - Níveis: 8, 16, 20 ou 30 cartas (4, 8, 10 ou 15 pares).
  - Layout do tabuleiro:
    - Desktop: 2x4 (8 cartas), 4x4 (16 cartas), 4x5 (20 cartas), 5x6 (30 cartas).
    - Mobile: 3x4 (8 cartas), 4x4 (16 cartas), 4x5 (20 cartas), 5x6 (30 cartas).
  - Seleção de 16 conjuntos de hiragana (vogais, séries K, S, T, G, etc.).
  - Estatísticas: Tempo, tentativas e acertos.
  - Modal de vitória com resumo do desempenho.
- **Modo Treino**:
  - Exibe um caractere hiragana; o jogador digita o romaji.
  - Limite de 30 tentativas, com rastreamento de acertos, erros e lista de erros.
  - Prioriza caracteres com mais erros.
- **Recursos**:
  - Interface responsiva.
  - Modo escuro (salvo em `localStorage`).
  - Música de fundo (pausável) e efeitos sonoros (virar carta, acerto, erro, vitória).
  - Textos: 2.5em para hiragana, 1.3em para romaji no desktop; 2em no mobile.

### Jogo 2: Modo Com Imagens
O **Modo Com Imagens** é um jogo de memória onde o jogador combina pares de cartas com palavras em hiragana e romaji, com imagens nas cartas romaji para reforço visual.

#### Funcionalidades
- Níveis: 10, 15 ou 20 pares (20, 30 ou 40 cartas).
- Dificuldades: Básico (ex.: "ねこ"), Intermediário (ex.: "くるま"), Avançado (ex.: "こんにちは").
- Layout do tabuleiro:
  - Desktop: 5x4 (20 cartas), 6x5 (30 cartas), 8x5 (40 cartas).
  - Mobile: 4x5 (20 cartas), 5x6 (30 cartas), 5x8 (40 cartas).
- Estatísticas: Tempo, tentativas e acertos.
- Modal de vitória com resumo do desempenho.
- Recursos:
  - Interface responsiva.
  - Modo escuro (salvo em `localStorage`).
  - Música de fundo (pausável) e efeitos sonoros.
  - Textos: 1.2em para hiragana/romaji no desktop; 0.8–0.85em no mobile.
  - Imagens nas cartas romaji (ex.: `imagens/neko.png`).

## Como Executar o Projeto

### Pré-requisitos
- Navegador web moderno (Chrome, Firefox, Safari, etc.).
- Servidor local (recomendado, ex.: Live Server no VS Code) para carregar recursos.

### Passos para Instalação
1. **Clone o repositório**:
   ```bash
   git clone https://github.com/JonathanVasconcellos/japanesesMinigame.git
   cd hiragana-learning-games
   ```
2. **Abra a página inicial**:
   - Abra `index.html` em um navegador ou use um servidor local.
   - Clique em "Modo Clássico" ou "Modo Com Imagens".
3. **Verifique os recursos**:
   - **Modo Clássico** (pasta `classico/`):
     - `jogo_memoria_hiragana_completo.html`
     - `style.css`
     - `script.js`
     - Pasta `Sound/` com `flip.mp3`, `match.mp3`, `error.mp3`, `win.mp3`, `click.mp3`, `background.mp3`
   - **Modo Com Imagens** (pasta `com-imagens/`):
     - `hiragana_memory_game.html`
     - `style.css`
     - `script.js`
     - Pasta `imagens/` com PNGs (80x80px ou 100x100px)
     - Pasta `audios/` com `flip.mp3`, `match.mp3`, `error.mp3`, `win.mp3`, `click.mp3`, `background.mp3`
4. **Jogue**:
   - **Modo Clássico**:
     - Escolha conjuntos de hiragana e número de cartas.
     - Combine cartas (memória) ou digite romaji (treino).
   - **Modo Com Imagens**:
     - Escolha dificuldade (básico, intermediário, avançado) e número de pares.
     - Combine cartas de hiragana com romaji/imagens.

### Estrutura de Arquivos
```
japanesesMinigame/
├── index.html                           # Página inicial
├── classico/                            # Modo Clássico
│   ├── jogo_memoria_hiragana_completo.html  # HTML
│   ├── style.css                        # Estilos
│   ├── script.js                        # Lógica
│   ├── Sound/                           # Áudios
│   │   ├── flip.mp3
│   │   ├── match.mp3
│   │   ├── error.mp3
│   │   ├── win.mp3
│   │   ├── click.mp3
│   │   ├── background.mp3
├── com-imagens/                         # Modo Com Imagens
│   ├── hiragana_memory_game.html         # HTML
│   ├── style.css                        # Estilos
│   ├── script.js                        # Lógica
│   ├── imagens/                          # Imagens PNG
│   ├── audios/                          # Áudios
│   │   ├── flip.mp3
│   │   ├── match.mp3
│   │   ├── error.mp3
│   │   ├── win.mp3
│   │   ├── click.mp3
│   │   ├── background.mp3
└── README.md                            # Documentação
```

## Tecnologias Utilizadas
- **HTML5**: Estrutura das páginas.
- **CSS3**: Estilização com CSS Grid, media queries, e transições.
- **JavaScript**: Lógica, manipulação do DOM, e controle de áudio.
- **Fontes**: `Noto Sans Japanese` para hiragana, fallback Arial.
- **Áudio**: Arquivos MP3 para música e efeitos.
- **Imagens** (Modo Com Imagens): PNGs otimizados.

## Como Contribuir
1. Faça um fork do repositório.
2. Crie uma branch:
   ```bash
   git checkout -b minha-feature
   ```
3. Commit suas alterações:
   ```bash
   git commit -m "Descrição da alteração"
   ```
4. Envie para o repositório remoto:
   ```bash
   git push origin minha-feature
   ```
5. Abra um Pull Request.

### Sugestões de Melhorias
- Adicionar katakana.
- Incluir animações para virar cartas.
- Implementar pontuação persistente (`localStorage`).
- Adicionar modo treino ao Modo Com Imagens.

## Licença
Licenciado sob a [MIT License](LICENSE).

## Contato
Dúvidas ou sugestões? Abra uma issue.

---

**Aproveite o aprendizado de hiragana com estes jogos interativos!**
