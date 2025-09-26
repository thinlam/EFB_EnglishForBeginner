import { TranslateStyles as S } from '@/components/style/TranslateStyle';
import type { Pron } from '@/services/dictionaryService';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

export function PronPanel({
  word, loading, pron, onSpeak,
}: { word: string; loading: boolean; pron: Pron | null; onSpeak: () => void }) {
  if (!word) return null;
  return (
    <View style={[S.histItem, { marginTop: 8 }]}>
      <View style={S.pronHeader}>
        <Text style={S.pronWord}>{word}</Text>
        <TouchableOpacity onPress={onSpeak}>
          <Text style={S.pronSpeak}>🔊 Phát âm</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={{ marginTop: 8 }}><ActivityIndicator /></View>
      ) : pron ? (
        <View style={{ marginTop: 6 }}>
          {pron.ipa
            ? <Text style={S.pronIPA}>IPA: <Text style={{ fontWeight: '600' }}>{pron.ipa}</Text></Text>
            : <Text style={S.pronHint}>Không tìm thấy phiên âm. Đã bật TTS.</Text>}
        </View>
      ) : (
        <Text style={S.pronHint}>Không tìm thấy dữ liệu phát âm.</Text>
      )}
    </View>
  );
}
