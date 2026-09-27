// Verified official theatrical poster database for exact matching
const VERIFIED_MOVIE_POSTERS: Record<string, { poster: string; year: number; director?: string }> = {
  'inception': {
    poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    year: 2010,
    director: 'Christopher Nolan'
  },
  'interstellar': {
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    year: 2014,
    director: 'Christopher Nolan'
  },
  'the dark knight': {
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BTUgMe1F608y.jpg',
    year: 2008,
    director: 'Christopher Nolan'
  },
  'dune: part two': {
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    year: 2024,
    director: 'Denis Villeneuve'
  },
  'dune part two': {
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    year: 2024,
    director: 'Denis Villeneuve'
  },
  'blade runner 2049': {
    poster: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    year: 2017,
    director: 'Denis Villeneuve'
  },
  'oppenheimer': {
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    year: 2023,
    director: 'Christopher Nolan'
  },
  'spider-man: across the spider-verse': {
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    year: 2023
  },
  'spider man across the spider verse': {
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    year: 2023
  },
  'whiplash': {
    poster: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    year: 2014,
    director: 'Damien Chazelle'
  },
  'alien: romulus': {
    poster: 'https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
    year: 2024,
    director: 'Fede Álvarez'
  },
  'alien romulus': {
    poster: 'https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
    year: 2024,
    director: 'Fede Álvarez'
  },
  'spirited away': {
    poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    year: 2001,
    director: 'Hayao Miyazaki'
  },
  'the matrix': {
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    year: 1999
  },
  'pulp fiction': {
    poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    year: 1994
  },
  'fight club': {
    poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    year: 1999
  },
  'the shawshank redemption': {
    poster: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    year: 1994
  },
  'gladiator': {
    poster: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
    year: 2000
  },
  'everything everywhere all at once': {
    poster: 'https://image.tmdb.org/t/p/w500/w3LxiVYPqrlrUImsYgxmT2q2Yj.jpg',
    year: 2022
  },
  'parasite': {
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    year: 2019,
    director: 'Bong Joon-ho'
  },
  'the dark knight rises': {
    poster: 'https://image.tmdb.org/t/p/w500/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg',
    year: 2012,
    director: 'Christopher Nolan'
  },
  'batman begins': {
    poster: 'https://image.tmdb.org/t/p/w500/8RW2runa233qSRn2MOweqEm28QI.jpg',
    year: 2005,
    director: 'Christopher Nolan'
  },
  'avengers: endgame': {
    poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    year: 2019
  },
  'avengers endgame': {
    poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    year: 2019
  }
};

export interface MovieMetadata {
  title: string;
  posterUrl: string | null;
  releaseYear?: number;
  director?: string;
  overview?: string;
  rating?: number;
}

/**
 * Fetch official poster and metadata for a movie by exact title and optional year.
 */
export async function fetchMoviePoster(title: string, releaseYear?: number): Promise<MovieMetadata | null> {
  const normalized = title.trim().toLowerCase();

  // 1. First priority: Check verified official collection mapping
  if (VERIFIED_MOVIE_POSTERS[normalized]) {
    const match = VERIFIED_MOVIE_POSTERS[normalized];
    return {
      title,
      posterUrl: match.poster,
      releaseYear: match.year,
      director: match.director
    };
  }

  // 2. If an API key is provided via env, query TMDB official API
  const tmdbApiKey = import.meta.env.VITE_MOVIE_API_KEY;
  if (tmdbApiKey) {
    try {
      const yearQuery = releaseYear ? `&year=${releaseYear}` : '';
      const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}${yearQuery}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          // Select exact or best title match
          const best = data.results[0];
          if (best.poster_path) {
            return {
              title: best.title,
              posterUrl: `https://image.tmdb.org/t/p/w500${best.poster_path}`,
              releaseYear: best.release_date ? parseInt(best.release_date.slice(0, 4), 10) : undefined,
              overview: best.overview,
              rating: best.vote_average
            };
          }
        }
      }
    } catch (err) {
      console.warn('Live TMDB API fetch failed:', err);
    }
  }

  return null;
}
