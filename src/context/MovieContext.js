import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';

const WATCHLIST_KEY = '@cinevault_watchlist';
const RECENTS_KEY = '@cinevault_recent_searches';

const initialState = {
  watchlist: [],
  genres: [], // {id, name}
  recentSearches: []
};

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE_WATCHLIST':
      return { ...state, watchlist: action.payload || [] };
    case 'ADD_TO_WATCHLIST': {
      const exists = state.watchlist.some((m) => m.id === action.payload.id);
      if (exists) return state;
      return { ...state, watchlist: [action.payload, ...state.watchlist] };
    }
    case 'REMOVE_FROM_WATCHLIST':
      return { ...state, watchlist: state.watchlist.filter((m) => m.id !== action.payload) };
    case 'SET_GENRES':
      return { ...state, genres: action.payload || [] };
    case 'HYDRATE_RECENTS':
      return { ...state, recentSearches: action.payload || [] };
    case 'ADD_RECENT_SEARCH': {
      const q = (action.payload || '').trim();
      if (!q) return state;
      const next = [q, ...state.recentSearches.filter((s) => s.toLowerCase() !== q.toLowerCase())];
      return { ...state, recentSearches: next.slice(0, 10) };
    }
    case 'CLEAR_RECENTS':
      return { ...state, recentSearches: [] };
    default:
      return state;
  }
}

export const MovieContext = createContext(null);

export function MovieProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate persisted state
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [watchRaw, recentsRaw] = await Promise.all([
          AsyncStorage.getItem(WATCHLIST_KEY),
          AsyncStorage.getItem(RECENTS_KEY)
        ]);
        if (!mounted) return;
        dispatch({ type: 'HYDRATE_WATCHLIST', payload: watchRaw ? JSON.parse(watchRaw) : [] });
        dispatch({ type: 'HYDRATE_RECENTS', payload: recentsRaw ? JSON.parse(recentsRaw) : [] });
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Persist watchlist
  useEffect(() => {
    AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(state.watchlist)).catch(() => {});
  }, [state.watchlist]);

  // Persist recent searches
  useEffect(() => {
    AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(state.recentSearches)).catch(() => {});
  }, [state.recentSearches]);

  const addToWatchlist = useCallback((movie) => {
    dispatch({ type: 'ADD_TO_WATCHLIST', payload: movie });
  }, []);

  const removeFromWatchlist = useCallback((movieId) => {
    dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: movieId });
  }, []);

  const toggleWatchlist = useCallback(
    (movie) => {
      const exists = state.watchlist.some((m) => m.id === movie.id);
      if (exists) removeFromWatchlist(movie.id);
      else addToWatchlist(movie);
    },
    [state.watchlist, addToWatchlist, removeFromWatchlist]
  );

  const isInWatchlist = useCallback(
    (movieId) => state.watchlist.some((m) => m.id === movieId),
    [state.watchlist]
  );

  const setGenres = useCallback((genres) => {
    dispatch({ type: 'SET_GENRES', payload: genres });
  }, []);

  const genresById = useMemo(() => {
    const map = new Map();
    for (const g of state.genres) map.set(g.id, g.name);
    return map;
  }, [state.genres]);

  const addRecentSearch = useCallback((query) => {
    dispatch({ type: 'ADD_RECENT_SEARCH', payload: query });
  }, []);

  const clearRecentSearches = useCallback(() => {
    dispatch({ type: 'CLEAR_RECENTS' });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      dispatch,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      isInWatchlist,
      setGenres,
      genresById,
      addRecentSearch,
      clearRecentSearches
    }),
    [
      state,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      isInWatchlist,
      setGenres,
      genresById,
      addRecentSearch,
      clearRecentSearches
    ]
  );

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
}

