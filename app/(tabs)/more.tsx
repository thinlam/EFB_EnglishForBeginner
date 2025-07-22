import { styles } from '@/components/style/MoreStyles'; // Import styles from the MoreStyles file
import React from 'react';
import { Text, View } from 'react-native';
export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>⋯ Menu mở rộng</Text>
    </View>
  );
}

