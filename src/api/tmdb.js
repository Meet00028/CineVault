import axios from 'axios';
import { TMDB_API_KEY } from '@env';

import { TMDB } from '../constants/api';

const cache = new Map();

const client = axios.create({
  baseURL: TMDB.BASE_URL,
  headers: {
    accept: 'application/json'
  },
  timeout: 15000
});

client.interceptors.request.use((config) => {
  config.params = {
    ...(config.params || {}),
    api_key: TMDB_API_KEY,
    include_adult: false
  };
  return config;
});

function makeCacheKey(config) {
  const url = config.url || '';
  const method = config.method || 'get';
  const params = config.params || {};
  return `${method}:${url}?${JSON.stringify(params)}`;
}

async function requestCached(config, { signal } = {}) {
  const key = makeCacheKey(config);
  if (cache.has(key)) return cache.get(key);

  const promise = client({
    ...config,
    signal
  }).then((res) => res.data);

  cache.set(key, promise);
  try {
    const data = await promise;
    return data;
  } catch (e) {
    cache.delete(key);
    throw e;
  }
}

export function clearTmdbCache() {
  cache.clear();
}

export const tmdb = {
  trendingWeek: (opts = {}) =>
    requestCached({ url: TMDB.endpoints.trendingWeek, method: 'get' }, opts),
  topRated: (page = 1, opts = {}) =>
    requestCached(
      { url: TMDB.endpoints.topRated, method: 'get', params: { page } },
      opts
    ),
  upcoming: (page = 1, opts = {}) =>
    requestCached(
      { url: TMDB.endpoints.upcoming, method: 'get', params: { page } },
      opts
    ),
  searchMovies: ({ query, page = 1, year }, opts = {}) =>
    requestCached(
      {
        url: TMDB.endpoints.searchMovie,
        method: 'get',
        params: {
          query,
          page,
          ...(year ? { year } : {})
        }
      },
      opts
    ),
  genres: (opts = {}) =>
    requestCached({ url: TMDB.endpoints.genres, method: 'get' }, opts),

  movieDetails: (id, opts = {}) =>
    requestCached({ url: `/movie/${id}`, method: 'get' }, opts),
  movieCredits: (id, opts = {}) =>
    requestCached({ url: `/movie/${id}/credits`, method: 'get' }, opts),
  movieVideos: (id, opts = {}) =>
    requestCached({ url: `/movie/${id}/videos`, method: 'get' }, opts),
  movieSimilar: (id, page = 1, opts = {}) =>
    requestCached(
      { url: `/movie/${id}/similar`, method: 'get', params: { page } },
      opts
    )
};

export function posterUrl(path) {
  if (!path) return null;
  return `${TMDB.IMAGE_BASE_W500}${path}`;
}

export function backdropUrl(path) {
  if (!path) return null;
  return `${TMDB.IMAGE_BASE_ORIGINAL}${path}`;
}

