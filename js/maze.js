let labirintoAtual = [];
let animacaoVelocidade = 100;
let resolvendo = false; 

function showMessage(message) {
  const msgBox = document.getElementById('message-box');
  const msgText = document.getElementById('message-text');
  msgText.textContent = message;
  msgBox.classList.remove('hidden');
}

document.getElementById('message-close').addEventListener('click', () => {
  document.getElementById('message-box').classList.add('hidden');
});

function gerarLabirinto(largura, altura) {
  // Garante que largura e altura sejam ímpares para um labirinto perfeito
  largura = largura % 2 === 0 ? largura + 1 : largura;
  altura = altura % 2 === 0 ? altura + 1 : altura;
  document.getElementById('largura').value = largura;
  document.getElementById('tamanho').value = altura;

  const labirinto = Array.from({ length: altura }, () => Array(largura).fill(1));

  const direcoes = [ [0, -2], [2, 0], [0, 2], [-2, 0] ];

  function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function dentroDoLimite(x, y) {
    return x >= 0 && y >= 0 && x < altura && y < largura;
  }

  function dfs(x, y) {
    labirinto[x][y] = 0;
    embaralhar(direcoes);

    for (const [dx, dy] of direcoes) {
      const nx = x + dx;
      const ny = y + dy;

      if (dentroDoLimite(nx, ny) && labirinto[nx][ny] === 1) {
        labirinto[x + dx / 2][y + dy / 2] = 0;
        dfs(nx, ny);
      }
    }
  }

  dfs(1, 1);
  labirinto[1][0] = 'S'; 
  labirinto[altura - 2][largura - 1] = 'E'; 

  return labirinto;
}

// Cria a estrutura do grid uma única vez
function criarEstruturaLabirinto(labirinto) {
    const container = document.getElementById('labirinto');
    container.innerHTML = ''; // Limpa o container
    const larguraLabirinto = labirinto[0].length;
    const alturaLabirinto = labirinto.length;
    
    const containerWidth = container.clientWidth;
    let cellSize = Math.floor((containerWidth - (larguraLabirinto * 1)) / larguraLabirinto); // Considera o gap
    if (cellSize < 5) cellSize = 5;
    if (cellSize > 30) cellSize = 30;

    container.style.gridTemplateColumns = `repeat(${larguraLabirinto}, ${cellSize}px)`;
    container.style.gridTemplateRows = `repeat(${alturaLabirinto}, ${cellSize}px)`;

    for (let x = 0; x < alturaLabirinto; x++) {
        for (let y = 0; y < larguraLabirinto; y++) {
            const div = document.createElement('div');
            div.id = `celula-${x}-${y}`; // ID único para cada célula
            div.style.width = `${cellSize}px`;
            div.style.height = `${cellSize}px`;
            container.appendChild(div);
        }
    }
}

// Apenas atualiza as classes, sem reconstruir o DOM
function renderizarLabirinto(labirinto) {
    labirinto.forEach((linha, x) => {
        linha.forEach((celula, y) => {
            const div = document.getElementById(`celula-${x}-${y}`);
            // Remove todas as classes de estado anteriores e mantém 'celula'
            div.className = 'celula'; 
            
            switch (celula) {
                case 1: div.classList.add('parede'); break;
                case 0: div.classList.add('vazio'); break;
                case 'S': div.classList.add('inicio'); break;
                case 'E': div.classList.add('fim'); break;
                case '.': div.classList.add('caminho'); break;
                case 'x': div.classList.add('volta'); break;
            }
        });
    });
}

// Atualiza apenas a célula atual dinamicamente
async function resolverLabirintoAnimado(lab, x, y, visitado) {
    if (resolvendo === false) return; // Permite parar a animação
    const valor = lab[x]?.[y];
    if (valor === undefined || valor === 1 || visitado[x][y]) return false;

    if (valor === 'E') {
      showMessage('Caminho encontrado!');
      resolvendo = false;
      return true;
    }

    visitado[x][y] = true;

    const celulaAtual = document.getElementById(`celula-${x}-${y}`);
    celulaAtual.classList.add('atual');

    if (valor !== 'S') {
        await new Promise(resolve => setTimeout(resolve, animacaoVelocidade));
        celulaAtual.classList.remove('atual');
        celulaAtual.classList.add('caminho');
    }

    const direcoes = [ [1, 0], [-1, 0], [0, 1], [0, -1] ];

    for (const [dx, dy] of direcoes) {
        if (await resolverLabirintoAnimado(lab, x + dx, y + dy, visitado)) {
            return true;
        }
    }
    
    // Se chegou aqui, é um beco sem saída
    await new Promise(resolve => setTimeout(resolve, animacaoVelocidade));
    celulaAtual.classList.remove('atual', 'caminho');
    celulaAtual.classList.add('volta');
    
    return false;
}


document.querySelector('#botao')?.addEventListener('click', () => {
  resolvendo = false; // Para qualquer resolução em andamento
  const altura = Number(document.querySelector('#tamanho')?.value);
  const largura = Number(document.querySelector('#largura')?.value);

  if (isNaN(altura) || isNaN(largura) || altura < 3 || largura < 3) {
    showMessage("Por favor, insira valores válidos (mínimo 3 para ambos)");
    return;
  }

  labirintoAtual = gerarLabirinto(largura, altura);
  criarEstruturaLabirinto(labirintoAtual); // Cria a estrutura
  renderizarLabirinto(labirintoAtual);   // Renderiza o estado inicial
});

document.querySelector('#resolver')?.addEventListener('click', async () => {
  if (!labirintoAtual || labirintoAtual.length === 0) {
    showMessage("Gere o labirinto primeiro!");
    return;
  }
  if (resolvendo) {
      showMessage("Já estou resolvendo!");
      return;
  }
  
  // Limpa caminhos anteriores antes de resolver novamente
  labirintoAtual.forEach((row, r) => {
    row.forEach((cell, c) => {
        if (cell === '.' || cell === 'x') labirintoAtual[r][c] = 0;
    });
  });
  renderizarLabirinto(labirintoAtual);


  const visitado = Array.from({ length: labirintoAtual.length }, () =>
    Array(labirintoAtual[0].length).fill(false)
  );

  let startX, startY;
  for(let i = 0; i < labirintoAtual.length; i++) {
    const j = labirintoAtual[i].indexOf('S');
    if (j > -1) {
      startX = i;
      startY = j;
      break;
    }
  }

  resolvendo = true;
  const sucesso = await resolverLabirintoAnimado(labirintoAtual, startX, startY, visitado);
  if (!sucesso && resolvendo) { // Verifica se não foi cancelado
      showMessage('Caminho não encontrado!');
  }
  resolvendo = false;
});

document.querySelector('#aumentarVelocidade')?.addEventListener('click', () => {
    animacaoVelocidade = Math.max(10, animacaoVelocidade - 20);
});

document.querySelector('#diminuirVelocidade')?.addEventListener('click', () => {
    animacaoVelocidade = Math.min(500, animacaoVelocidade + 20);
});


window.onload = () => {
  document.querySelector('#botao').click(); // Simula o clique para gerar o labirinto inicial
};

// Recalcular o tamanho das células ao redimensionar a janela
window.addEventListener('resize', () => {
    if (labirintoAtual.length > 0) {
        criarEstruturaLabirinto(labirintoAtual);
        renderizarLabirinto(labirintoAtual);
    }
});