import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { getRatingColor } from '../utils/helpers';

export default function RatingStars({ rating10, size = 14, showNumber = true, style }) {
  const rating5 = rating10 ? Math.round((rating10 / 10) * 5) : 0;
  const color = getRatingColor(rating10);

  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.stars, { fontSize: size, color }]}>
        {'★★★★★'.slice(0, rating5)}
        <Text style={[styles.stars, { fontSize: size, color: theme.colors.border }]}>
          {'★★★★★'.slice(rating5)}
        </Text>
      </Text>
      {showNumber ? (
        <Text style={[styles.number, { color }]}>
          {rating10 ? rating10.toFixed(1) : '—'}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  stars: {
    fontFamily: theme.typography.bodyMedium,
    letterSpacing: 1
  },
  number: {
    marginLeft: theme.spacing.sm,
    fontFamily: theme.typography.bodyMedium,
    fontSize: 12
  }
});

