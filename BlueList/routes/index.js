const express = require('express');
const router = express.Router();
const axios = require('axios');

const TMDB_API_KEY = '93192ab3c95cb6f7c71a326fab54a8a7';

// Função para buscar detalhes do filme, incluindo vídeo (trailer)
async function getMovieDetails(movieId) {
  try {
    const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
      params: { api_key: TMDB_API_KEY, language: 'pt-BR' }
    });

    const videoResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
      params: { api_key: TMDB_API_KEY, language: 'pt-BR' }
    });

    const trailer = videoResponse.data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';

    return {
      title: movieResponse.data.title,
      image: movieResponse.data.poster_path ? `https://image.tmdb.org/t/p/w500${movieResponse.data.poster_path}` : 'https://via.placeholder.com/500x750', // Usando poster_path ou uma imagem de fallback
      trailerUrl: trailerUrl,
      likes: Math.floor(Math.random() * 500), // Simulando curtidas
      duration: movieResponse.data.runtime ? `${Math.floor(movieResponse.data.runtime / 60)}h ${movieResponse.data.runtime % 60}m` : 'N/D', // Exibindo a duração formatada
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes do filme:', error);
    return null;
  }
}

router.get('/', async (req, res) => {
  try {
    const movieIds = [872585, 603692, 667538]; // IDs de exemplo do TMDb

    const movies = await Promise.all(movieIds.map(id => getMovieDetails(id)));

    // Passando o título e os filmes para o template
    res.render('index', { 
      movies,
      title: 'BlueList - Seu catálogo de filmes e séries'  // Definindo o título
    });
  } catch (error) {
    console.error('Erro ao carregar a página:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

module.exports = router;
