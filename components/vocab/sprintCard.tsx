import { vocabSprintStyles as S } from '@/components/style/Game/vocabSprint';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export function SprintCard({
  loading, word, shownMeaning, isMatch,
}: {
  loading: boolean; word: string; shownMeaning: string; isMatch: boolean;
}) {
  if (loading) {
    return (
      <View style={S.card}>
        <ActivityIndicator />
        <Text style={S.meaning}>Đang chuẩn bị…</Text>
      </View>
    );
  }
  return (
    <View style={S.card}>
      <Text style={S.word}>{word}</Text>
      <Text style={S.meaning}>{shownMeaning}</Text>
      <View style={S.tag}>
        <Text style={S.tagText}>{isMatch ? 'Match' : 'Mismatch'}</Text>
      </View>
    </View>
  );
}
