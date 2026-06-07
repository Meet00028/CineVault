import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CineVault</Text>
      <Text style={styles.body}>
        Browse trending, top-rated, and upcoming movies, watch trailers, and save your favourites to
        a persistent watchlist.
      </Text>
      <Text style={styles.link} onPress={() => Linking.openURL('https://www.themoviedb.org/')}>
        Powered by TMDB
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl
  },
  title: {
    fontFamily: theme.typography.heading,
    fontSize: 28,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md
  },
  body: {
    fontFamily: theme.typography.body,
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20
  },
  link: {
    marginTop: theme.spacing.xl,
    fontFamily: theme.typography.bodyMedium,
    color: theme.colors.primary
  }
});

