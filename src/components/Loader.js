import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { theme } from '../constants/theme';

export function SkeletonBox({ width, height, radius = 12, style }) {
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 700, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius: radius, opacity },
        style
      ]}
    />
  );
}

export function SkeletonRow({ count = 5, itemWidth = 120, itemHeight = 200 }) {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
  return (
    <View style={styles.row}>
      {items.map((i) => (
        <SkeletonBox
          key={i}
          width={itemWidth}
          height={itemHeight}
          radius={theme.radii.card}
          style={{ marginRight: theme.spacing.md }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.surface
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg
  }
});

