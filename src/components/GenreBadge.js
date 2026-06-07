import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

export default function GenreBadge({ label, style }) {
  if (!label) return null;
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radii.badge,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm
  },
  text: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.bodyMedium,
    fontSize: 12
  }
});

