import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LevelProgress() {
  const level = 1;
  const expProgress = 0.0; // 40%

  return (
    <View style={styles.container}>
      <View style={styles.levelInfo}>
        <Text style={styles.badge}>🏅</Text>
        <Text style={styles.levelText}>Level {level}</Text>
      </View>

      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${expProgress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:8,
  },
  badge: {
    fontSize: 24,
    marginRight: 10,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ade80', // xanh lá
  },
});
