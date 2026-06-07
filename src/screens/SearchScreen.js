import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { tmdb } from '../api/tmdb';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import { SkeletonBox } from '../components/Loader';
import { MovieContext } from '../context/MovieContext';
import { theme } from '../constants/theme';
import { useSearch } from '../hooks/useSearch';

const SCREEN_PADDING = theme.spacing.lg;
const GAP = theme.spacing.md;
const TILE_WIDTH = Math.floor((Dimensions.get('window').width - SCREEN_PADDING * 2 - GAP) / 2);
const TILE_HEIGHT = Math.floor(TILE_WIDTH * 1.45);
const GRID_ITEM_HEIGHT = TILE_HEIGHT + 40;

function Chip({ label, selected, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected ? styles.chipSelected : null,
        style
      ]}
    >
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

export default function SearchScreen() {
  const navigation = useNavigation();
  const { genres, setGenres, recentSearches, addRecentSearch, clearRecentSearches } =
    useContext(MovieContext);

  const [query, setQuery] = useState('');
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [year, setYear] = useState(null);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return [null, ...Array.from({ length: 5 }, (_, i) => current - i)];
  }, []);

  const { debouncedQuery, results, loading, canSearch } = useSearch({ query, year });

  // Ensure genres are available (Search might be the first screen opened)
  useEffect(() => {
    if (genres?.length) return;
    const controller = new AbortController();
    tmdb
      .genres({ signal: controller.signal })
      .then((res) => setGenres(res?.genres || []))
      .catch(() => {});
    return () => controller.abort();
  }, [genres?.length, setGenres]);

  // Persist recent searches when a real search is performed
  useEffect(() => {
    if (!canSearch) return;
    addRecentSearch(debouncedQuery);
  }, [canSearch, debouncedQuery, addRecentSearch]);

  const filtered = useMemo(() => {
    if (!selectedGenreId) return results;
    return (results || []).filter((m) => (m.genre_ids || []).includes(selectedGenreId));
  }, [results, selectedGenreId]);

  const showRecents = !query?.trim();

  const onPressMovie = (movie) => {
    if (!movie?.id) return;
    navigation.navigate('MovieDetail', { movieId: movie.id });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: SCREEN_PADDING, gap: GAP }}
        contentContainerStyle={{ paddingBottom: 24 }}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View style={styles.stickyHeader}>
            <View style={{ paddingHorizontal: SCREEN_PADDING, paddingTop: theme.spacing.lg }}>
              <SearchBar
                value={query}
                onChangeText={setQuery}
                onClear={() => setQuery('')}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersRow}
            >
              <Chip
                label="All"
                selected={!selectedGenreId}
                onPress={() => setSelectedGenreId(null)}
              />
              {genres.map((g) => (
                <Chip
                  key={g.id}
                  label={g.name}
                  selected={selectedGenreId === g.id}
                  onPress={() => setSelectedGenreId(g.id)}
                />
              ))}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.filtersRow, { paddingTop: 0 }]}
            >
              {years.map((y) => (
                <Chip
                  key={String(y)}
                  label={y ? String(y) : 'All years'}
                  selected={year === y}
                  onPress={() => setYear(y)}
                />
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <MovieCard movie={item} onPress={onPressMovie} width={TILE_WIDTH} height={TILE_HEIGHT} />
        )}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
        getItemLayout={(_, index) => ({
          length: GRID_ITEM_HEIGHT,
          offset: GRID_ITEM_HEIGHT * Math.floor(index / 2),
          index
        })}
        ListEmptyComponent={
          showRecents ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>Recent searches</Text>
              {recentSearches?.length ? (
                <>
                  {recentSearches.map((s) => (
                    <Pressable key={s} style={styles.recentItem} onPress={() => setQuery(s)}>
                      <Text style={styles.recentText}>{s}</Text>
                    </Pressable>
                  ))}
                  <Pressable onPress={clearRecentSearches} style={styles.clearRecentsBtn}>
                    <Text style={styles.clearRecentsText}>Clear</Text>
                  </Pressable>
                </>
              ) : (
                <Text style={styles.emptyBody}>Start typing to search for a movie.</Text>
              )}
            </View>
          ) : loading ? (
            <View style={{ paddingHorizontal: SCREEN_PADDING, paddingTop: theme.spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonBox
                  key={i}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  radius={theme.radii.card}
                  style={{ marginBottom: GAP }}
                />
              ))}
            </View>
          ) : canSearch ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.illustration}>🎬</Text>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyBody}>Try a different title, year, or genre.</Text>
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyBody}>Type at least 2 characters to search.</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  stickyHeader: {
    backgroundColor: theme.colors.background,
    paddingBottom: theme.spacing.md
  },
  filtersRow: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm
  },
  chip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 8,
    borderRadius: theme.radii.badge,
    marginRight: theme.spacing.sm
  },
  chipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(229,9,20,0.15)'
  },
  chipText: {
    fontFamily: theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
    fontSize: 12
  },
  chipTextSelected: {
    color: theme.colors.textPrimary
  },
  emptyWrap: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: theme.spacing.xl
  },
  illustration: {
    fontSize: 52,
    marginBottom: theme.spacing.md
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingSemi,
    fontSize: 18,
    marginBottom: theme.spacing.sm
  },
  emptyBody: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.body,
    fontSize: 13,
    lineHeight: 18
  },
  recentItem: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  recentText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.bodyMedium
  },
  clearRecentsBtn: {
    marginTop: theme.spacing.lg,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: theme.radii.button,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  clearRecentsText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.bodyMedium
  }
});
