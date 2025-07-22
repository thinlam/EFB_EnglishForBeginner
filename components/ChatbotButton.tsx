import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function ChatbotButton() {
  return (
    <TouchableOpacity style={styles.button}>
      <Text style={styles.emoji}>🤖</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 100,
    padding: 12,
    elevation: 5,
  },
  emoji: {
    fontSize: 24,
  },
});
