import React, { useContext, useMemo } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

import MovieCard from '../components/MovieCard';
import { MovieContext } from '../context/MovieContext';
import { theme } from '../constants/theme';

const SCREEN_PADDING = theme.spacing.lg;
const GAP = theme.spacing.md;
const TILE_WIDTH = Math.floor((Dimensions.get('window').width - SCREEN_PADDING * 2 - GAP) / 2);
const TILE_HEIGHT = Math.floor(TILE_WIDTH * 1.45);
const GRID_ITEM_HEIGHT = TILE_HEIGHT + 40;

function RightAction({ onRemove }) {
  return (
    <Pressable onPress={onRemove} style={styles.removeAction}>
      <Text style={styles.removeText}>Remove</Text>
    </Pressable>
  );
}

export default function WatchlistScreen() {
  const navigation = useNavigation();
  const { watchlist, removeFromWatchlist } = useContext(MovieContext);

  const data = useMemo(() => watchlist || [], [watchlist]);

  const onPressMovie = (movie) => {
    if (!movie?.id) return;
    navigation.navigate('MovieDetail', { movieId: movie.id });
  };

  if (!data.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🍿</Text>
        <Text style={styles.emptyTitle}>Your watchlist is empty</Text>
        <Text style={styles.emptyBody}>Save movies to watch later, even after app restarts.</Text>
        <Pressable style={styles.cta} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.ctaText}>Browse Movies</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: SCREEN_PADDING, gap: GAP }}
        contentContainerStyle={{ paddingTop: theme.spacing.lg, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => (
              <RightAction onRemove={() => removeFromWatchlist(item.id)} />
            )}
          >
            <MovieCard movie={item} onPress={onPressMovie} width={TILE_WIDTH} height={TILE_HEIGHT} />
          </Swipeable>
        )}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
        getItemLayout={(_, index) => ({
          length: GRID_ITEM_HEIGHT,
          offset: GRID_ITEM_HEIGHT * Math.floor(index / 2),
          index
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  removeAction: {
    width: 96,
    marginVertical: 6,
    marginRight: SCREEN_PADDING,
    borderRadius: theme.radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary
  },
  removeText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.bodyMedium
  },
  empty: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyIcon: { fontSize: 56, marginBottom: theme.spacing.md },
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
    lineHeight: 18,
    textAlign: 'center'
  },
  cta: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 12,
    borderRadius: theme.radii.button
  },
  ctaText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.bodyMedium
  }
});
