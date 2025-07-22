import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function RankingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏆 Bảng xếp hạng</Text>
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
