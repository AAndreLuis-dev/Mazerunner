let labirintoAtual = [];
let animacaoVelocidade = 100;

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
  const labirinto = Array.from({ length: altura }, () => Array(largura).fill(1));

  const direcoes = [
    [0, -2], [2, 0], [0, 2], [-2, 0]
  ];

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

  if (altura < 3 || largura < 3) {
    console.error("Dimensões muito pequenas. Mínimo 3x3.");
    return labirinto;
  }

  dfs(1, 1);
  labirinto[1][1] = 'S';

  for (let i = altura - 2; i >= 1; i--) {
    for (let j = largura - 2; j >= 1; j--) {
      if (labirinto[i][j] === 0) {
        labirinto[i][j] = 'E';
        return labirinto;
      }
    }
  }

  return labirinto;
}

function renderizarLabirinto(labirinto, atualX = null, atualY = null) {
  const container = document.getElementById('labirinto');
  container.innerHTML = '';

  const larguraLabirinto = labirinto[0].length;
  const alturaLabirinto = labirinto.length;
  const containerWidth = container.offsetWidth;
  let cellSize = Math.floor(containerWidth / larguraLabirinto) - 1;

  if (cellSize < 5) cellSize = 5;
  if (cellSize > 30) cellSize = 30;

  container.style.gridTemplateColumns = `repeat(${larguraLabirinto}, ${cellSize}px)`;

  labirinto.forEach((linha, x) => {
    linha.forEach((celula, y) => {
      const div = document.createElement('div');
      div.classList.add('celula');
      div.style.width = `${cellSize}px`;
      div.style.height = `${cellSize}px`;

      if (x === atualX && y === atualY) {
        div.classList.add('atual');
      } else if (celula === 1) div.classList.add('parede');
      else if (celula === 0) div.classList.add('vazio');
      else if (celula === 'S') div.classList.add('inicio');
      else if (celula === 'E') div.classList.add('fim');
      else if (celula === '.') div.classList.add('caminho');
      else if (celula === 'x') div.classList.add('volta');

      container.appendChild(div);
    });
  });
  window.addEventListener('resize', () => renderizarLabirinto(labirintoAtual, atualX, atualY));
}

async function resolverLabirintoAnimado(lab, x, y, visitado) {
  const valor = lab[x]?.[y];
  if (valor === undefined || valor === 1 || visitado[x][y]) return false;

  if (valor === 'E') return true;

  visitado[x][y] = true;

  if (valor !== 'S') {
    lab[x][y] = '.';
    renderizarLabirinto(lab, x, y);
    await new Promise(resolve => setTimeout(resolve, animacaoVelocidade));
  }

  const direcoes = [
    [1, 0], [-1, 0], [0, 1], [0, -1]
  ];

  for (const [dx, dy] of direcoes) {
    const nx = x + dx;
    const ny = y + dy;

    if (await resolverLabirintoAnimado(lab, nx, ny, visitado)) {
      return true;
    }
  }

  if (valor !== 'S') {
    lab[x][y] = 'x';
    renderizarLabirinto(lab, x, y);
    await new Promise(resolve => setTimeout(resolve, animacaoVelocidade));
  }

  return false;
}

document.querySelector('#botao')?.addEventListener('click', () => {
  const altura = Number(document.querySelector('#tamanho')?.value);
  const largura = Number(document.querySelector('#largura')?.value);

  if (isNaN(altura) || isNaN(largura) || altura < 3 || largura < 3) {
    showMessage("Por favor, insira valores válidos (mínimo 3 para ambos)");
    return;
  }

  labirintoAtual = gerarLabirinto(largura, altura);
  renderizarLabirinto(labirintoAtual);
});

document.querySelector('#resolver')?.addEventListener('click', () => {
  if (!labirintoAtual || labirintoAtual.length === 0) {
    showMessage("Gere o labirinto primeiro!");
    return;
  }

  const visitado = Array.from({ length: labirintoAtual.length }, () =>
    Array(labirintoAtual[0].length).fill(false)
  );

  const startX = labirintoAtual.findIndex(row => row.includes('S'));
  const startY = labirintoAtual[startX].indexOf('S');

  resolverLabirintoAnimado(labirintoAtual, startX, startY, visitado)
    .then(sucesso => {
      if (!sucesso) showMessage('Caminho não encontrado!');
    });
});

document.querySelector('#aumentarVelocidade')?.addEventListener('click', () => {
    animacaoVelocidade = Math.max(10, animacaoVelocidade - 20);
});

document.querySelector('#diminuirVelocidade')?.addEventListener('click', () => {
    animacaoVelocidade = Math.min(500, animacaoVelocidade + 20);
});


window.onload = () => {
  const altura = Number(document.querySelector('#tamanho')?.value);
  const largura = Number(document.querySelector('#largura')?.value);
  labirintoAtual = gerarLabirinto(largura, altura);
  renderizarLabirinto(labirintoAtual);
};
