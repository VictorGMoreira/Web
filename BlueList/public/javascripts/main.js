// Espera o conteúdo da página ser completamente carregado antes de executar o código
document.addEventListener('DOMContentLoaded', () => {
  // Obtém o botão de play a partir do ID
  const playButton = document.getElementById('playButton');

  // Verifica se o botão de play existe
  if (playButton) {
    // Adiciona um evento de clique no botão de play
    playButton.addEventListener('click', () => {
      // Obtém o URL do trailer do botão de play usando o atributo data-trailer
      const trailerUrl = playButton.getAttribute('data-trailer');
      
      // Se houver um URL de trailer, abre-o em uma nova aba, caso contrário, exibe uma mensagem de alerta
      if (trailerUrl) {
        window.open(trailerUrl, '_blank');
      } else {
        alert('Trailer não disponível.');
      }
    });
  }

  // Função para validar e formatar o caminho das imagens
  function getImageUrl(imagePath) {
    const placeholderImage = '/images/placeholder.jpg';  // Caminho da imagem de placeholder
    
    // Se não houver caminho de imagem, retorna a imagem placeholder
    if (!imagePath) return placeholderImage;
    
    // Se o caminho da imagem começa com 'http', retorna o caminho direto; caso contrário, adiciona o prefixo correto
    return imagePath.startsWith('http') ? imagePath : `https://image.tmdb.org/t/p/w500${imagePath}`;
  }

  // Adiciona um evento de clique em todos os itens da seção "A seguir"
  document.querySelectorAll('.next-item').forEach(item => {
    item.addEventListener('click', function() {
      // Obtém os dados do item clicado (imagem, título, likes, duração, trailer)
      const image = getImageUrl(item.getAttribute('data-image'));
      const title = item.getAttribute('data-title');
      const likes = item.getAttribute('data-likes');
      const duration = item.getAttribute('data-duration');
      const trailerUrl = item.getAttribute('data-trailer');

      // Atualiza a imagem principal, título e informações
      document.getElementById('mainImage').src = image;
      document.querySelector('#mainInfo h2').innerText = title;
      document.querySelector('#mainInfo p').innerText = 'Assista ao trailer';
      document.querySelector('.fa-thumbs-up').nextSibling.textContent = ` ${likes}`;
      document.querySelector('#mainFeature .absolute.right-4 span').innerText = `${duration} min`;

      // Atualiza o trailer no botão de play
      const playButton = document.getElementById('playButton');
      playButton.setAttribute('data-trailer', trailerUrl);

      // Move o item clicado para o final da fila "A seguir"
      moveToEndOfQueue(item);
    });
  });

  // Função para mover o filme principal para o final da fila "A seguir"
  function moveToEndOfQueue(item) {
    const mainFeature = document.getElementById('mainFeature');
    const nextItems = document.getElementById('nextItems');

    // Obtém os dados do filme principal
    const mainImageSrc = getImageUrl(document.getElementById('mainImage').src);
    const mainTitle = document.querySelector('#mainInfo h2').innerText;
    const mainLikes = document.querySelector('.fa-thumbs-up').nextSibling.textContent.trim();
    const mainDuration = document.querySelector('#mainFeature .absolute.right-4 span').innerText.trim();
    const mainTrailerUrl = document.getElementById('playButton').getAttribute('data-trailer');

    // Verifica se o filme já está na fila "A seguir"
    const isAlreadyInQueue = Array.from(nextItems.querySelectorAll('img')).some(img => img.getAttribute('data-image') === mainImageSrc);

    // Se o filme não estiver na fila, cria um novo item e adiciona à fila
    if (!isAlreadyInQueue) {
      const newNextItem = document.createElement('div');
      newNextItem.classList.add('relative', 'flex', 'items-center', 'gap-4', 'w-full');
      newNextItem.innerHTML = `
        <img class="w-24 h-24 object-cover cursor-pointer next-item"
          data-image="${mainImageSrc}"
          data-title="${mainTitle}"
          data-likes="${mainLikes}"
          data-duration="${mainDuration}"
          data-trailer="${mainTrailerUrl}"
          alt="${mainTitle}" />
        <div class="text-white">
          <p><strong>${mainTitle}</strong></p>
          <p>${mainDuration} min</p>
          <p>${mainLikes} likes</p>
        </div>
      `;
      nextItems.appendChild(newNextItem);
    }

    // Oculta o filme principal e o mostra novamente com uma animação
    mainFeature.classList.add('hidden');
    setTimeout(() => {
      mainFeature.classList.remove('hidden');
    }, 300);

    // Remove o primeiro item da fila "A seguir"
    if (nextItems.firstChild) {
      nextItems.removeChild(nextItems.firstChild);
    }
  }

  // Navegação com a seta "próximo"
  document.getElementById('next').addEventListener('click', function() {
    const nextItems = document.getElementById('nextItems');
    const firstItem = nextItems.firstElementChild;

    // Se houver um primeiro item na fila "A seguir", move-o para o final e atualiza a imagem principal
    if (firstItem) {
      nextItems.appendChild(firstItem);

      const newMainImage = getImageUrl(firstItem.querySelector('img').getAttribute('data-image'));
      const newMainTitle = firstItem.querySelector('img').getAttribute('data-title');
      const newMainLikes = firstItem.querySelector('img').getAttribute('data-likes');
      const newMainDuration = firstItem.querySelector('img').getAttribute('data-duration');
      const newMainTrailerUrl = firstItem.querySelector('img').getAttribute('data-trailer');

      // Atualiza a imagem principal
      document.getElementById('mainImage').src = newMainImage;
      document.querySelector('#mainInfo h2').innerText = newMainTitle;
      document.querySelector('#mainInfo p').innerText = 'Assista ao trailer';
      document.querySelector('.fa-thumbs-up').nextSibling.textContent = ` ${newMainLikes}`;
      document.querySelector('#mainFeature .absolute.right-4 span').innerText = `${newMainDuration} min`;

      // Atualiza o trailer do botão de play
      document.getElementById('playButton').setAttribute('data-trailer', newMainTrailerUrl);
    }
  });

  // Navegação com a seta "anterior"
  document.getElementById('prev').addEventListener('click', function() {
    const nextItems = document.getElementById('nextItems');
    const lastItem = nextItems.lastElementChild;

    // Se houver um último item na fila "A seguir", move-o para o início e atualiza a imagem principal
    if (lastItem) {
      nextItems.insertBefore(lastItem, nextItems.firstChild);

      const newMainImage = getImageUrl(lastItem.querySelector('img').getAttribute('data-image'));
      const newMainTitle = lastItem.querySelector('img').getAttribute('data-title');
      const newMainLikes = lastItem.querySelector('img').getAttribute('data-likes');
      const newMainDuration = lastItem.querySelector('img').getAttribute('data-duration');
      const newMainTrailerUrl = lastItem.querySelector('img').getAttribute('data-trailer');

      // Atualiza a imagem principal
      document.getElementById('mainImage').src = newMainImage;
      document.querySelector('#mainInfo h2').innerText = newMainTitle;
      document.querySelector('#mainInfo p').innerText = 'Assista ao trailer';
      document.querySelector('.fa-thumbs-up').nextSibling.textContent = ` ${newMainLikes}`;
      document.querySelector('#mainFeature .absolute.right-4 span').innerText = `${newMainDuration} min`;

      // Atualiza o trailer do botão de play
      document.getElementById('playButton').setAttribute('data-trailer', newMainTrailerUrl);
    }
  });
});
