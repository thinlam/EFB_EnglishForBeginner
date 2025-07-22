import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PremiumScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>💎 Premium</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
