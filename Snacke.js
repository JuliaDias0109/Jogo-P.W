'use strict'; // Ativa modo restrito do JavaScript (mais seguro)

// ---------- Seleção de elementos do HTML ----------
const tela = document.getElementById('gameCanvas'); // Canvas onde o jogo será desenhado
const pincel = tela.getContext('2d'); // Contexto 2D para desenhar no canvas

const botaoIniciar = document.getElementById('startBtn');
const botaoPausar = document.getElementById('pauseBtn');
const botaoReiniciar = document.getElementById('restartBtn');
const seletorDificuldade = document.getElementById('difficulty');
const placarElemento = document.getElementById('score');
const recordeElemento = document.getElementById('highscore');
const textoOverlay = document.getElementById('overlayText');
const overlay = document.getElementById('overlay');

const botoesMobile = document.querySelectorAll('.btn-dir'); // Botões de direção para celular

// ---------- Variáveis principais do jogo ----------
const TAMANHO_BLOCO = 20; // Tamanho de cada quadrado
const COLUNAS = Math.floor(tela.width / TAMANHO_BLOCO);
const LINHAS = Math.floor(tela.height / TAMANHO_BLOCO);

let cobra;           // Corpo da cobra (array de posições)
let direcao;         // Direção atual da cobra
let proximaDirecao;  // Direção que a cobra irá assumir no próximo movimento
let comida;          // Posição da comida
let pontuacao = 0;   // Pontuação atual
let recorde = 0;     // Maior pontuação salva
let intervaloJogo = null;
let rodando = false; // Indica se o jogo está funcionando
let velocidade = parseInt(seletorDificuldade.value); // Velocidade inicial definida no seletor


// ---------- Função inicial do jogo ----------
function iniciar() {
  // Recupera recorde salvo no navegador
  recorde = parseInt(localStorage.getItem('minhoquinhaRecorde') || '0');
  recordeElemento.textContent = recorde;

  reiniciarJogo();
  desenhar();
  mostrarOverlay('Pronto! Clique em Iniciar');
}


// ---------- Reinicia variáveis sem iniciar o jogo imediatamente ----------
function reiniciarJogo() {
  const inicioX = Math.floor(COLUNAS / 2);
  const inicioY = Math.floor(LINHAS / 2);
  
  cobra = [
    { x: inicioX, y: inicioY },
    { x: inicioX - 1, y: inicioY },
    { x: inicioX - 2, y: inicioY }
  ];

  direcao = { x: 1, y: 0 }; // Começa indo para a direita
  proximaDirecao = { ...direcao };
  posicionarComida();
  pontuacao = 0;
  placarElemento.textContent = pontuacao;
  rodando = false;
  clearInterval(intervaloJogo);
}


// ---------- Posiciona a comida em lugar livre ----------
function posicionarComida() {
  while (true) {
    const x = Math.floor(Math.random() * COLUNAS);
    const y = Math.floor(Math.random() * LINHAS);

    if (!cobra.some(parte => parte.x === x && parte.y === y)) {
      comida = { x, y };
      break;
    }
  }
}


// ---------- Inicia o jogo de fato ----------
function iniciarJogo() {
  if (rodando) return; // Se já estiver jogando, não inicia novamente
  rodando = true;

  overlay.style.pointerEvents = 'none';
  esconderOverlay();
  velocidade = parseInt(seletorDificuldade.value);

  const intervaloMs = Math.round(1000 / velocidade);
  intervaloJogo = setInterval(tick, intervaloMs);

  textoOverlay.textContent = 'Jogo em andamento';
}


// ---------- Pausa o jogo ----------
function pausarJogo() {
  if (!rodando) {
    mostrarOverlay('Pausado');
    return;
  }
  rodando = false;
  clearInterval(intervaloJogo);
  mostrarOverlay('Pausado');
}


// ---------- Reinicia e joga novamente ----------
function reiniciarPartida() {
  reiniciarJogo();
  iniciarJogo();
}


// ---------- Motor do jogo: executa a cada intervalo ----------
function tick() {

  // Atualiza direção (evita voltar para o lado oposto instantaneamente)
  if ((proximaDirecao.x !== -direcao.x || proximaDirecao.y !== -direcao.y)) {
    direcao = { ...proximaDirecao };
  }

  // Calcula nova posição da cabeça
  const cabeca = { x: cobra[0].x + direcao.x, y: cobra[0].y + direcao.y };

  // Se bater na parede → Game Over
  if (cabeca.x < 0 || cabeca.x >= COLUNAS || cabeca.y < 0 || cabeca.y >= LINHAS) {
    fimDeJogo();
    return;
  }

  // Se bater no próprio corpo → Game Over
  if (cobra.some(parte => parte.x === cabeca.x && parte.y === cabeca.y)) {
    fimDeJogo();
    return;
  }

  // Adiciona nova cabeça da cobra
  cobra.unshift(cabeca);

  // Se comer a comida
  if (cabeca.x === comida.x && cabeca.y === comida.y) {
    pontuacao += 10;
    placarElemento.textContent = pontuacao;
    posicionarComida();

    // Ajusta velocidade conforme dificuldade
    clearInterval(intervaloJogo);
    const novoIntervalo = Math.round(1000 / velocidade);
    intervaloJogo = setInterval(tick, novoIntervalo);
  } else {
    cobra.pop(); // Remove o último bloco se não comer
  }

  desenhar();
}


// ---------- Tela de Game Over ----------
function fimDeJogo() {
  clearInterval(intervaloJogo);
  rodando = false;
  mostrarOverlay('Fim de jogo – Clique em Reiniciar');

  // Salva recorde se for maior
  if (pontuacao > recorde) {
    recorde = pontuacao;
    localStorage.setItem('minhoquinhaRecorde', recorde);
    recordeElemento.textContent = recorde;
    textoOverlay.textContent = 'Novo recorde! Parabéns!';
  }
}


// ---------- Desenha cobra, comida e grade ----------
function desenhar() {
  // Limpa o canvas
  pincel.clearRect(0, 0, tela.width, tela.height);

  // Grade do fundo
  pincel.lineWidth = 1;
  pincel.strokeStyle = 'rgba(255,255,255,0.02)';
  for (let i = 0; i <= COLUNAS; i++) {
    pincel.beginPath();
    pincel.moveTo(i * TAMANHO_BLOCO, 0);
    pincel.lineTo(i * TAMANHO_BLOCO, tela.height);
    pincel.stroke();
  }
  for (let j = 0; j <= LINHAS; j++) {
    pincel.beginPath();
    pincel.moveTo(0, j * TAMANHO_BLOCO);
    pincel.lineTo(tela.width, j * TAMANHO_BLOCO);
    pincel.stroke();
  }

  // Desenha comida
  desenharQuadrado(comida.x, comida.y, TAMANHO_BLOCO, '#ff0000ff', 4);

  // Desenha cobra
  for (let i = cobra.length - 1; i >= 0; i--) {
    const parte = cobra[i];
    const ehCabeca = i === 0;
    const cor = ehCabeca ? '#00ffbf' : '#00d1b2';
    desenharQuadrado(parte.x, parte.y, TAMANHO_BLOCO, cor, ehCabeca ? 6 : 0);
  }
}


// ---------- Função auxiliar para desenhar quadrados ----------
function desenharQuadrado(cx, cy, tamanho, cor, bordaArred = 0) {
  const x = cx * tamanho;
  const y = cy * tamanho;
  const raio = Math.min(bordaArred, tamanho / 2);

  pincel.fillStyle = cor;
  if (raio > 0) {
    arredondarRetangulo(pincel, x + 2, y + 2, tamanho - 4, tamanho - 4, raio);
    pincel.fill();
  } else {
    pincel.fillRect(x + 2, y + 2, tamanho - 4, tamanho - 4);
  }
}


// ---------- Desenha retângulo com bordas arredondadas ----------
function arredondarRetangulo(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}


// ---------- Controles pelo teclado ----------
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') definirDirecao(0, -1);
  if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') definirDirecao(0, 1);
  if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') definirDirecao(-1, 0);
  if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') definirDirecao(1, 0);

  // Barra de espaço pausa ou continua
  if (e.key === ' ') rodando ? pausarJogo() : iniciarJogo();
});


// ---------- Atualiza direção da cobra ----------
function definirDirecao(x, y) {
  if (direcao.x === -x && direcao.y === -y) return; // Evita movimento inverso
  proximaDirecao = { x, y };
}


// ---------- Botões do mouse e celular ----------
botaoIniciar.addEventListener('click', iniciarJogo);
botaoPausar.addEventListener('click', pausarJogo);
botaoReiniciar.addEventListener('click', reiniciarPartida);

seletorDificuldade.addEventListener('change', () => {
  velocidade = parseInt(seletorDificuldade.value);
  if (rodando) {
    clearInterval(intervaloJogo);
    const novoIntervalo = Math.round(1000 / velocidade);
    intervaloJogo = setInterval(tick, novoIntervalo);
  }
});

// Botões direcionais para mobile
botoesMobile.forEach(botao => {
  botao.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const direcaoAtrib = botao.getAttribute('data-dir');
    direcaoMobile(direcaoAtrib);
  });
  botao.addEventListener('mousedown', () => {
    const direcaoAtrib = botao.getAttribute('data-dir');
    direcaoMobile(direcaoAtrib);
  });
});

function direcaoMobile(d) {
  switch (d) {
    case 'up': definirDirecao(0, -1); break;
    case 'down': definirDirecao(0, 1); break;
    case 'left': definirDirecao(-1, 0); break;
    case 'right': definirDirecao(1, 0); break;
  }
}


// ---------- Overlay (telas de pausa, game over, início) ----------
function mostrarOverlay(texto) {
  overlay.style.pointerEvents = 'auto';
  textoOverlay.textContent = texto;
  overlay.style.display = 'flex';
}

function esconderOverlay() {
  overlay.style.pointerEvents = 'none';
  overlay.style.display = 'none';
}


// ---------- Renderização quando a tela é redimensionada ----------
window.addEventListener('resize', desenhar);


// ---------- Inicia o jogo quando a página carrega ----------
iniciar();