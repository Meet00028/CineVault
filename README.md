# 🎬 CineVault - Movie Browsing App

A cross-platform React Native movie browsing app built with Expo.
Browse trending, top-rated, and upcoming movies, watch trailers inline,
and save movies to your watchlist.

## Demo

[Insert your screen recording GIF here]

---

## Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | Expo | 54.0.0 |
| Language | React Native | 0.76.x |
| Navigation | React Navigation | 6.x |
| Stack Navigator | @react-navigation/native-stack | 6.x |
| Bottom Tabs | @react-navigation/bottom-tabs | 6.x |
| Video Player | react-native-youtube-iframe | 2.x |
| HTTP Client | Axios | 1.x |
| Fonts | @expo-google-fonts/inter + montserrat | latest |
| Storage | @react-native-async-storage/async-storage | 1.x |

---

## Environment Variables Setup

1. Get a free TMDB API key from: https://www.themoviedb.org/settings/api

2. Create a `.env` file in the project root:
TMDB_API_KEY=your_api_key_here

3. Never commit your `.env` file (it's in `.gitignore`)

---

## Installation & Running

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/cinevault-react-native.git

# Navigate into project
cd cinevault-react-native

# Install dependencies
npm install

# Create .env file and add your TMDB API key (see above)

# Start the app
npx expo start --clear
```

Then scan the QR code with **Expo Go** app on your phone.

---

## Folder Structure
src/
├── api/          → TMDB API calls
├── components/   → Reusable UI components
├── screens/      → Home, Search, Detail, Watchlist
├── navigation/   → App & Tab navigators
├── context/      → Global state management
├── hooks/        → Custom hooks
├── constants/    → Theme, colors, spacing
└── utils/        → Helper functions

---

## Features

- 🏠 Home screen with Hero section + 3 movie carousels
- 🔍 Real-time search with debounce + genre/year filters
- 🎬 Inline YouTube trailer playback
- 📋 Movie detail screen with cast, rating, plot
- ❤️ Persistent watchlist via AsyncStorage

---

## API Reference

- Data Source: [TMDB API](https://www.themoviedb.org/)
- Base URL: `https://api.themoviedb.org/3`
- Images: `https://image.tmdb.org/t/p/w500`
