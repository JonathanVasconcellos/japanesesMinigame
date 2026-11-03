# Hiragana Learning Games

Projeto web com dois minigames para treinar hiragana, com foco em uso mobile:

- **Modo Clássico**: memória (hiragana ↔ romaji) + modo treino.
- **Modo com Imagens**: memória (hiragana ↔ imagem).
- **Aventura**: protótipo mobile de combate por sequências de kana.

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
├── music.js                         # música compartilhada entre páginas
├── shared-game.css
├── README.markdown
├── Adventure/
│   ├── adventure.html
│   ├── adventure.css
│   ├── adventure.js
│   └── adventure-data.js
├── Hiragana to Romanji - Classic/
│   ├── jogo_memoria_hiragana_completo.html
│   ├── style.css
│   ├── js/
│   │   ├── audioUtils.js
│   │   ├── gameClassic.js
│   │   ├── sets.js
│   │   ├── trainingMode.js
│   └── Sound/
└── Hiragana to Romanji - Images/
    ├── jogo_memoria_hiragana_imagem.html
    ├── style.css
    ├── script_hiragana_imagem.js
    ├── audios/
    └── imagens/
```

## Arquitetura de estilo

- O visual base está em `shared-game.css` (usado pelos dois jogos).
- Cada `style.css` local apenas importa o CSS compartilhado.
- Objetivo: manter os modos visualmente consistentes e facilitar manutenção.

## Funcionalidades

### Aventura (protótipo)

- Ilha Hiragana ativa; ilhas Katakana e Misturada aparecem como futuras áreas.
- Mapa da ilha com trilha sinuosa, fases numeradas e marcação da estrela perfeita; a primeira fase está aberta e as seguintes aparecem bloqueadas.
- Primeira fase com sequências aleatórias de vogais, em comprimentos configuráveis de 3 a 5 etapas.
- Três opções touch-first são renovadas após cada acerto; fases podem usar romaji, hiragana, katakana ou cartas misturadas.
- Um toque certo aciona uma batida de tambor; completar a sequência toca um grito de guerra e falhas recebem som de erro.
- Erro ou tempo esgotado cancela o ataque e reduz uma vida; uma sequência completa defende e causa dano ao Oni.
- A estrela da fase é concedida somente ao vencer sem perder vida e fica salva localmente.
- Batidas e efeitos são sintetizados no navegador, sem áudio adicional para baixar.

### Modo Clássico

- Seleção de conjuntos de hiragana.
- Quantidade de cartas: `8`, `16`, `20`, `30`.
- Estatísticas de partida: tempo, tentativas, acertos.
- Modo treino com até 30 rodadas.
- Após um erro, mostra a resposta correta antes de avançar e guarda o caractere para revisão no próximo treino.
- Botão de estatísticas disponível apenas no modo treino; resultados acumulados por aba não são apagados ao reiniciar.
- Exibição dos erros da rodada ao final (caractere, resposta digitada e resposta correta).

### Modo com Imagens

- Dificuldades: **Básico**, **Intermediário**, **Avançado**.
- Quantidade de cartas: `8`, `16`, `20`, `30`.
- Estatísticas de partida: modo, tempo, tentativas, acertos.
- Pré-aquecimento de imagens por dificuldade/alfabeto para reduzir atraso no primeiro início.

### Próxima evolução da Aventura

- Configurações de ilha e fase ficam separadas do motor de combate em `Adventure/adventure-data.js`.
- A progressão salva as estrelas por fase no armazenamento local do navegador; adicionar sincronização entre dispositivos exigirá uma etapa separada.

## Melhorias recentes

- **Controle único de música** entre menu e modos, preservando reprodução, pausa e posição ao navegar.
- **Botão de música mais discreto** e ainda reconhecível.
- **Início mais rápido de partida**:
    - Modo Clássico: transição imediata de UI e montagem no frame seguinte.
    - Modo Imagens: preload não bloqueante + aquecimento por seleção.
- **Resumo de modo no Clássico** mais compacto:
    - mostra `Todas as séries` quando todas estão marcadas;
    - remove repetição do prefixo `Série` na listagem.
- **Correção do treino (Clássico)** para garantir exibição da lista de erros ao concluir.
- Cronômetros encerrados ao sair da partida e exibidos sem ultrapassar 59 segundos.

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
