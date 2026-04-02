import { TranslateStyles as S } from '@/components/style/TranslateStyle';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export function HistoryList({ data, onPick }: { data: any[]; onPick: (item: any) => void }) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      ListFooterComponent={<View style={{ height: 16 }} />}
      renderItem={({ item }: any) => (
        <TouchableOpacity style={S.histItem} onPress={() => onPick(item)}>
          <Text style={S.histSmall}>
            {String(item.srcLang).toUpperCase()} → {String(item.tgtLang).toUpperCase()}
          </Text>
          <Text numberOfLines={2} style={{ marginTop: 2 }}>{item.srcText}</Text>
          <Text numberOfLines={2} style={{ marginTop: 4, color: '#111827', fontWeight: '600' }}>
            {item.result}
          </Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={S.hint}>Chưa có lịch sử.</Text>}
    />
  );
}
