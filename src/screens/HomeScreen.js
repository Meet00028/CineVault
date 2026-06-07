import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { tmdb } from '../api/tmdb';
import { MovieContext } from '../context/MovieContext';
import { theme } from '../constants/theme';
import HeroSection, { HERO_HEIGHT } from '../components/HeroSection';
import MovieCard, { CARD_HEIGHT, CARD_WIDTH } from '../components/MovieCard';
import { SkeletonBox, SkeletonRow } from '../components/Loader';

function Section({ title, data, loading, onPressMovie, onEndReached }) {
  const itemLength = CARD_WIDTH + theme.spacing.md;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {loading ? (
        <SkeletonRow count={6} itemWidth={CARD_WIDTH} itemHeight={CARD_HEIGHT} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
          renderItem={({ item }) => <MovieCard movie={item} onPress={onPressMovie} />}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
          onEndReachedThreshold={0.6}
          onEndReached={onEndReached}
          getItemLayout={(_, index) => ({
            length: itemLength,
            offset: itemLength * index,
            index
          })}
        />
      )}
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { setGenres, genresById, toggleWatchlist } = useContext(MovieContext);

  const abortRef = useRef(null);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [topRatedPage, setTopRatedPage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);

  const [heroTagline, setHeroTagline] = useState('');
  const [heroTrailerKey, setHeroTrailerKey] = useState(null);
  const [showHeroTrailer, setShowHeroTrailer] = useState(false);

  const heroMovie = trending?.[0] || null;
  const heroGenres = useMemo(() => {
    if (!heroMovie?.genre_ids?.length) return [];
    return heroMovie.genre_ids.map((id) => genresById.get(id)).filter(Boolean);
  }, [heroMovie, genresById]);

  const onPressMovie = (movie) => {
    if (!movie?.id) return;
    navigation.navigate('MovieDetail', { movieId: movie.id });
  };

  const fetchAll = async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const [genresRes, trendingRes, topRes, upcomingRes] = await Promise.all([
        tmdb.genres({ signal: controller.signal }),
        tmdb.trendingWeek({ signal: controller.signal }),
        tmdb.topRated(1, { signal: controller.signal }),
        tmdb.upcoming(1, { signal: controller.signal })
      ]);

      const genreList = genresRes?.genres || [];
      setGenres(genreList);

      const trendingList = trendingRes?.results || [];
      setTrending(trendingList);
      setTopRated(topRes?.results || []);
      setUpcoming(upcomingRes?.results || []);
      setTopRatedPage(1);
      setUpcomingPage(1);

      // Hero details for tagline
      const hero = trendingList?.[0];
      if (hero?.id) {
        const details = await tmdb.movieDetails(hero.id, { signal: controller.signal });
        setHeroTagline(details?.tagline || '');
      } else {
        setHeroTagline('');
      }

      setHeroTrailerKey(null);
      setShowHeroTrailer(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAll();
    } finally {
      setRefreshing(false);
    }
  };

  const fetchHeroTrailer = async () => {
    if (!heroMovie?.id) return;
    setShowHeroTrailer(true);
    if (heroTrailerKey) return;
    const controller = new AbortController();
    try {
      const videos = await tmdb.movieVideos(heroMovie.id, { signal: controller.signal });
      const ytTrailer = (videos?.results || []).find(
        (v) => v.site === 'YouTube' && v.type === 'Trailer'
      );
      setHeroTrailerKey(ytTrailer?.key || null);
    } catch {
      setHeroTrailerKey(null);
    }
    return () => controller.abort();
  };

  const loadMoreTopRated = async () => {
    // light debounce guard
    if (loading) return;
    const next = topRatedPage + 1;
    setTopRatedPage(next);
    try {
      const res = await tmdb.topRated(next);
      setTopRated((prev) => [...prev, ...(res?.results || [])]);
    } catch {
      // ignore
    }
  };

  const loadMoreUpcoming = async () => {
    if (loading) return;
    const next = upcomingPage + 1;
    setUpcomingPage(next);
    try {
      const res = await tmdb.upcoming(next);
      setUpcoming((prev) => [...prev, ...(res?.results || [])]);
    } catch {
      // ignore
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl tintColor={theme.colors.primary} refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {loading ? (
        <SkeletonBox width="100%" height={HERO_HEIGHT} radius={0} />
      ) : (
        <HeroSection
          movie={heroMovie}
          genres={heroGenres}
          tagline={heroTagline}
          onPressMovie={onPressMovie}
          onPlayTrailer={fetchHeroTrailer}
          onAddWatchlist={() => heroMovie && toggleWatchlist(heroMovie)}
          trailerKey={heroTrailerKey}
          showTrailer={showHeroTrailer}
        />
      )}

      <Section title="Trending Now" data={trending.slice(1, 21)} loading={loading} onPressMovie={onPressMovie} />
      <Section
        title="Top Rated"
        data={topRated}
        loading={loading}
        onPressMovie={onPressMovie}
        onEndReached={loadMoreTopRated}
      />
      <Section
        title="Upcoming Releases"
        data={upcoming}
        loading={loading}
        onPressMovie={onPressMovie}
        onEndReached={loadMoreUpcoming}
      />

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  section: { marginTop: theme.spacing.xl },
  sectionTitle: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingSemi,
    fontSize: 18
  },
  row: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 4
  }
});
