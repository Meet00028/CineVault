import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute } from '@react-navigation/native';

import { backdropUrl, posterUrl, tmdb } from '../api/tmdb';
import GenreBadge from '../components/GenreBadge';
import MovieCard, { CARD_HEIGHT, CARD_WIDTH } from '../components/MovieCard';
import RatingStars from '../components/RatingStars';
import TrailerPlayer from '../components/TrailerPlayer';
import { SkeletonBox } from '../components/Loader';
import { MovieContext } from '../context/MovieContext';
import { theme } from '../constants/theme';
import { formatDate, formatRuntime, truncate } from '../utils/helpers';

export default function MovieDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { movieId } = route.params || {};

  const { genresById, toggleWatchlist, isInWatchlist } = useContext(MovieContext);

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [selectedTrailerKey, setSelectedTrailerKey] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!movieId) return;
    const controller = new AbortController();
    setLoading(true);
    setExpanded(false);

    Promise.all([
      tmdb.movieDetails(movieId, { signal: controller.signal }),
      tmdb.movieCredits(movieId, { signal: controller.signal }),
      tmdb.movieVideos(movieId, { signal: controller.signal }),
      tmdb.movieSimilar(movieId, 1, { signal: controller.signal })
    ])
      .then(([d, c, v, s]) => {
        setDetails(d);
        setCast((c?.cast || []).slice(0, 14));
        const ytTrailers = (v?.results || []).filter(
          (x) => x.site === 'YouTube' && x.type === 'Trailer'
        );
        setTrailers(ytTrailers);
        setSelectedTrailerKey(ytTrailers?.[0]?.key || null);
        setSimilar(s?.results || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [movieId]);

  const genreNames = useMemo(() => {
    if (details?.genres?.length) return details.genres.map((g) => g.name);
    if (details?.genre_ids?.length)
      return details.genre_ids.map((id) => genresById.get(id)).filter(Boolean);
    return [];
  }, [details, genresById]);

  const watchlisted = isInWatchlist(movieId);

  const watchlistPayload = useMemo(() => {
    if (!details) return null;
    return {
      id: details.id,
      title: details.title,
      poster_path: details.poster_path,
      backdrop_path: details.backdrop_path,
      vote_average: details.vote_average,
      release_date: details.release_date
    };
  }, [details]);

  if (loading && !details) {
    return (
      <View style={styles.container}>
        <SkeletonBox width="100%" height={240} radius={0} />
        <View style={{ padding: theme.spacing.lg }}>
          <SkeletonBox width={140} height={18} radius={8} />
          <SkeletonBox width="100%" height={14} radius={8} style={{ marginTop: 10 }} />
          <SkeletonBox width="85%" height={14} radius={8} style={{ marginTop: 10 }} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.backdropWrap}>
        <Image
          source={backdropUrl(details?.backdrop_path)}
          style={styles.backdrop}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>
      </View>

      <View style={styles.topRow}>
        <Image
          source={posterUrl(details?.poster_path)}
          style={styles.poster}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
        <View style={styles.meta}>
          <Text style={styles.title}>{details?.title}</Text>
          <Text style={styles.metaLine}>{formatDate(details?.release_date)}</Text>
          <Text style={styles.metaLine}>{formatRuntime(details?.runtime)}</Text>
          <RatingStars rating10={details?.vote_average} />
          <View style={styles.genreWrap}>
            {genreNames.slice(0, 6).map((g) => (
              <GenreBadge key={g} label={g} />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plot</Text>
        <Text numberOfLines={expanded ? undefined : 4} style={styles.plot}>
          {details?.overview || '—'}
        </Text>
        {(details?.overview || '').length > 140 ? (
          <Pressable onPress={() => setExpanded((v) => !v)}>
            <Text style={styles.readMore}>{expanded ? 'Read less' : 'Read more'}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cast</Text>
        <FlatList
          data={cast}
          keyExtractor={(item) => String(item.cast_id || item.credit_id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
          renderItem={({ item }) => (
            <View style={styles.castItem}>
              <Image
                source={posterUrl(item.profile_path)}
                style={styles.castAvatar}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <Text numberOfLines={1} style={styles.castName}>
                {item.name}
              </Text>
              <Text numberOfLines={1} style={styles.castRole}>
                {truncate(item.character, 18)}
              </Text>
            </View>
          )}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          getItemLayout={(_, index) => ({ length: 96, offset: 96 * index, index })}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.trailerHeader}>
          <Text style={styles.sectionTitle}>Trailer</Text>
          <Pressable
            onPress={() => watchlistPayload && toggleWatchlist(watchlistPayload)}
            style={[styles.heartBtn, watchlisted ? styles.heartOn : null]}
          >
            <Text style={styles.heartText}>{watchlisted ? '♥' : '♡'} Watchlist</Text>
          </Pressable>
        </View>

        {trailers?.length > 1 ? (
          <FlatList
            data={trailers}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setSelectedTrailerKey(item.key)}
                style={[
                  styles.trailerChip,
                  selectedTrailerKey === item.key ? styles.trailerChipSelected : null
                ]}
              >
                <Text style={styles.trailerChipText}>{truncate(item.name, 18)}</Text>
              </Pressable>
            )}
            getItemLayout={(_, index) => ({ length: 150, offset: 150 * index, index })}
          />
        ) : null}

        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          <TrailerPlayer videoKey={selectedTrailerKey} height={220} title="Tap to play" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Similar Movies</Text>
        <FlatList
          data={similar}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
          renderItem={({ item }) => <MovieCard movie={item} onPress={() => navigation.push('MovieDetail', { movieId: item.id })} />}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH + theme.spacing.md,
            offset: (CARD_WIDTH + theme.spacing.md) * index,
            index
          })}
        />
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  backdropWrap: { height: 240, width: '100%', backgroundColor: theme.colors.surface },
  backdrop: { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: theme.spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,10,15,0.65)',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  backBtnText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingSemi,
    fontSize: 26,
    marginTop: -2
  },
  topRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginTop: -64
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: theme.radii.card,
    backgroundColor: theme.colors.surface
  },
  meta: {
    flex: 1,
    marginLeft: theme.spacing.lg
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.heading,
    fontSize: 20,
    marginBottom: theme.spacing.sm
  },
  metaLine: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.body,
    fontSize: 12,
    marginBottom: 4
  },
  genreWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm
  },
  section: {
    marginTop: theme.spacing.xl
  },
  sectionTitle: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingSemi,
    fontSize: 18
  },
  plot: {
    paddingHorizontal: theme.spacing.lg,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.body,
    fontSize: 13,
    lineHeight: 20
  },
  readMore: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    color: theme.colors.primary,
    fontFamily: theme.typography.bodyMedium
  },
  castItem: {
    width: 88,
    marginRight: theme.spacing.md
  },
  castAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm
  },
  castName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.bodyMedium,
    fontSize: 12
  },
  castRole: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.body,
    fontSize: 11
  },
  trailerHeader: {
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md
  },
  heartBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.radii.button,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface
  },
  heartOn: {
    borderColor: theme.colors.primary
  },
  heartText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.bodyMedium,
    fontSize: 12
  },
  trailerChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.radii.badge,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm
  },
  trailerChipSelected: {
    borderColor: theme.colors.primary
  },
  trailerChipText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.bodyMedium,
    fontSize: 12
  }
});
