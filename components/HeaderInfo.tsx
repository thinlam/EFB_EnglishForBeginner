import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function HeaderInfo() {
  return (
    <View style={styles.container}>
      {/* Cờ quốc gia */}
      <Image
        source={{ uri: 'https://flagcdn.com/us.svg' }} // hoặc cờ Việt Nam nếu bạn muốn
        style={styles.flag}
      />

      {/* Năng lượng + tim */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>⚡ 1000</Text>
        <Text style={styles.statusText}>❤️ 10</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  flag: {
    width: 36,
    height: 24,
    borderRadius: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
