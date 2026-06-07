import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { backdropUrl } from '../api/tmdb';
import { theme } from '../constants/theme';
import { truncate } from '../utils/helpers';
import GenreBadge from './GenreBadge';
import RatingStars from './RatingStars';
import TrailerPlayer from './TrailerPlayer';

const HERO_HEIGHT = Math.round(Dimensions.get('window').height * 0.55);

export default function HeroSection({
  movie,
  genres = [],
  tagline,
  onPressMovie,
  onPlayTrailer,
  onAddWatchlist,
  trailerKey,
  showTrailer
}) {
  if (!movie) return null;

  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => onPressMovie?.(movie)} style={styles.imageWrap}>
        <Image
          source={backdropUrl(movie?.backdrop_path)}
          style={styles.image}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.0)', 'rgba(10,10,15,0.9)', 'rgba(10,10,15,1)']}
          style={styles.gradient}
        />
        <View style={styles.content}>
          <Text numberOfLines={2} style={styles.title}>
            {movie?.title}
          </Text>
          <Text numberOfLines={2} style={styles.tagline}>
            {truncate(tagline || movie?.overview || '', 110)}
          </Text>
          <View style={styles.badgesRow}>
            {genres.slice(0, 4).map((g) => (
              <GenreBadge key={g} label={g} />
            ))}
          </View>
          <RatingStars rating10={movie?.vote_average} />

          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.primary]} onPress={onPlayTrailer}>
              <Text style={[styles.buttonText, styles.primaryText]}>▶ Play Trailer</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.secondary]} onPress={onAddWatchlist}>
              <Text style={styles.buttonText}>+ Watchlist</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>

      {showTrailer ? (
        <View style={styles.trailerWrap}>
          <TrailerPlayer videoKey={trailerKey} height={220} autoPlay />
        </View>
      ) : null}
    </View>
  );
}

export { HERO_HEIGHT };

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  imageWrap: {
    height: HERO_HEIGHT,
    width: '100%',
    backgroundColor: theme.colors.surface
  },
  image: {
    ...StyleSheet.absoluteFillObject
  },
  gradient: {
    ...StyleSheet.absoluteFillObject
  },
  content: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: theme.spacing.lg,
    right: theme.spacing.lg
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.heading,
    fontSize: 28,
    marginBottom: 6
  },
  tagline: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.body,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: theme.spacing.md
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm
  },
  actions: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md
  },
  primary: {
    backgroundColor: theme.colors.primary
  },
  secondary: {
    backgroundColor: 'rgba(22,22,30,0.75)',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  buttonText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.bodyMedium,
    fontSize: 13
  },
  primaryText: {
    color: theme.colors.textPrimary
  },
  trailerWrap: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg
  }
});

