import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function WordBookScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📘 Từ vựng đã lưu</Text>
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
