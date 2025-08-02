import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LevelProgress() {
  const [level, setLevel] = useState(1);
  const [lesson, setLesson] = useState(1);

  useEffect(() => {
    const loadProgress = async () => {
      const storedLevel = await AsyncStorage.getItem('user_level');
      const storedLesson = await AsyncStorage.getItem('user_lesson');

      setLevel(storedLevel ? parseInt(storedLevel) : 1);
      setLesson(storedLesson ? parseInt(storedLesson) : 1);
    };

    loadProgress();
  }, []);

  const expProgress = (lesson % 3 === 0) ? 1 : ((lesson - 1) % 3) / 3;

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
    marginBottom: 8,
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
    backgroundColor: '#4ade80',
  },
});
