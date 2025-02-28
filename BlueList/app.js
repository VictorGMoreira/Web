var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var axios = require('axios');
var fs = require('fs');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;


// Chave da API do TMDb

// Função para buscar o trailer do YouTube
const getTrailerUrl = async (movieId) => {
  try {
    const videoResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });

    // Encontrar o primeiro vídeo do tipo "Trailer" e no YouTube
    const trailer = videoResponse.data.results.find((video) => video.type === 'Trailer' && video.site === 'YouTube');

    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';
  } catch (error) {
    console.error(`Erro ao buscar trailer para o filme ${movieId}:`, error);
    return '';
  }
};

// Função para obter detalhes do filme por ID
async function getMovieDetailsById(movieId) {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'pt-BR',
        append_to_response: 'videos',
      },
    });

    const movieDetails = response.data;
    
    // Procurar trailer no YouTube
    const trailer = movieDetails.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';

    return {
      title: movieDetails.title,
      image: `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`,
      duration: movieDetails.runtime ? `${Math.floor(movieDetails.runtime / 60)}h ${movieDetails.runtime % 60}m` : 'N/D',
      rating: movieDetails.vote_average.toFixed(1),
      votes: movieDetails.vote_count.toLocaleString(),
      releaseYear: movieDetails.release_date ? movieDetails.release_date.split('-')[0] : 'N/D',
      trailerUrl: trailerUrl,
      overview: movieDetails.overview,
    };
  } catch (error) {
    console.error(`Erro ao buscar detalhes do filme ${movieId}:`, error);
    throw error;
  }
}

// Função para obter detalhes da série por ID
async function getSeriesDetailsById(seriesId) {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/tv/${seriesId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'pt-BR',
        append_to_response: 'videos',
      },
    });

    const seriesDetails = response.data;

    // Procurar trailer no YouTube
    const trailer = seriesDetails.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';

    return {
      title: seriesDetails.name,
      image: `https://image.tmdb.org/t/p/w500${seriesDetails.poster_path}`,
      rating: seriesDetails.vote_average.toFixed(1),
      releaseYear: seriesDetails.first_air_date ? seriesDetails.first_air_date.split('-')[0] : 'N/D',
      trailerUrl: trailerUrl,
      overview: seriesDetails.overview,
    };
  } catch (error) {
    console.error(`Erro ao buscar detalhes da série ${seriesId}:`, error);
    throw error;
  }
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página inicial
app.get('/', async (req, res) => {
  try {
    // Buscar filmes populares
    const response = await axios.get('https://api.themoviedb.org/3/movie/popular', {
      params: {
        api_key: TMDB_API_KEY,
        language: 'pt-BR',
        page: 1,
      },
    });

    // Buscar detalhes do filme (para obter runtime e trailer)
    const movies = await Promise.all(response.data.results.slice(0, 5).map(async (movie) => {
      const detailsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'pt-BR',
          append_to_response: 'videos',
        },
      });

      const movieDetails = detailsResponse.data;

      // Procurar trailer no YouTube
      const trailer = movieDetails.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
      const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';

      return {
        title: movie.title,
        image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        duration: movieDetails.runtime ? `${Math.floor(movieDetails.runtime / 60)}h ${movieDetails.runtime % 60}m` : 'N/D',
        rating: movie.vote_average.toFixed(1),
        votes: movie.vote_count.toLocaleString(),
        releaseYear: movie.release_date ? movie.release_date.split('-')[0] : 'N/D',
        likes: movie.vote_average,
        trailerUrl: trailerUrl,
      };
    }));

    // Renderizar a página com os filmes
    res.render('index', { title: 'BlueList – Início', movies, currentPage: 'home' });
  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    res.status(500).send('Erro ao carregar filmes.');
  }
});

// Rota para /users
app.use('/users', usersRouter);

// Rota para /filmes
app.get('/filmes', async (req, res, next) => {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/movie/popular', {
      params: {
        api_key: TMDB_API_KEY,
        language: 'pt-BR',
        page: 1,
      },
    });

    const movies = await Promise.all(response.data.results.map(async (movie, index) => {
      const trailerUrl = await getTrailerUrl(movie.id);
      return {
        id: movie.id,
        title: movie.title,
        image: `https://image.tmdb.org/t/p/w500${movie.backdrop_path || movie.poster_path}`,
        duration: movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/D',
        rating: movie.vote_average.toFixed(1),
        votes: movie.vote_count.toLocaleString(),
        releaseYear: movie.release_date ? movie.release_date.split('-')[0] : 'N/D',
        position: index + 1,
        trailerUrl: trailerUrl,
      };
    }));

    res.render('filmes', { title: 'Filmes Populares – BlueList', movies, currentPage: 'filmes' });
  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    next(createError(500, 'Erro ao carregar filmes.'));
  }
});

app.get('/detalhesSerie/:id', async (req, res, next) => {
  try {
    const seriesId = req.params.id; // Captura o ID da URL

    if (!seriesId) {
      return next(createError(404, 'Série não encontrada.'));
    }

    // Fazendo a requisição para a API para buscar os detalhes da série
    const response = await axios.get(`https://api.themoviedb.org/3/tv/${seriesId}`, {
      params: {
        api_key: TMDB_API_KEY, // Verifique se a chave API está correta
        language: 'pt-BR',
      },
    });

    if (!response.data) {
      return next(createError(404, 'Detalhes da série não encontrados.'));
    }

    const series = {
      id: response.data.id,
      title: response.data.name,
      image: `https://image.tmdb.org/t/p/w500${response.data.backdrop_path || response.data.poster_path}`,
      overview: response.data.overview,
      rating: response.data.vote_average.toFixed(1),
      releaseYear: response.data.first_air_date ? response.data.first_air_date.split('-')[0] : 'N/D',
      genre: response.data.genres.map((genre) => genre.name).join(', '),
      seasons: response.data.number_of_seasons,
      episodes: response.data.number_of_episodes,
    };

    // Definir o currentPage para a página de Séries
    const currentPage = 'series';

    // Renderizando os detalhes da série
    res.render('detalhesSeries', { title: `${series.title} – BlueList`, series, currentPage });

  } catch (error) {
    console.error('Erro ao buscar detalhes da série:', error);  // Logs para depuração
    next(createError(500, 'Erro ao carregar detalhes da série.'));
  }
});


// Rota para pesquisa
app.get('/pesquisa', async (req, res) => {
  try {
    const query = req.query.q; // Pegando o termo da pesquisa

    if (!query) {
      return res.redirect('/'); // Se não houver pesquisa, redireciona para a página inicial
    }

    // Fazer a requisição à API do TMDb para buscar filmes com base no termo
    const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        language: 'pt-BR',
        page: 1,
      },
    });

    // Processar os filmes retornados pela API
    const movies = await Promise.all(response.data.results.map(async (movie, index) => {
      const trailerUrl = await getTrailerUrl(movie.id);
      return {
        title: movie.title,
        image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        duration: movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/D',
        rating: movie.vote_average.toFixed(1),
        votes: movie.vote_count.toLocaleString(),
        releaseYear: movie.release_date ? movie.release_date.split('-')[0] : 'N/D',
        position: index + 1,
        trailerUrl: trailerUrl,
      };
    }));

    // Renderizar a página de pesquisa com os filmes encontrados
    res.render('pesquisa', {
      title: `Pesquisa: ${query} – BlueList`,
      movies, // Passando os filmes encontrados para a view
      currentPage: 'pesquisa', // Para destacar o link correto no cabeçalho
      query: query, // Passando o termo de pesquisa
    });

  } catch (error) {
    console.error('Erro ao buscar filmes para pesquisa:', error);
    res.status(500).send('Erro ao carregar os resultados da pesquisa.');
  }
});

// Rota para /series
app.get('/series', async (req, res) => {
  try {
    // Buscar séries populares do TMDb
    const response = await axios.get('https://api.themoviedb.org/3/tv/popular', {
      params: {
        api_key: TMDB_API_KEY,
        language: 'pt-BR',
        page: 1,
      },
    });

    // Formatar os dados das séries
    const series = response.data.results.map((tvShow) => ({
      id: tvShow.id,
      title: tvShow.name,
      image: `https://image.tmdb.org/t/p/w780${tvShow.backdrop_path}`,
      poster: `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`,
      overview: tvShow.overview,
      rating: tvShow.vote_average.toFixed(1),
      releaseYear: tvShow.first_air_date ? tvShow.first_air_date.split('-')[0] : 'N/D',
    }));

    // Renderizar a página com as séries
    res.render('series', { title: 'Séries – BlueList', series, currentPage: 'series' });
  } catch (error) {
    console.error('Erro ao buscar séries:', error);
    res.status(500).send('Erro ao carregar séries.');
  }
});

// Rota para /minhaLista
app.get('/minhaLista', (req, res) => {
  const filePathMovies = path.join(__dirname, 'data', 'minhaListaFilmes.json');
  const filePathSeries = path.join(__dirname, 'data', 'minhaListaSeries.json');

  // Lendo os filmes salvos
  fs.readFile(filePathMovies, 'utf8', (err, dataMovies) => {
    if (err) {
      console.error("Erro ao ler o arquivo JSON de filmes:", err);
      return res.status(500).send('Erro ao carregar a lista de filmes.');
    }

    // Lendo as séries salvas
    fs.readFile(filePathSeries, 'utf8', (err, dataSeries) => {
      if (err) {
        console.error("Erro ao ler o arquivo JSON de séries:", err);
        return res.status(500).send('Erro ao carregar a lista de séries.');
      }

      const movies = dataMovies ? JSON.parse(dataMovies) : [];
      const series = dataSeries ? JSON.parse(dataSeries) : [];

      res.render('minhaLista', { 
        title: 'Minha Lista', 
        movies: movies, 
        series: series,
        currentPage: 'minhaLista'
      });
    });
  });
});




// Rota para detalhes do filme
app.get('/detalhesFilme/:id', async (req, res) => {
  try {
    const movieId = req.params.id;
    const movieDetails = await getMovieDetailsById(movieId);
    res.render('detalhesFilmes', {
      movie: movieDetails,
      currentPage: 'detalhesFilme', // Adicionando a variável currentPage
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao carregar os detalhes do filme.");
  }
});

// Rota para salvar série
app.post('/salvarSerie', (req, res) => {
  const { seriesId, title, image, overview } = req.body;
  const newSeries = { seriesId, title, image, overview };

  const filePath = path.join(__dirname, 'data', 'minhaListaSeries.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Erro ao ler o arquivo JSON:", err);
      return res.status(500).send('Erro ao salvar a série.');
    }

    const savedSeries = data ? JSON.parse(data) : [];

    // Verificar se a série já está na lista
    const isAlreadySaved = savedSeries.some(series => series.seriesId === seriesId);

    if (isAlreadySaved) {
      return res.redirect('/minhaLista'); // Redireciona sem adicionar se já estiver na lista
    }

    savedSeries.push(newSeries);

    fs.writeFile(filePath, JSON.stringify(savedSeries, null, 2), (err) => {
      if (err) {
        console.error("Erro ao salvar a série:", err);
        return res.status(500).send('Erro ao salvar a série.');
      }
      res.redirect('/minhaLista'); // Redireciona após salvar
    });
  });
});

// Rota para salvar filme
app.post('/salvarFilme', (req, res) => {
  const { movieId, title, image, overview } = req.body;

  const newMovie = { movieId, title, image, overview };

  const filePath = path.join(__dirname, 'data', 'minhaListaFilmes.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Erro ao ler o arquivo JSON:", err);
      return res.status(500).send('Erro ao carregar sua lista.');
    }

    let savedMovies = data ? JSON.parse(data) : [];

    // Verifica se o filme já está na lista
    const movieExists = savedMovies.some(movie => movie.movieId === movieId);
    if (movieExists) {
      return res.status(400).send('Este filme já foi salvo.');
    }

    savedMovies.push(newMovie);

    fs.writeFile(filePath, JSON.stringify(savedMovies, null, 2), (err) => {
      if (err) {
        console.error("Erro ao salvar o filme:", err);
        return res.status(500).send('Erro ao salvar o filme.');
      }
      res.redirect('/minhaLista'); // Redireciona para 'Minha Lista' após salvar
    });
  });
});


// Rota para remover série
app.post('/removerSerie', (req, res) => {
  const { seriesId } = req.body;

  const filePath = path.join(__dirname, 'data', 'minhaListaSeries.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Erro ao ler o arquivo JSON:", err);
      return res.status(500).send('Erro ao carregar sua lista.');
    }

    let savedSeries = data ? JSON.parse(data) : [];

    // Filtra a série que será removida
    savedSeries = savedSeries.filter(series => series.seriesId !== seriesId);

    fs.writeFile(filePath, JSON.stringify(savedSeries, null, 2), (err) => {
      if (err) {
        console.error("Erro ao remover a série:", err);
        return res.status(500).send('Erro ao remover a série.');
      }
      res.redirect('/minhaLista'); // Redireciona para a página 'Minha Lista' após a remoção
    });
  });
});

// Rota para remover filme
app.post('/removerFilme', (req, res) => {
  const movieId = req.body.movieId; // ID do filme que deve ser removido
  const filePathMovies = path.join(__dirname, 'data', 'minhaListaFilmes.json');

  // Lendo os filmes salvos
  fs.readFile(filePathMovies, 'utf8', (err, dataMovies) => {
    if (err) {
      console.error("Erro ao ler o arquivo JSON de filmes:", err);
      return res.status(500).send('Erro ao carregar a lista de filmes.');
    }

    let movies = dataMovies ? JSON.parse(dataMovies) : [];

    // Remover o filme com o id correspondente
    movies = movies.filter(movie => movie.movieId !== movieId);

    // Atualizando o arquivo de filmes após a remoção
    fs.writeFile(filePathMovies, JSON.stringify(movies, null, 2), (err) => {
      if (err) {
        console.error("Erro ao escrever o arquivo JSON de filmes:", err);
        return res.status(500).send('Erro ao salvar a lista de filmes.');
      }

      // Redirecionando para a página de Minha Lista
      res.redirect('/minhaLista');
    });
  });
});




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
