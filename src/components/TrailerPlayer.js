import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Platform } from 'react-native';

import { theme } from '../constants/theme';

function youtubeThumb(videoKey) {
  if (!videoKey) return null;
  return `https://img.youtube.com/vi/${videoKey}/hqdefault.jpg`;
}

export default function TrailerPlayer({ videoKey, height = 210, title = 'Trailer', autoPlay = false }) {
  const [playing, setPlaying] = useState(Boolean(autoPlay));

  const thumb = useMemo(() => youtubeThumb(videoKey), [videoKey]);
  if (!videoKey) return null;

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height }]}>
        {playing ? (
          <iframe
            width="100%"
            height={height}
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: theme.radii.card }}
          />
        ) : (
          <Pressable style={styles.thumbWrap} onPress={() => setPlaying(true)}>
            <Image source={thumb} style={styles.thumb} contentFit="cover" transition={200} />
            <View style={styles.overlay}>
              <Text style={styles.play}>▶</Text>
              <Text style={styles.label}>{title}</Text>
            </View>
          </Pressable>
        )}
      </View>
    );
  }

  // For native platforms, we could re-add react-native-youtube-iframe later
  return (
    <View style={[styles.container, { height }]}>
      <Pressable style={styles.thumbWrap} onPress={() => {
        // For native, just open YouTube in browser
        if (Platform.OS !== 'web') {
          import('react-native/Libraries/Linking/Linking').then(({ default: Linking }) => {
            Linking.openURL(`https://www.youtube.com/watch?v=${videoKey}`);
          });
        }
      }}>
        <Image source={thumb} style={styles.thumb} contentFit="cover" transition={200} />
        <View style={styles.overlay}>
          <Text style={styles.play}>▶</Text>
          <Text style={styles.label}>{title}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: theme.radii.card,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  thumbWrap: { flex: 1 },
  thumb: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  play: {
    fontSize: 44,
    color: theme.colors.textPrimary,
    marginBottom: 6
  },
  label: {
    fontFamily: theme.typography.bodyMedium,
    color: theme.colors.textPrimary
  }
});

