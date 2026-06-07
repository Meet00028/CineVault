import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { posterUrl } from '../api/tmdb';
import { theme } from '../constants/theme';
import { getRatingColor } from '../utils/helpers';

export const CARD_WIDTH = 120;
export const CARD_HEIGHT = 200;

function MovieCard({ movie, onPress, style, width = CARD_WIDTH, height = CARD_HEIGHT }) {
  const rating = movie?.vote_average ?? null;
  const ratingColor = getRatingColor(rating);

  return (
    <Pressable
      onPress={() => onPress?.(movie)}
      style={[styles.container, { width }, style]}
    >
      <View style={[styles.posterWrap, { width, height }]}>
        <Image
          source={posterUrl(movie?.poster_path)}
          style={styles.poster}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        <View style={[styles.ratingBadge, { borderColor: ratingColor }]}>
          <Text style={[styles.ratingText, { color: ratingColor }]}>
            {rating ? rating.toFixed(1) : '—'}
          </Text>
        </View>
      </View>
      <Text numberOfLines={2} style={styles.title}>
        {movie?.title || movie?.name || 'Untitled'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: theme.spacing.md
  },
  posterWrap: {
    borderRadius: theme.radii.card,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface
  },
  poster: {
    width: '100%',
    height: '100%'
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(10,10,15,0.75)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999
  },
  ratingText: {
    fontFamily: theme.typography.bodyMedium,
    fontSize: 12
  },
  title: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.bodyMedium,
    fontSize: 12,
    lineHeight: 16
  }
});

export default memo(MovieCard);
