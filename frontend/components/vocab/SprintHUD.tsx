import { vocabSprintStyles as S } from '@/components/style/Game/vocabSprint';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

export function SprintHUD({
  timeLeft, score, streak, hearts, bestStreak,
}: {
  timeLeft: number; score: number; streak: number; hearts: number; bestStreak: number;
}) {
  return (
    <View style={S.hudRow}>
      <View style={S.hudPill}>
        <Ionicons name="time" size={16} color="#fff" />
        <Text style={S.hudText}>{timeLeft}s</Text>
      </View>
      <View style={S.hudPill}>
        <Ionicons name="flame" size={16} color="#fff" />
        <Text style={S.hudText}>Streak {streak} (Best {bestStreak})</Text>
      </View>
      <View style={S.hudPill}>
        <Ionicons name="heart" size={16} color="#ff6b6b" />
        <Text style={S.hudText}>{hearts}</Text>
      </View>
      <View style={S.hudPill}>
        <Ionicons name="ribbon" size={16} color="#fff" />
        <Text style={S.hudText}>{score}</Text>
      </View>
    </View>
  );
}
