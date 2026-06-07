# CineVault (Expo / React Native)

Cross‑platform movie browsing app built with **Expo (SDK 50+)** and **React Native**, powered entirely by **TMDB (The Movie Database) API**—no custom backend required.

## Preview
Add your screenshots / screen recordings here:

- `docs/screenshots/home.png`
- `docs/screenshots/search.png`
- `docs/screenshots/detail.png`
- `docs/screenshots/watchlist.png`

## Features
- Hero section with the #1 trending movie (backdrop + gradient overlay)
- Carousels: **Trending**, **Top Rated**, **Upcoming**
- Debounced search with genre + year filters
- Movie detail page: cast, trailers (inline YouTube), similar movies
- Persistent watchlist (AsyncStorage) + swipe-to-remove
- Simple in‑memory request caching to avoid redundant TMDB calls

## Setup
1. Clone the repo
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root:
   ```bash
   TMDB_API_KEY=your_key_here
   ```
4. Run the app:
   ```bash
   npx expo start
   ```

### TMDB API key
Register / create an API key here: https://www.themoviedb.org/settings/api

## Tech stack
- Expo (SDK 54+)
- React Navigation v6 (Stack + Bottom Tabs)
- Axios (TMDB API)
- React Context + useReducer (global state)
- AsyncStorage (watchlist + recent searches)
- expo-image (image caching)
- StyleSheet + design tokens (`src/constants/theme.js`)

## Dependencies (versions)
See `package.json` for the complete list. Key dependencies:
- expo: `^54.0.0`
- react-native: `0.81.5`
- @react-navigation/native: `^6.1.18`
- axios: `^1.7.2`
- expo-image: `~3.0.11`
- @react-native-async-storage/async-storage: `2.2.0`

## Folder structure
```
/src
  /api         → tmdb.js (Axios instance, TMDB calls, in-memory cache)
  /components  → MovieCard, HeroSection, GenreBadge, RatingStars, TrailerPlayer, Loader, SearchBar
  /screens     → HomeScreen, SearchScreen, MovieDetailScreen, WatchlistScreen, AboutScreen
  /navigation  → AppNavigator.js, TabNavigator.js
  /context     → MovieContext.js (watchlist + recent searches persistence)
  /hooks       → useFetch.js, useSearch.js, useDebounce.js
  /constants   → theme.js, api.js
  /utils       → helpers.js (formatting + rating color)
```

## Known limitations / future improvements
- “Search + genre filter” currently filters genres client‑side after the TMDB search endpoint returns results.
  - Future improvement: switch to `/discover/movie` when using advanced filters.
- Trailer playback depends on YouTube availability in the user’s region.
- Add true pagination (infinite scrolling) for all lists (currently implemented for Top Rated + Upcoming on Home).
- Add offline caching for watchlist movie details (optional).

## Credits
This product uses the TMDB API but is not endorsed or certified by TMDB.

