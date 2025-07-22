import { styles } from '@/components/style/WorkBookStyles'; // Import styles from the WordBookStyles file
import React from 'react';
import { Text, View } from 'react-native';
export default function WordBookScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📘 Từ vựng đã lưu</Text>
    </View>
  );
}


