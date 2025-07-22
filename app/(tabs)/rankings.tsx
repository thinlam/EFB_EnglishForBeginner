import { styles } from '@/components/style/RankingsStyles'; // Import styles from the RankingsStyles file
import React from 'react';
import { Text, View } from 'react-native';
export default function RankingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏆 Bảng xếp hạng</Text>
    </View>
  );
}


