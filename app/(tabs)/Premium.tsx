import { styles } from '@/components/style/PremiumStyles'; // Import styles from the PremiumStyles file
import React from 'react';
import { Text, View } from 'react-native';

export default function PremiumScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>💎 Premium</Text>
    </View>
  );
}

