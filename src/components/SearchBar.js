import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { theme } from '../constants/theme';

export default function SearchBar({ value, onChangeText, onClear, placeholder = 'Search movies…' }) {
  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value?.length ? (
        <Pressable onPress={onClear} style={styles.clearBtn}>
          <Text style={styles.clearText}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radii.button,
    paddingHorizontal: theme.spacing.lg,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.body,
    fontSize: 14
  },
  clearBtn: {
    marginLeft: theme.spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  clearText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.bodyMedium
  }
});

