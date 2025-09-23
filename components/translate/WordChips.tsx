import { TranslateStyles as S } from '@/components/style/TranslateStyle';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export function WordChips({ text, onPressWord }: { text: string; onPressWord: (w: string) => void }) {
  if (!text.trim()) return null;
  const parts = text.split(/\s+/);
  return (
    <View style={S.wordChipsRow}>
      {parts.map((w, idx) => (
        <TouchableOpacity key={`${w}-${idx}`} onPress={() => onPressWord(w)} style={[S.chip, { paddingVertical: 6 }]}>
          <Text style={[S.chipText, { fontWeight: '600' }]}>{w}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
